import os
import json
import logging
import time
import threading
import urllib.request
from typing import Dict, Any, Optional, List, Tuple

logger = logging.getLogger(__name__)

ANGEL_SCRIP_MASTER_URL = "https://margincalculator.angelbroking.com/OpenAPI_File/files/OpenAPIScripMaster.json"
CACHE_FILE_PATH = os.path.join(os.path.dirname(__file__), ".angel_scrip_master.json")
CACHE_TTL_SECONDS = 86400  # Refresh daily

# Known ETF identification keywords and tickers for dynamic classification
ETF_IDENTIFIERS = {
    "BEES", "ETF", "NIFTYBEES", "GOLDBEES", "BANKBEES", "JUNIORBEES", "MON100",
    "ITBEES", "SILVERBEES", "LIQUIDBEES", "AUTOBEES", "PHARMABEES", "INFRABEES",
    "CPSEETF", "MAFANG", "HDFCNIFTY", "SETFNIF50", "MOM50", "HDFCGOLD"
}


class AngelScripMasterManager:
    """
    Dynamic Angel One Instrument Master manager.
    Downloads, caches, and indexes the official Angel One instrument master from:
    https://margincalculator.angelbroking.com/OpenAPI_File/files/OpenAPIScripMaster.json

    Strict Source-of-Truth Rules:
    1. Zero hardcoded tokens or expected prices.
    2. Identifies exchange + tradingsymbol + symboltoken dynamically.
    3. Strictly rejects mutual fund scheme codes and non-Indian assets.
    """
    _instance = None
    _lock = threading.Lock()

    def __new__(cls):
        with cls._lock:
            if cls._instance is None:
                cls._instance = super(AngelScripMasterManager, cls).__new__(cls)
                cls._instance._initialized = False
            return cls._instance

    def __init__(self):
        if self._initialized:
            return
        self._initialized = True
        self._master_lock = threading.RLock()
        
        # In-memory indexes
        # key: (exch_seg, tradingsymbol) -> scrip dict
        self._by_exchange_symbol: Dict[Tuple[str, str], Dict[str, Any]] = {}
        # key: (exch_seg, name) -> scrip dict (e.g. ('NSE', 'RELIANCE') -> RELIANCE-EQ)
        self._by_exchange_name: Dict[Tuple[str, str], Dict[str, Any]] = {}
        # key: token -> scrip dict
        self._by_token: Dict[str, Dict[str, Any]] = {}
        
        self.total_loaded = 0
        self.last_loaded_at: Optional[float] = None
        self._is_loading = False

        # Load from disk cache or fetch in background
        self.load_master(force_download=False)

    def load_master(self, force_download: bool = False) -> bool:
        """Loads master from local disk cache if fresh; otherwise downloads from official endpoint."""
        with self._master_lock:
            # 1. Try local disk cache if valid and not expired
            if not force_download and os.path.exists(CACHE_FILE_PATH):
                try:
                    file_mtime = os.path.getmtime(CACHE_FILE_PATH)
                    if time.time() - file_mtime < CACHE_TTL_SECONDS and os.path.getsize(CACHE_FILE_PATH) > 100000:
                        logger.info("[AngelScripMaster] Loading instrument master from local disk cache...")
                        with open(CACHE_FILE_PATH, "r", encoding="utf-8") as f:
                            data = json.load(f)
                        if isinstance(data, list) and len(data) > 1000:
                            self._index_instruments(data)
                            self.last_loaded_at = file_mtime
                            logger.info(f"[AngelScripMaster] Loaded and indexed {self.total_loaded} instruments from disk cache.")
                            return True
                except Exception as e:
                    logger.warning(f"[AngelScripMaster] Failed to read disk cache: {e}. Downloading fresh master.")

            # 2. Download from official endpoint
            return self._download_and_index()

    def _download_and_index(self) -> bool:
        """Downloads official OpenAPIScripMaster.json, saves to disk cache, and builds in-memory indexes."""
        logger.info(f"[AngelScripMaster] Downloading official Angel One instrument master from {ANGEL_SCRIP_MASTER_URL}...")
        try:
            req = urllib.request.Request(
                ANGEL_SCRIP_MASTER_URL,
                headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) SmartVest/1.0"}
            )
            with urllib.request.urlopen(req, timeout=45) as resp:
                if resp.status == 200:
                    raw_bytes = resp.read()
                    data = json.loads(raw_bytes.decode("utf-8"))
                    if isinstance(data, list) and len(data) > 1000:
                        # Save to disk cache atomically
                        tmp_path = f"{CACHE_FILE_PATH}.tmp"
                        with open(tmp_path, "w", encoding="utf-8") as f:
                            json.dump(data, f)
                        if os.path.exists(CACHE_FILE_PATH):
                            os.remove(CACHE_FILE_PATH)
                        os.rename(tmp_path, CACHE_FILE_PATH)
                        
                        self._index_instruments(data)
                        self.last_loaded_at = time.time()
                        logger.info(f"[AngelScripMaster] Successfully downloaded and indexed {self.total_loaded} instruments.")
                        return True
        except Exception as e:
            logger.error(f"[AngelScripMaster] Failed to download scrip master: {e}")
            # Fallback: if existing cache exists even if older, use it
            if os.path.exists(CACHE_FILE_PATH):
                try:
                    with open(CACHE_FILE_PATH, "r", encoding="utf-8") as f:
                        data = json.load(f)
                    self._index_instruments(data)
                    logger.info(f"[AngelScripMaster] Used fallback disk cache ({self.total_loaded} instruments).")
                    return True
                except Exception:
                    pass
        return False

    def _index_instruments(self, raw_list: List[Dict[str, Any]]):
        """Indexes NSE and BSE cash segment instruments into memory."""
        by_ex_sym = {}
        by_ex_name = {}
        by_tok = {}

        for item in raw_list:
            exch = item.get("exch_seg")
            if exch not in ("NSE", "BSE"):
                continue  # Cash equity and ETF segments (NSE CM = 1, BSE CM = 3)

            token = str(item.get("token", "")).strip()
            symbol = str(item.get("symbol", "")).strip().upper()
            name = str(item.get("name", "")).strip().upper()
            inst_type_raw = str(item.get("instrumenttype", "")).strip()

            if not token or not symbol:
                continue

            # Skip indices like AMXIDX from regular equity resolution unless specifically requested
            is_index = inst_type_raw == "AMXIDX" or symbol in ("NIFTY", "SENSEX", "BANKNIFTY")

            # Determine Asset Type (STOCK vs ETF)
            is_etf = False
            if not is_index:
                if any(k in symbol or k in name for k in ETF_IDENTIFIERS):
                    is_etf = True
                elif "ETF" in name or "BEES" in name:
                    is_etf = True

            asset_type = "INDEX" if is_index else ("ETF" if is_etf else "STOCK")
            exchange_type = 1 if exch == "NSE" else 3

            raw_tick = float(item.get("tick_size") or 5.0)
            # Angel One tick_size is in paise (e.g. 5.0 paise = 0.05 INR, 10.0 paise = 0.10 INR, 1.0 paise = 0.01 INR)
            tick_size_inr = round(raw_tick / 100.0, 4) if raw_tick >= 1.0 else raw_tick

            record = {
                "token": token,
                "exchange": exch,
                "exchange_type": exchange_type,
                "tradingsymbol": symbol,
                "name": name,
                "asset_type": asset_type,
                "tick_size": tick_size_inr,
                "lot_size": int(item.get("lotsize") or 1),
                "is_cas_enabled": bool(item.get("is_cas_enabled", False)),
                "provider": "Angel One SmartAPI",
                "status": "ACTIVE"
            }

            by_ex_sym[(exch, symbol)] = record
            by_tok[token] = record

            # Index by name (e.g. ('NSE', 'RELIANCE') -> RELIANCE-EQ)
            if name:
                existing = by_ex_name.get((exch, name))
                if not existing:
                    by_ex_name[(exch, name)] = record
                elif symbol.endswith("-EQ") and not existing["tradingsymbol"].endswith("-EQ"):
                    by_ex_name[(exch, name)] = record

        self._by_exchange_symbol = by_ex_sym
        self._by_exchange_name = by_ex_name
        self._by_token = by_tok
        self.total_loaded = len(by_tok)

    def resolve(self, symbol_or_ticker: str, exchange: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """
        Dynamically resolves an Indian Stock or ETF from the official Angel One master.
        No hardcoded tokens.
        Strictly rejects mutual funds and foreign assets.
        """
        if not symbol_or_ticker or not isinstance(symbol_or_ticker, str):
            return None

        clean = symbol_or_ticker.strip().upper()

        # 0. STRICT REJECTION OF MUTUAL FUNDS & NON-EQUITIES
        if (
            clean.startswith("AMFI:")
            or clean.startswith("MF:")
            or clean.startswith("AMFI_")
            or clean == "AMFI"
            or (clean.isdigit() and len(clean) in (5, 6))
        ):
            return None

        # Strip exchange suffixes if present
        target_exch = exchange.upper().strip() if exchange else None
        base_symbol = clean
        if clean.endswith(".NS"):
            base_symbol = clean[:-3]
            if not target_exch:
                target_exch = "NSE"
        elif clean.endswith(".BO"):
            base_symbol = clean[:-3]
            if not target_exch:
                target_exch = "BSE"

        exchanges_to_try = [target_exch] if target_exch else ["NSE", "BSE"]

        with self._master_lock:
            # 1. Exact match on tradingsymbol (e.g. RELIANCE-EQ, MON100-EQ, or RELIANCE)
            for ex in exchanges_to_try:
                # Try exact symbol as provided
                rec = self._by_exchange_symbol.get((ex, clean))
                if rec:
                    return dict(rec)
                
                # Try base_symbol
                rec = self._by_exchange_symbol.get((ex, base_symbol))
                if rec:
                    return dict(rec)

                # Try base_symbol + "-EQ" (Standard NSE series for cash equities and ETFs)
                if not base_symbol.endswith("-EQ"):
                    rec = self._by_exchange_symbol.get((ex, f"{base_symbol}-EQ"))
                    if rec:
                        return dict(rec)

                # Try lookup by name / ticker
                rec = self._by_exchange_name.get((ex, base_symbol))
                if rec:
                    return dict(rec)

            # 2. Check if clean is a direct token in our index
            if clean in self._by_token:
                rec = self._by_token[clean]
                if not target_exch or rec["exchange"] == target_exch:
                    return dict(rec)

        return None

    def get_by_token(self, token: str) -> Optional[Dict[str, Any]]:
        """Returns instrument record by verified token."""
        str_token = str(token).strip()
        with self._master_lock:
            rec = self._by_token.get(str_token)
            return dict(rec) if rec else None


# Global singleton manager instance
angel_scrip_master = AngelScripMasterManager()
