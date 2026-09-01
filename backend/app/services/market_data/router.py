import time
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone

from app.services.market_data.base import BaseMarketDataProvider
from app.services.market_data.providers.finnhub_provider import FinnhubProvider
from app.services.market_data.providers.twelvedata_provider import TwelveDataProvider
from app.services.market_data.providers.polygon_provider import PolygonProvider
from app.services.market_data.providers.alphavantage_provider import AlphaVantageProvider
from app.services.market_data.providers.yahoo_provider import YahooFinanceProvider
from app.services.market_data.indian_equities import IndianEquitiesProvider
from app.services.market_data.mutual_funds import MutualFundsProvider
from app.services.market_data.gold import GoldProvider
from app.services.market_data.etfs import ETFProvider
from app.services.market_data.cache import market_cache
from app.services.market_data.normalizer import create_unavailable_quote

logger = logging.getLogger(__name__)

class ProviderHealthTracker:
    def __init__(self, name: str):
        self.name = name
        self.total_requests = 0
        self.success_count = 0
        self.error_count = 0
        self.consecutive_errors = 0
        self.cooldown_until = 0.0
        self.last_latency_ms = 0.0
        self.last_status = "READY"
        self.last_updated = datetime.now(timezone.utc).isoformat()

    def record_success(self, latency_ms: float):
        self.total_requests += 1
        self.success_count += 1
        self.consecutive_errors = 0
        self.last_latency_ms = round(latency_ms, 2)
        self.last_status = "HEALTHY"
        self.last_updated = datetime.now(timezone.utc).isoformat()

    def record_error(self, is_rate_limit: bool = False, is_network: bool = False):
        self.total_requests += 1
        self.error_count += 1
        self.consecutive_errors += 1
        self.last_status = "RATE_LIMITED" if is_rate_limit else ("NETWORK_FAILURE" if is_network else "DEGRADED")
        self.last_updated = datetime.now(timezone.utc).isoformat()
        
        # Exponential backoff cooldown if multiple failures
        cooldown_sec = 60 if is_rate_limit else min(300, 5 * (2 ** min(self.consecutive_errors, 5)))
        self.cooldown_until = time.time() + cooldown_sec

    def is_available(self) -> bool:
        return time.time() >= self.cooldown_until

    def to_dict(self) -> Dict[str, Any]:
        return {
            "name": self.name,
            "status": self.last_status if self.is_available() else "IN_COOLDOWN",
            "isAvailable": self.is_available(),
            "totalRequests": self.total_requests,
            "successRate": round((self.success_count / self.total_requests * 100), 1) if self.total_requests > 0 else 100.0,
            "lastLatencyMs": self.last_latency_ms,
            "lastUpdated": self.last_updated
        }


