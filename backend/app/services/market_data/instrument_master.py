from typing import Dict, Any, List, Optional
import re
from concurrent.futures import ThreadPoolExecutor
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.instrument import Instrument
from app.services.market_data.registry import market_registry
from app.services.market_data.universe_provider import GlobalUniverseManager

class GlobalInstrumentMasterRegistry:
    """
    Database-backed Global Instrument Master and Search Engine for SmartVest.
    Supports comprehensive global asset universes, multi-exchange listings,
    exact-first ranking, alias resolutions, and concurrent real-time quote hydration.
    """

    def __init__(self):
        # Auto-seed database if empty on initialization
        try:
            with SessionLocal() as db:
                if db.query(Instrument).count() == 0:
                    GlobalUniverseManager.seed_initial_universe(db)
        except Exception:
            pass

    def get_instrument_by_id(self, identifier: str, db: Optional[Session] = None) -> Optional[Dict[str, Any]]:
        clean_id = identifier.strip()
        close_db = False
        if db is None:
            db = SessionLocal()
            close_db = True

        try:
            # 1. Exact canonical ID or symbol or ticker lookup in DB
            inst = db.query(Instrument).filter(
                (Instrument.canonical_id.ilike(clean_id)) |
                (Instrument.symbol.ilike(clean_id)) |
                (Instrument.ticker.ilike(clean_id))
            ).first()

            if not inst:
                # 2. Search by alias or name match
                all_insts = db.query(Instrument).filter(Instrument.is_active == True).all()
                for item in all_insts:
                    if item.aliases and any(clean_id.lower() == str(a).lower() for a in item.aliases):
                        inst = item
                        break
                    if clean_id.lower() == (item.short_name or "").lower():
                        inst = item
                        break

            if inst:
                return self._serialize_instrument(inst)

            # 3. Dynamic On-Demand Resolution via market quote provider
            quote = market_registry.get_quote(clean_id)
            if quote and quote.get("price") is not None:
                curr = quote.get("currency", "INR" if ".NS" in clean_id or quote.get("exchange") in ["NSE", "BSE", "AMFI"] else "USD")
                mkt = "INDIA" if curr == "INR" else "US"
                return {
                    "id": 999999,
                    "canonicalId": f"{quote.get('exchange', 'AUTO')}:{clean_id.upper()}",
                    "symbol": clean_id.upper(),
                    "providerSymbol": clean_id,
                    "ticker": clean_id.upper(),
                    "name": quote.get("name") or clean_id.upper(),
                    "shortName": clean_id.upper(),
                    "assetType": quote.get("assetType", "STOCK"),
                    "assetClass": quote.get("assetClass", "EQUITY"),
                    "market": mkt,
                    "country": "IN" if mkt == "INDIA" else "US",
                    "exchange": quote.get("exchange", "NSE" if mkt == "INDIA" else "NASDAQ"),
                    "currency": curr,
                    "provider": "DynamicGlobalProvider",
                    "status": "ACTIVE",
                    "category": quote.get("category", "Market Asset"),
                    "riskLevel": "Moderate",
                    "aliases": [clean_id.lower()]
                }
        finally:
            if close_db:
                db.close()

        return None

    def search(
        self,
        query: Optional[str] = None,
        asset_type: Optional[str] = None,
        market: Optional[str] = None,
        exchange: Optional[str] = None,
        country: Optional[str] = None,
        page: int = 1,
        limit: int = 20,
        db: Optional[Session] = None
    ) -> Dict[str, Any]:
        """
        Global Marketplace Search with exact-match ranking, alias discrimination,
        server-side pagination, and parallel live quote hydration.
        """
        close_db = False
        if db is None:
            db = SessionLocal()
            close_db = True

        try:
            search_res = GlobalUniverseManager.search_instruments(
                db=db,
                query=query,
                asset_type=asset_type,
                market=market,
                country=country,
                exchange=exchange,
                page=page,
                limit=limit
            )

            raw_items = search_res["items"]
            total_count = search_res["total"]

            serialized = [self._serialize_instrument(inst) for inst in raw_items]

            # Parallel quote enrichment for low-latency response (<0.35s)
            def fetch_quote(it: Dict[str, Any]) -> Dict[str, Any]:
                item_copy = dict(it)
                try:
                    q = market_registry.get_quote(it["symbol"])
                    item_copy["quote"] = q
                except Exception:
                    item_copy["quote"] = None
                return item_copy

            if serialized:
                with ThreadPoolExecutor(max_workers=min(len(serialized), 12)) as executor:
                    enriched_items = list(executor.map(fetch_quote, serialized))
            else:
                enriched_items = []

            return {
                "items": enriched_items,
                "total": total_count,
                "page": page,
                "limit": limit,
                "totalPages": (total_count + limit - 1) // limit if total_count > 0 else 1,
                "hasMore": search_res["has_next"]
            }
        finally:
            if close_db:
                db.close()

    def get_coverage(self, db: Optional[Session] = None) -> Dict[str, Any]:
        close_db = False
        if db is None:
            db = SessionLocal()
            close_db = True

        try:
            return GlobalUniverseManager.get_coverage_stats(db)
        finally:
            if close_db:
                db.close()

    def _serialize_instrument(self, inst: Instrument) -> Dict[str, Any]:
        return {
            "id": inst.id,
            "canonicalId": inst.canonical_id,
            "figi": inst.figi,
            "symbol": inst.symbol,
            "ticker": inst.ticker,
            "name": inst.name,
            "shortName": inst.short_name or inst.name,
            "assetType": inst.asset_type,
            "assetClass": inst.asset_class,
            "market": inst.market,
            "country": inst.country,
            "exchange": inst.exchange,
            "exchangeMic": inst.exchange_mic,
            "currency": inst.currency,
            "provider": inst.provider,
            "status": inst.status,
            "sector": inst.sector,
            "industry": inst.industry,
            "fundHouse": inst.fund_house,
            "fundCategory": inst.fund_category,
            "isin": inst.isin,
            "benchmark": inst.benchmark,
            "expenseRatio": inst.expense_ratio,
            "riskLevel": inst.risk_level or "Moderate",
            "aliases": inst.aliases or []
        }

instrument_master = GlobalInstrumentMasterRegistry()
