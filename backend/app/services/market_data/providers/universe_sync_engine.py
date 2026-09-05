import logging
import time
import threading
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional, Tuple, Set
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.database import SessionLocal
from app.models.instrument import Instrument
from app.services.market_data.providers.universe_eodhd import eodhd_universe_provider
from app.services.market_data.providers.universe_nse import nse_universe_provider
from app.services.market_data.providers.universe_amfi import amfi_universe_provider
from app.services.market_data.universe_provider import ALL_CANONICAL_SEEDS

logger = logging.getLogger(__name__)

class UniverseSyncEngine:
    """
    Central Orchestrator for Global and Indian Instrument Master Synchronization.
    Coordinates EODHD, NSE, AMFI, and canonical seed catalogs with deduplication,
    batch upserting, provider failure isolation, configurable cooldown, and sync metadata telemetry.
    """

    def __init__(self):
        self._sync_lock = threading.Lock()
        self._last_attempt_at: Optional[str] = None
        self._last_success_at: Optional[str] = None
        self._last_failed_at: Optional[str] = None
        self._cooldown_until: float = 0.0
        self._last_sync_stats: Dict[str, Any] = {
            "status": "IDLE",
            "last_synced_at": None,
            "lastAttemptAt": None,
            "lastSuccessAt": None,
            "lastFailedAt": None,
            "duration_seconds": 0,
            "total_synced": 0,
            "added_count": 0,
            "updated_count": 0,
            "deactivated_count": 0,
            "provider_counts": {},
            "provider_statistics": {},
            "catalog_statistics": {},
            "geographic_counts": {},
            "errors": []
        }

    def get_sync_status(self, db: Optional[Session] = None) -> Dict[str, Any]:
        """Returns comprehensive telemetry including sync stats, provider health, and catalog counts."""
        stats = dict(self._last_sync_stats)
        cooldown_remaining_sec = max(0.0, self._cooldown_until - time.time())
        stats["cooldown_minutes_remaining"] = round(cooldown_remaining_sec / 60, 1)
        stats["cooldown_active"] = cooldown_remaining_sec > 0
        stats["auto_sync_enabled"] = settings.MARKET_UNIVERSE_AUTO_SYNC
        stats["cooldown_configured_minutes"] = settings.MARKET_UNIVERSE_SYNC_COOLDOWN_MINUTES

        # If DB session provided, compute live persisted catalog statistics
        close_db = False
        if db is None:
            try:
                db = SessionLocal()
                close_db = True
            except Exception:
                db = None

        if db:
            try:
                stats["catalog_statistics"] = self._compute_catalog_stats(db)
                stats["geographic_counts"] = self._compute_geo_stats(db)
                stats["total_persisted"] = stats["catalog_statistics"].get("total", stats.get("total_synced", 0))
            except Exception as e:
                logger.debug(f"Error computing live catalog stats: {e}")
            finally:
                if close_db:
                    db.close()

        return stats

    def should_run_auto_sync(self, db: Optional[Session] = None) -> bool:
        """
        Determines whether a background auto-sync should run safely.
        Returns True if:
        1. Auto-sync is enabled AND
        2. Not in active cooldown AND
        3. Database is empty/legacy (<= 60 instruments) OR no recent successful sync exists.
        """
        if not settings.MARKET_UNIVERSE_AUTO_SYNC:
            return False

        if time.time() < self._cooldown_until:
            return False

        close_db = False
        if db is None:
            db = SessionLocal()
            close_db = True

        try:
            total_count = db.query(Instrument).count()
            if total_count <= 60:
                return True
            if not self._last_success_at:
                return True
            return False
        finally:
            if close_db:
                db.close()

    def run_full_sync(
        self,
        db: Optional[Session] = None,
        sync_eodhd: bool = True,
        sync_nse: bool = True,
        sync_amfi: bool = True,
        eodhd_exchanges: Optional[List[str]] = None,
        force: bool = False
    ) -> Dict[str, Any]:
        """
        Executes an end-to-end synchronization across active universe providers with cooldown enforcement.
        Isolates failures across providers so a failure in one provider does not
        abort the sync of others or corrupt existing database records.
        """
        # Enforce cooldown unless force=True
        if not force and time.time() < self._cooldown_until and self._last_sync_stats.get("status") in ["SUCCESS", "PARTIAL_SUCCESS"]:
            logger.info(f"[UniverseSyncEngine] Sync skipped: Cooldown active until {datetime.fromtimestamp(self._cooldown_until, tz=timezone.utc).isoformat()}")
            res = self.get_sync_status(db=db)
            res["status"] = "SKIPPED_COOLDOWN"
            res["message"] = f"Sync skipped: Cooldown active until {datetime.fromtimestamp(self._cooldown_until, tz=timezone.utc).isoformat()}"
            return res

        # Thread-safe acquisition to prevent concurrent synchronization hammers
        if not self._sync_lock.acquire(blocking=False):
            logger.info("[UniverseSyncEngine] Synchronization already in progress by another worker. Skipping.")
            return self.get_sync_status(db=db)

        start_time = time.time()
        self._last_attempt_at = datetime.now(timezone.utc).isoformat()
        self._last_sync_stats["status"] = "SYNCING"
        self._last_sync_stats["lastAttemptAt"] = self._last_attempt_at

        close_db = False
        if db is None:
            db = SessionLocal()
            close_db = True

        errors: List[str] = []
        provider_counts: Dict[str, int] = {}
        provider_statistics: Dict[str, Dict[str, Any]] = {
            "CanonicalSeeds": {"provider": "CanonicalSeeds", "attempted": 1, "received": 0, "normalized": 0, "status": "ACTIVE"},
            "NSE": {"provider": "NSE", "attempted": 1, "received": 0, "normalized": 0, "status": "ACTIVE"},
            "AMFI": {"provider": "AMFI", "attempted": 1, "received": 0, "normalized": 0, "status": "ACTIVE"},
            "EODHD": {"provider": "EODHD", "attempted": 1, "received": 0, "normalized": 0, "status": "ACTIVE" if eodhd_universe_provider.is_configured() else "STANDBY"}
        }
        all_incoming_records: List[Dict[str, Any]] = []

        try:
            # 1. Base Canonical Catalog
            try:
                base_seeds = ALL_CANONICAL_SEEDS
                all_incoming_records.extend(base_seeds)
                provider_counts["CanonicalSeeds"] = len(base_seeds)
                provider_statistics["CanonicalSeeds"]["received"] = len(base_seeds)
                provider_statistics["CanonicalSeeds"]["normalized"] = len(base_seeds)
                provider_statistics["CanonicalSeeds"]["status"] = "SUCCESS"
            except Exception as e:
                err = f"Canonical seeds loading failed: {e}"
                logger.error(err)
                errors.append(err)
                provider_statistics["CanonicalSeeds"]["status"] = "FAILED"
                provider_statistics["CanonicalSeeds"]["error"] = str(e)

            # 2. NSE Ingestion (Equities & ETFs)
            if sync_nse:
                try:
                    nse_items = nse_universe_provider.fetch_all_instruments()
                    all_incoming_records.extend(nse_items)
                    provider_counts["NSE"] = len(nse_items)
                    provider_statistics["NSE"]["received"] = len(nse_items)
                    provider_statistics["NSE"]["normalized"] = len(nse_items)
                    provider_statistics["NSE"]["status"] = "SUCCESS"
                except Exception as e:
                    err = f"NSE universe sync failed: {e}"
                    logger.warning(err)
                    errors.append(err)
                    provider_statistics["NSE"]["status"] = "FAILED"
                    provider_statistics["NSE"]["error"] = str(e)

            # 3. AMFI Mutual Fund Schemes
            if sync_amfi:
                try:
                    amfi_items = amfi_universe_provider.fetch_active_schemes()
                    all_incoming_records.extend(amfi_items)
                    provider_counts["AMFI"] = len(amfi_items)
                    provider_statistics["AMFI"]["received"] = len(amfi_items)
                    provider_statistics["AMFI"]["normalized"] = len(amfi_items)
                    provider_statistics["AMFI"]["status"] = "SUCCESS"
                except Exception as e:
                    err = f"AMFI universe sync failed: {e}"
                    logger.warning(err)
                    errors.append(err)
                    provider_statistics["AMFI"]["status"] = "FAILED"
                    provider_statistics["AMFI"]["error"] = str(e)

            # 4. EODHD Global Universe (US, LSE, XETRA, etc.)
            if sync_eodhd:
                try:
                    if eodhd_universe_provider.is_configured():
                        target_exchanges = eodhd_exchanges or ["US", "LSE", "XETRA"]
                        eodhd_total = 0
                        for ex in target_exchanges:
                            ex_items = eodhd_universe_provider.fetch_exchange_instruments(exchange_code=ex)
                            all_incoming_records.extend(ex_items)
                            eodhd_total += len(ex_items)
                        provider_counts["EODHD"] = eodhd_total
                        provider_statistics["EODHD"]["received"] = eodhd_total
                        provider_statistics["EODHD"]["normalized"] = eodhd_total
                        provider_statistics["EODHD"]["status"] = "SUCCESS"
                    else:
                        logger.info("[EODHD] API key not present, maintaining core global seeds.")
                        provider_counts["EODHD"] = 0
                        provider_statistics["EODHD"]["received"] = 0
                        provider_statistics["EODHD"]["status"] = "STANDBY"
                except Exception as e:
                    err = f"EODHD universe sync failed: {e}"
                    logger.warning(err)
                    errors.append(err)
                    provider_statistics["EODHD"]["status"] = "FAILED"
                    provider_statistics["EODHD"]["error"] = str(e)

            # 5. Deduplicate and Batch Upsert
            added, updated = self._upsert_instruments_batch(db, all_incoming_records)
            db.commit()

            duration = round(time.time() - start_time, 2)
            total_active = db.query(Instrument).filter(Instrument.is_active == True).count()
            self._last_success_at = datetime.now(timezone.utc).isoformat()
            
            # Cooldown configuration
            cooldown_min = getattr(settings, "MARKET_UNIVERSE_SYNC_COOLDOWN_MINUTES", 360)
            self._cooldown_until = time.time() + (cooldown_min * 60)

            self._last_sync_stats = {
                "status": "SUCCESS" if not errors else "PARTIAL_SUCCESS",
                "last_synced_at": self._last_success_at,
                "lastAttemptAt": self._last_attempt_at,
                "lastSuccessAt": self._last_success_at,
                "lastFailedAt": self._last_failed_at,
                "duration_seconds": duration,
                "total_synced": total_active,
                "added_count": added,
                "updated_count": updated,
                "deactivated_count": 0,
                "provider_counts": provider_counts,
                "provider_statistics": provider_statistics,
                "catalog_statistics": self._compute_catalog_stats(db),
                "geographic_counts": self._compute_geo_stats(db),
                "errors": errors
            }
            logger.info(f"[UniverseSyncEngine] Completed sync in {duration}s: added={added}, updated={updated}, total_active={total_active}")

        except Exception as e:
            db.rollback()
            duration = round(time.time() - start_time, 2)
            err_msg = f"Critical error during universe sync: {e}"
            logger.error(err_msg, exc_info=True)
            errors.append(err_msg)
            self._last_failed_at = datetime.now(timezone.utc).isoformat()
            self._cooldown_until = time.time() + 300  # 5-minute backoff cooldown on failure

            self._last_sync_stats = {
                "status": "FAILED",
                "last_synced_at": self._last_success_at,
                "lastAttemptAt": self._last_attempt_at,
                "lastSuccessAt": self._last_success_at,
                "lastFailedAt": self._last_failed_at,
                "duration_seconds": duration,
                "total_synced": 0,
                "added_count": 0,
                "updated_count": 0,
                "deactivated_count": 0,
                "provider_counts": provider_counts,
                "provider_statistics": provider_statistics,
                "catalog_statistics": {},
                "geographic_counts": {},
                "errors": errors
            }
        finally:
            self._sync_lock.release()
            if close_db:
                db.close()

        return self.get_sync_status(db=db)

    def _compute_catalog_stats(self, db: Session) -> Dict[str, int]:
        total = db.query(Instrument).filter(Instrument.is_active == True).count()
        stocks = db.query(Instrument).filter(Instrument.is_active == True, Instrument.asset_type == "STOCK").count()
        etfs = db.query(Instrument).filter(Instrument.is_active == True, Instrument.asset_type == "ETF").count()
        mfs = db.query(Instrument).filter(Instrument.is_active == True, Instrument.asset_type == "MUTUAL_FUND").count()
        indices = db.query(Instrument).filter(Instrument.is_active == True, Instrument.asset_type.in_(["INDEX", "COMMODITY"])).count()
        return {
            "total": total,
            "STOCK": stocks,
            "ETF": etfs,
            "MUTUAL_FUND": mfs,
            "INDEX": indices,
            "COMMODITY": db.query(Instrument).filter(Instrument.is_active == True, Instrument.asset_type == "COMMODITY").count()
        }

    def _compute_geo_stats(self, db: Session) -> Dict[str, int]:
        in_c = db.query(Instrument).filter(Instrument.is_active == True, Instrument.country == "IN").count()
        us_c = db.query(Instrument).filter(Instrument.is_active == True, Instrument.country == "US").count()
        gb_c = db.query(Instrument).filter(Instrument.is_active == True, Instrument.country == "GB").count()
        other_c = db.query(Instrument).filter(Instrument.is_active == True, ~Instrument.country.in_(["IN", "US", "GB"])).count()
        return {
            "IN": in_c,
            "US": us_c,
            "GB": gb_c,
            "OTHER": other_c
        }

    def _upsert_instruments_batch(self, db: Session, raw_records: List[Dict[str, Any]]) -> Tuple[int, int]:
        """
        Deduplicates incoming records and upserts them into the database in optimized batches.
        Deduplication priority:
        1. ISIN (when valid and >= 12 chars)
        2. Canonical ID
        3. Symbol + Exchange
        4. Provider + Provider Symbol
        """
        deduped = self._deduplicate_records(raw_records)
        added_count = 0
        updated_count = 0

        # Load existing index lookups into memory for fast batch lookup
        existing_instruments = db.query(Instrument).all()
        existing_by_canonical: Dict[str, Instrument] = {i.canonical_id.upper(): i for i in existing_instruments if i.canonical_id}
        existing_by_isin: Dict[str, Instrument] = {i.isin.upper(): i for i in existing_instruments if i.isin}
        existing_by_sym_ex: Dict[str, Instrument] = {f"{i.exchange.upper()}:{i.symbol.upper()}": i for i in existing_instruments if i.exchange and i.symbol}

        for record in deduped:
            canonical_id = record.get("canonical_id", "").strip().upper()
            isin = record.get("isin", "").strip().upper() if record.get("isin") else None
            exchange = record.get("exchange", "").strip().upper()
            symbol = record.get("symbol", "").strip().upper()
            sym_ex_key = f"{exchange}:{symbol}"

            matched_inst: Optional[Instrument] = None
            if isin and isin in existing_by_isin:
                matched_inst = existing_by_isin[isin]
            elif canonical_id and canonical_id in existing_by_canonical:
                matched_inst = existing_by_canonical[canonical_id]
            elif sym_ex_key in existing_by_sym_ex:
                matched_inst = existing_by_sym_ex[sym_ex_key]

            if matched_inst:
                # Update non-null fields
                self._update_existing_instrument(matched_inst, record)
                updated_count += 1
            else:
                # Insert new instrument
                new_inst = self._create_new_instrument(record)
                db.add(new_inst)
                if new_inst.canonical_id:
                    existing_by_canonical[new_inst.canonical_id.upper()] = new_inst
                if new_inst.isin:
                    existing_by_isin[new_inst.isin.upper()] = new_inst
                if new_inst.exchange and new_inst.symbol:
                    existing_by_sym_ex[f"{new_inst.exchange.upper()}:{new_inst.symbol.upper()}"] = new_inst
                added_count += 1

            if (added_count + updated_count) % 500 == 0:
                db.flush()

        db.flush()
        return added_count, updated_count

    def _deduplicate_records(self, records: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Deduplicates raw incoming list keeping highest-fidelity metadata.
        """
        unique_records: Dict[str, Dict[str, Any]] = {}
        seen_isins: Set[str] = set()

        for rec in records:
            if not rec or not rec.get("name") or not (rec.get("symbol") or rec.get("canonical_id")):
                continue

            isin = rec.get("isin")
            if isin and len(isin) >= 12:
                isin_upper = isin.upper()
                if isin_upper in seen_isins:
                    # Merge aliases if already seen
                    primary_key = f"ISIN:{isin_upper}"
                    if primary_key in unique_records:
                        existing_aliases = unique_records[primary_key].get("aliases", [])
                        new_aliases = rec.get("aliases", [])
                        unique_records[primary_key]["aliases"] = list(set(existing_aliases + new_aliases))
                    continue
                seen_isins.add(isin_upper)
                unique_records[f"ISIN:{isin_upper}"] = rec
                continue

            canonical = rec.get("canonical_id", "").strip().upper()
            if canonical:
                if canonical in unique_records:
                    existing_aliases = unique_records[canonical].get("aliases", [])
                    new_aliases = rec.get("aliases", [])
                    unique_records[canonical]["aliases"] = list(set(existing_aliases + new_aliases))
                else:
                    unique_records[canonical] = rec
                continue

            sym_ex = f"{rec.get('exchange', 'AUTO').upper()}:{rec.get('symbol', '').upper()}"
            unique_records[sym_ex] = rec

        return list(unique_records.values())

    def _create_new_instrument(self, rec: Dict[str, Any]) -> Instrument:
        canonical_id = rec.get("canonical_id") or f"{rec.get('exchange', 'AUTO')}:{rec.get('symbol', '')}"
        symbol = rec.get("symbol") or rec.get("ticker") or canonical_id
        ticker = rec.get("ticker") or symbol.split(".")[0]

        return Instrument(
            canonical_id=canonical_id,
            figi=rec.get("figi"),
            symbol=symbol,
            ticker=ticker,
            name=rec.get("name") or symbol,
            short_name=rec.get("short_name") or rec.get("name") or symbol,
            asset_type=rec.get("asset_type") or "STOCK",
            asset_class=rec.get("asset_class") or "EQUITY",
            market=rec.get("market") or "INDIA" if rec.get("country") == "IN" else "US",
            country=rec.get("country") or "IN",
            exchange=rec.get("exchange") or "NSE",
            exchange_mic=rec.get("exchange_mic"),
            currency=rec.get("currency") or "INR",
            provider=rec.get("provider") or "UniverseSyncEngine",
            provider_symbol=rec.get("provider_symbol") or symbol,
            status=rec.get("status") or "ACTIVE",
            is_active=rec.get("is_active", True),
            sector=rec.get("sector"),
            industry=rec.get("industry"),
            fund_house=rec.get("fund_house"),
            fund_category=rec.get("fund_category"),
            scheme_code=rec.get("scheme_code"),
            plan=rec.get("plan"),
            option=rec.get("option"),
            nav=rec.get("nav"),
            nav_date=rec.get("nav_date"),
            isin=rec.get("isin"),
            cusip=rec.get("cusip"),
            sedol=rec.get("sedol"),
            benchmark=rec.get("benchmark"),
            expense_ratio=rec.get("expense_ratio"),
            risk_level=rec.get("risk_level") or "Moderate",
            aliases=rec.get("aliases") or []
        )

    def _update_existing_instrument(self, inst: Instrument, rec: Dict[str, Any]):
        """
        Updates non-null attributes of existing instrument and merges aliases.
        """
        if rec.get("name"):
            inst.name = rec["name"]
        if rec.get("short_name"):
            inst.short_name = rec["short_name"]
        if rec.get("isin") and not inst.isin:
            inst.isin = rec["isin"]
        if rec.get("sector") and not inst.sector:
            inst.sector = rec["sector"]
        if rec.get("industry") and not inst.industry:
            inst.industry = rec["industry"]
        if rec.get("fund_house"):
            inst.fund_house = rec["fund_house"]
        if rec.get("fund_category"):
            inst.fund_category = rec["fund_category"]
        if rec.get("scheme_code"):
            inst.scheme_code = rec["scheme_code"]
        if rec.get("plan"):
            inst.plan = rec["plan"]
        if rec.get("option"):
            inst.option = rec["option"]
        if rec.get("nav") is not None:
            inst.nav = rec["nav"]
        if rec.get("nav_date"):
            inst.nav_date = rec["nav_date"]
        if rec.get("benchmark") and not inst.benchmark:
            inst.benchmark = rec["benchmark"]

        # Merge aliases
        new_aliases = rec.get("aliases") or []
        current_aliases = inst.aliases or []
        inst.aliases = list(set(current_aliases + new_aliases))
        inst.is_active = True
        inst.updated_at = datetime.now(timezone.utc)

universe_sync_engine = UniverseSyncEngine()