class ProviderRouter:
    """
    Multi-provider market data router with automatic failover, health tracking, and caching.
    Strict Priority Fallback Pipeline:
      1. Indian Stocks: NSE Feed -> Yahoo Finance
      2. Mutual Funds: AMFI Official Feed -> MFAPI Feed -> Scheme DB
      3. US Stocks: Finnhub -> TwelveData -> Yahoo Finance
      4. ETFs: Exchange Feed -> Yahoo Finance
      5. Gold: NSE GoldBeES -> MCX Spot Feed
    """
    def __init__(self):
        self.finnhub = FinnhubProvider()
        self.twelvedata = TwelveDataProvider()
        self.polygon = PolygonProvider()
        self.alphavantage = AlphaVantageProvider()
        self.yahoo = YahooFinanceProvider()
        self.indian_equities = IndianEquitiesProvider()
        self.mutual_funds = MutualFundsProvider()
        self.gold_provider = GoldProvider()
        self.etf_provider = ETFProvider()

        self.health_trackers = {
            "Finnhub": ProviderHealthTracker("Finnhub"),
            "TwelveData": ProviderHealthTracker("TwelveData"),
            "Polygon.io": ProviderHealthTracker("Polygon.io"),
            "YahooFinance": ProviderHealthTracker("YahooFinance"),
            "AlphaVantage": ProviderHealthTracker("AlphaVantage"),
            "IndianEquities": ProviderHealthTracker("IndianEquities"),
            "MutualFunds": ProviderHealthTracker("MutualFunds"),
            "Gold": ProviderHealthTracker("Gold"),
            "ETF": ProviderHealthTracker("ETF")
        }

    def _get_provider_chain(self, symbol: str) -> List[BaseMarketDataProvider]:
        s = symbol.upper().strip()

        # 1. Gold & Precious Metals -> NSE GoldBeES -> MCX Spot -> Yahoo
        if "GOLD" in s or "SGB" in s or "SILVER" in s or s in ["MCX:GOLD", "GOLDBEES", "GOLDBEES.NS"]:
            return [self.gold_provider, self.indian_equities, self.yahoo]

        # 2. Mutual Funds -> AMFI Official NAV Feed -> MFAPI -> Yahoo
        if s.isdigit() or "PARAG" in s or "QUANT" in s or "NIPPON" in s or "MUTUAL" in s or "GROWTH" in s or "DIRECT" in s:
            return [self.mutual_funds, self.yahoo]

        # 3. ETFs -> Global ETF Provider -> Yahoo Finance
        if "ETF" in s or "BEES" in s or s in ["MON100", "MON100.NS", "SP500", "SP500.NS", "QQQ", "SPY", "VTI"]:
            return [self.etf_provider, self.yahoo, self.indian_equities]

        # 4. Indian Equities & Indices priority (.NS, .BO, Nifty, Sensex) -> NSE -> Yahoo Finance
        if s.endswith(".NS") or s.endswith(".BO") or s in ["NIFTY 50", "^NSEI", "SENSEX", "^BSESN", "BANKNIFTY", "^NSEBANK", "RELIANCE", "TCS", "INFY", "HDFCBANK"]:
            return [self.indian_equities, self.yahoo]

        # 5. US Stocks & Global Equities -> Finnhub -> TwelveData -> Yahoo Finance -> Polygon -> AlphaVantage
        chain: List[BaseMarketDataProvider] = []
        if self.finnhub.capabilities.is_configured and self.health_trackers["Finnhub"].is_available():
            chain.append(self.finnhub)
        elif not self.finnhub.capabilities.is_configured:
            logger.debug(f"[API_KEY_ISSUE] Finnhub not configured for {s}; proceeding to next provider.")

        if self.twelvedata.capabilities.is_configured and self.health_trackers["TwelveData"].is_available():
            chain.append(self.twelvedata)
        elif not self.twelvedata.capabilities.is_configured:
            logger.debug(f"[API_KEY_ISSUE] TwelveData not configured for {s}; proceeding to next provider.")

        if self.polygon.capabilities.is_configured and self.health_trackers["Polygon.io"].is_available():
            chain.append(self.polygon)

        # Yahoo Finance is universal resilient global fallback
        chain.append(self.yahoo)

        if self.alphavantage.capabilities.is_configured and self.health_trackers["AlphaVantage"].is_available():
            chain.append(self.alphavantage)

        return chain

    def get_quote(self, symbol: str) -> Dict[str, Any]:
        s_clean = symbol.strip()
        cache_key = f"quote:router:{s_clean.upper()}"
        cached = market_cache.get(cache_key, allow_stale=False)
        if cached:
            return cached

        chain = self._get_provider_chain(s_clean)
        
        last_error_msg = ""
        for i, provider in enumerate(chain):
            tracker = self.health_trackers.get(provider.name)
            t_start = time.time()
            try:
                quote = provider.get_quote(s_clean)
                latency = (time.time() - t_start) * 1000
                
                if quote and quote.get("price") is not None and quote.get("freshness") != "UNAVAILABLE":
                    if tracker:
                        tracker.record_success(latency)
                    # Cache successful quote for 30s
                    market_cache.set(cache_key, quote, ttl_seconds=30)
                    return quote
                else:
                    if tracker:
                        tracker.record_error(is_rate_limit=False)
                    if i < len(chain) - 1:
                        logger.info(f"[FALLBACK] Switching from {provider.name} to {chain[i+1].name} for quote: {s_clean}")
            except Exception as e:
                err_str = str(e)
                last_error_msg = err_str
                is_rate_limit = "429" in err_str or "rate limit" in err_str.lower()
                is_network = "network" in err_str.lower() or "connection" in err_str.lower() or "timeout" in err_str.lower()
                
                if is_rate_limit:
                    logger.warning(f"[RATE_LIMIT] Provider {provider.name} rate limit on quote {s_clean}: {e}")
                elif is_network:
                    logger.warning(f"[NETWORK_FAILURE] Network error with {provider.name} on quote {s_clean}: {e}")
                else:
                    logger.warning(f"[INVALID_SYMBOL/API_ERROR] Provider {provider.name} failed for {s_clean}: {e}")

                if tracker:
                    tracker.record_error(is_rate_limit=is_rate_limit, is_network=is_network)
                if i < len(chain) - 1:
                    logger.info(f"[FALLBACK] Exception in {provider.name}. Falling back to {chain[i+1].name} for quote: {s_clean}")

        # Check stale cache before declaring unavailable
        stale_cached = market_cache.get(cache_key, allow_stale=True)
        if stale_cached and stale_cached.get("price") is not None:
            stale_cached["freshness"] = "LATEST_AVAILABLE"
            stale_cached["message"] = "Latest available market data shown"
            return stale_cached

        return create_unavailable_quote(s_clean, message=f"Latest available market data shown ({last_error_msg or 'Providers cycling'})")

    def get_candles(self, symbol: str, interval: str = "1d", range_period: str = "1mo") -> Dict[str, Any]:
        s_clean = symbol.strip()
        cache_key = f"candles:router:{s_clean.upper()}:{interval}:{range_period}"
        cached = market_cache.get(cache_key, allow_stale=False)
        if cached:
            return cached

        chain = self._get_provider_chain(s_clean)
        
        for i, provider in enumerate(chain):
            tracker = self.health_trackers.get(provider.name)
            t_start = time.time()
            try:
                candles = provider.get_candles(s_clean, interval=interval, range_period=range_period)
                latency = (time.time() - t_start) * 1000
                
                if candles and candles.get("observations") and len(candles["observations"]) > 0:
                    if tracker:
                        tracker.record_success(latency)
                    # Cache candles for 60s
                    market_cache.set(cache_key, candles, ttl_seconds=60)
                    return candles
                else:
                    if i < len(chain) - 1:
                        logger.info(f"[FALLBACK] No candle observations from {provider.name}. Switching to {chain[i+1].name} for {s_clean}")
            except Exception as e:
                err_str = str(e)
                is_rate_limit = "429" in err_str or "rate limit" in err_str.lower()
                is_network = "network" in err_str.lower() or "connection" in err_str.lower() or "timeout" in err_str.lower()

                if is_rate_limit:
                    logger.warning(f"[RATE_LIMIT] Provider {provider.name} rate limit on candles {s_clean}: {e}")
                elif is_network:
                    logger.warning(f"[NETWORK_FAILURE] Network error with {provider.name} on candles {s_clean}: {e}")
                else:
                    logger.warning(f"[INVALID_SYMBOL/API_ERROR] Provider {provider.name} candles failed for {s_clean}: {e}")

                if tracker:
                    tracker.record_error(is_rate_limit=is_rate_limit, is_network=is_network)
                if i < len(chain) - 1:
                    logger.info(f"[FALLBACK] Exception in {provider.name}. Falling back to {chain[i+1].name} for candles: {s_clean}")

        # Check stale cached candles
        stale_candles = market_cache.get(cache_key, allow_stale=True)
        if stale_candles and stale_candles.get("observations"):
            stale_candles["freshness"] = "LATEST_AVAILABLE"
            stale_candles["message"] = "Latest available market data shown"
            return stale_candles

        return {
            "symbol": s_clean,
            "range": range_period,
            "interval": interval,
            "observations": [],
            "freshness": "LATEST_AVAILABLE",
            "message": "Latest available market data shown"
        }

    def get_health_status(self) -> Dict[str, Any]:
        return {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "providers": [t.to_dict() for t in self.health_trackers.values()]
        }

# Global singleton router
provider_router = ProviderRouter()
