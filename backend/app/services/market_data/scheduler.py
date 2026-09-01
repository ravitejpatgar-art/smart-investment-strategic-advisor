import time
import asyncio
import threading
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone

from app.services.market_data.registry import market_registry
from app.services.market_data.cache import market_cache
from app.services.market_data.market_hours import get_indian_market_status, get_us_market_status
from app.services.market_data.universe_provider import global_equities_provider
from app.services.market_data.instrument_master import instrument_master

logger = logging.getLogger(__name__)

# Key Benchmark Instruments to actively maintain
KEY_SYMBOLS_TO_REFRESH = [
    # US Equities & ETFs
    "AAPL", "NVDA", "MSFT", "GOOGL", "TSLA", "AMZN", "META",
    "SPY", "QQQ", "VOO", "VTI", "TSM", "ASML",
    # Indian Equities & Benchmarks
    "RELIANCE.NS", "TCS.NS", "INFY.NS", "HDFCBANK.NS", "ICICIBANK.NS",
    "NIFTY 50", "SENSEX", "BANKNIFTY",
    # Commodities & Gold
    "GOLD", "SILVER", "GOLDBEES", "MON100",
    # Key Mutual Funds
    "122639", "120716", "120586", "119062", "125354"
]

class MarketDataBackgroundScheduler:
    """
    Automated background worker for live data polling, daily NAV updates,
    and automatic global instrument discovery.
    """
    _instance = None
    _lock = threading.Lock()

    def __new__(cls):
        with cls._lock:
            if cls._instance is None:
                cls._instance = super(MarketDataBackgroundScheduler, cls).__new__(cls)
                cls._instance._running = False
                cls._instance._thread = None
                cls._instance._last_daily_run = None
                cls._instance._refresh_interval_sec = 15  # Real-time polling rate
            return cls._instance

    def start(self):
        if self._running:
            return
        self._running = True
        self._thread = threading.Thread(target=self._run_loop, daemon=True, name="MarketDataScheduler")
        self._thread.start()
        logger.info("MarketDataBackgroundScheduler started.")

    def stop(self):
        self._running = False

    def _run_loop(self):
        while self._running:
            try:
                self._tick()
            except Exception as e:
                logger.error(f"Error in MarketDataScheduler tick: {e}")
            time.sleep(self._refresh_interval_sec)

    def _tick(self):
        in_status = get_indian_market_status()
        us_status = get_us_market_status()
        is_market_active = in_status.get("isOpen") or us_status.get("isOpen")

        # 1. Real-time quote refresh for benchmark universe
        # During market hours: every 15s; Outside market hours: every 60s
        for sym in KEY_SYMBOLS_TO_REFRESH:
            try:
                # Force refresh through registry
                quote = market_registry.get_quote(sym)
                if quote and quote.get("price") is not None:
                    # Update overview cache
                    market_cache.set(f"quote:router:{sym.upper()}", quote, ttl_seconds=30)
            except Exception:
                continue

        # 2. Daily Maintenance Job Check (Run once per calendar date after close)
        now_utc = datetime.now(timezone.utc)
        today_date = now_utc.strftime("%Y-%m-%d")
        if self._last_daily_run != today_date:
            self._run_daily_refresh()
            self._last_daily_run = today_date

    def _run_daily_refresh(self):
        logger.info("Executing Daily Market Fundamentals & NAV Refresh...")
        try:
            # Refresh Market Overview
            market_registry.get_market_overview()
        except Exception as e:
            logger.warning(f"Daily refresh error: {e}")

    def auto_discover_symbol(self, query: str) -> Optional[Dict[str, Any]]:
        """
        Dynamic Universal Discovery Engine:
        When a user searches for an unfamiliar ticker, query live providers
        and dynamically register it into the catalog.
        """
        clean = query.strip().upper()
        if not clean:
            return None

        # Check existing master
        existing = instrument_master.get_instrument_by_id(clean)
        if existing:
            return existing

        # Query provider router
        quote = market_registry.get_quote(clean)
        if quote and quote.get("price") is not None:
            # Dynamically index
            discovered = {
                "canonicalId": f"GLOBAL:{clean}",
                "symbol": clean,
                "ticker": clean,
                "name": quote.get("name") or clean,
                "shortName": clean,
                "assetType": quote.get("assetType", "STOCK"),
                "assetClass": "EQUITY",
                "market": "GLOBAL",
                "country": "US" if quote.get("currency") == "USD" else "IN",
                "exchange": quote.get("exchange", "GLOBAL"),
                "currency": quote.get("currency", "USD"),
                "quote": quote
            }
            # Add to master in-memory cache
            instrument_master._instruments_cache[discovered["canonicalId"]] = discovered
            return discovered

        return None

# Global singleton scheduler
market_scheduler = MarketDataBackgroundScheduler()
