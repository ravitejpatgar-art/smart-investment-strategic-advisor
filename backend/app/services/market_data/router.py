import time
import logging
import re
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone

from app.services.market_data.base import BaseMarketDataProvider
from app.services.market_data.freshness import DataFreshness, enforce_truthful_freshness
from app.services.market_data.providers.finnhub_provider import FinnhubProvider
from app.services.market_data.providers.twelvedata_provider import TwelveDataProvider
from app.services.market_data.providers.polygon_provider import PolygonProvider
from app.services.market_data.providers.alphavantage_provider import AlphaVantageProvider
from app.services.market_data.providers.yahoo_provider import YahooFinanceProvider
from app.services.market_data.providers.truedata_provider import TrueDataProvider
from app.services.market_data.indian_equities import IndianEquitiesProvider
from app.services.market_data.mutual_funds import MutualFundsProvider
from app.services.market_data.gold import GoldProvider
from app.services.market_data.etfs import ETFProvider
from app.services.market_data.cache import market_cache
from app.services.market_data.normalizer import create_unavailable_quote, normalize_global_symbol
from app.services.market_data.market_hours import get_indian_market_status, get_us_market_status
from app.core.config import settings

logger = logging.getLogger(__name__)

def scrub_sensitive_tokens(text: str) -> str:
    """Scrubs API keys, passwords, and tokens from error strings to prevent log credential leaks."""
    if not text:
        return ""
    cleaned = re.sub(r'([a-zA-Z0-9_-]{20,})', '***', str(text))
    cleaned = re.sub(r'(api_token|token|key|secret|password)=[^\s&]+', r'\1=***', cleaned, flags=re.IGNORECASE)
    return cleaned


class ProviderHealthTracker:
    def __init__(self, name: str):
        self.name = name
        self.total_requests = 0
        self.success_count = 0
        self.error_count = 0
        self.fallback_count = 0
        self.consecutive_errors = 0
        self.cooldown_until = 0.0
        self.last_latency_ms = 0.0
        self.last_status = "READY"
        self.last_success_at: Optional[str] = None
        self.last_failure_at: Optional[str] = None
        self.last_error: Optional[str] = None
        self.last_updated = datetime.now(timezone.utc).isoformat()

    def record_success(self, latency_ms: float):
        self.total_requests += 1
        self.success_count += 1
        self.consecutive_errors = 0
        self.last_latency_ms = round(latency_ms, 2)
        self.last_status = "HEALTHY"
        self.last_success_at = datetime.now(timezone.utc).isoformat()
        self.last_updated = self.last_success_at

    def record_fallback(self):
        self.fallback_count += 1

    def record_error(self, error_msg: str = "", is_rate_limit: bool = False, is_network: bool = False):
        self.total_requests += 1
        self.error_count += 1
        self.consecutive_errors += 1
        self.last_status = "RATE_LIMITED" if is_rate_limit else ("NETWORK_FAILURE" if is_network else "DEGRADED")
        self.last_failure_at = datetime.now(timezone.utc).isoformat()
        self.last_error = scrub_sensitive_tokens(error_msg)[:200] if error_msg else "Provider error"
        self.last_updated = self.last_failure_at
        
        # Exponential backoff cooldown if multiple failures: 60s for 429, else backoff capped at 300s
        cooldown_sec = 60 if is_rate_limit else min(300, 5 * (2 ** min(self.consecutive_errors, 5)))
        self.cooldown_until = time.time() + cooldown_sec

    def is_available(self) -> bool:
        return time.time() >= self.cooldown_until

    def to_dict(self) -> Dict[str, Any]:
        cooldown_rem = max(0.0, self.cooldown_until - time.time())
        return {
            "name": self.name,
            "status": "IN_COOLDOWN" if cooldown_rem > 0 else self.last_status,
            "isAvailable": self.is_available(),
            "cooldownSecondsRemaining": round(cooldown_rem, 1),
            "totalRequests": self.total_requests,
            "successCount": self.success_count,
            "errorCount": self.error_count,
            "fallbackCount": self.fallback_count,
            "successRate": round((self.success_count / self.total_requests * 100), 1) if self.total_requests > 0 else 100.0,
            "lastLatencyMs": self.last_latency_ms,
            "lastSuccessAt": self.last_success_at,
            "lastFailureAt": self.last_failure_at,
            "lastError": self.last_error,
            "lastUpdated": self.last_updated
        }


class ProviderRouter:
    """
    Multi-provider market data router with automatic failover, health tracking, market-closed detection, and caching.
    Strict Priority Fallback Pipeline:
      1. Indian Stocks: Optional Paid TrueData Feed -> NSE Feed -> Yahoo Finance
      2. Mutual Funds: AMFI Official Feed -> MFAPI Feed -> Scheme DB
      3. US Stocks: Finnhub -> TwelveData -> Polygon.io -> Yahoo Finance -> AlphaVantage
      4. ETFs: ETF Provider -> Yahoo Finance -> Exchange Provider
      5. Gold: NSE GoldBeES -> MCX Spot Feed -> Yahoo Finance
    """
    def __init__(self):
        self.finnhub = FinnhubProvider()
        self.twelvedata = TwelveDataProvider()
        self.polygon = PolygonProvider()
        self.alphavantage = AlphaVantageProvider()
        self.yahoo = YahooFinanceProvider()
        self.truedata = TrueDataProvider()
        self.indian_equities = IndianEquitiesProvider()
        self.mutual_funds = MutualFundsProvider()
        self.gold_provider = GoldProvider()
        self.etf_provider = ETFProvider()

        self.health_trackers = {
            "TrueData": ProviderHealthTracker("TrueData"),
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
        norm = normalize_global_symbol(symbol)
        s = norm["canonical_symbol"].upper().strip()
        asset_type = norm.get("asset_type")

        # 1. Gold & Precious Metals -> NSE GoldBeES -> MCX Spot -> Yahoo
        if "GOLD" in s or "SGB" in s or "SILVER" in s or s in ["MCX:GOLD", "GOLDBEES.NS", "GOLDBEES"]:
            return [self.gold_provider, self.indian_equities, self.yahoo]

        # 2. Mutual Funds -> AMFI Official NAV Feed -> MFAPI -> Yahoo
        if asset_type == "MUTUAL_FUND" or s.startswith("AMFI:") or s.isdigit() or any(w in s for w in ["PARAG", "QUANT", "NIPPON", "MUTUAL", "GROWTH", "DIRECT", "UTI"]):
            return [self.mutual_funds, self.yahoo]

        # 3. ETFs -> Global ETF Provider -> Yahoo Finance -> Indian Equities
        if asset_type == "ETF" or "ETF" in s or "BEES" in s or s in ["MON100.NS", "SP500.NS", "QQQ", "SPY", "VOO", "VTI"]:
            return [self.etf_provider, self.yahoo, self.indian_equities]

        # 4. Indian Equities & Indices priority (.NS, .BO, Nifty, Sensex) -> TrueData (if configured) -> NSE -> Yahoo Finance
        if s.endswith(".NS") or s.endswith(".BO") or s in ["NIFTY 50", "^NSEI", "SENSEX", "^BSESN", "BANKNIFTY", "^NSEBANK", "RELIANCE.NS", "TCS.NS", "INFY.NS", "HDFCBANK.NS"]:
            chain = []
            if self.truedata.capabilities.is_configured and self.health_trackers["TrueData"].is_available():
                chain.append(self.truedata)
            chain.extend([self.indian_equities, self.yahoo])
            return chain

        # 5. US Stocks & Global Equities -> Finnhub -> TwelveData -> Polygon.io -> Yahoo Finance -> AlphaVantage
        chain = []
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
        norm = normalize_global_symbol(symbol)
        s_clean = norm["canonical_symbol"].strip()
        
        # Check cache
        cache_key = f"quote:router:{s_clean.upper()}"
        cached = market_cache.get(cache_key, allow_stale=False)
        if cached:
            return cached

        chain = self._get_provider_chain(s_clean)
        
        last_error_msg = ""
        quote_result = None

        # Check market session status for appropriate freshness attribution
        is_india = s_clean.endswith(".NS") or s_clean.endswith(".BO") or s_clean.startswith("^NSE") or s_clean.startswith("AMFI:")
        mkt_status = get_indian_market_status() if is_india else get_us_market_status()
        is_market_open = mkt_status.get("isOpen", False)
        
        for i, provider in enumerate(chain):
            tracker = self.health_trackers.get(provider.name)
            t_start = time.time()
            
            # Retry policy: 1 attempt + max 1 quick retry for transient network errors
            max_attempts = 2
            quote = None
            
            for attempt in range(max_attempts):
                try:
                    quote = provider.get_quote(s_clean)
                    latency = (time.time() - t_start) * 1000
                    
                    if quote and quote.get("price") is not None and quote.get("freshness") != "UNAVAILABLE":
                        if tracker:
                            tracker.record_success(latency)
                        
                        # Apply market closed detection without converting to UNAVAILABLE
                        if not is_market_open and norm.get("asset_type") != "MUTUAL_FUND":
                            quote["marketStatus"] = "CLOSED"
                            # Downgrade LIVE to LATEST_AVAILABLE when market is closed
                            if quote.get("freshness") in ["LIVE", "REALTIME"]:
                                quote["freshness"] = DataFreshness.LATEST_AVAILABLE.value
                        
                        # Cache successful quote for configured TTL (default 30s)
                        ttl = getattr(settings, "MARKET_DATA_CACHE_TTL_SECONDS", 30)
                        market_cache.set(cache_key, quote, ttl_seconds=ttl)
                        return quote
                    else:
                        # Non-exception empty response
                        break
                except Exception as e:
                    err_str = str(e)
                    last_error_msg = scrub_sensitive_tokens(err_str)
                    is_rate_limit = "429" in err_str or "rate limit" in err_str.lower()
                    is_auth = "401" in err_str or "403" in err_str or "unauthorized" in err_str.lower()
                    is_network = "network" in err_str.lower() or "connection" in err_str.lower() or "timeout" in err_str.lower()
                    
                    if tracker:
                        tracker.record_error(error_msg=last_error_msg, is_rate_limit=is_rate_limit, is_network=is_network)
                    
                    # Do not retry on 429 rate limit or 401/403 auth errors; failover immediately
                    if is_rate_limit or is_auth or attempt >= max_attempts - 1:
                        break
                    
                    # Restrained backoff before retry (0.25s)
                    time.sleep(0.25)

            # If this provider didn't return a valid quote, mark fallback and continue to next
            if tracker:
                tracker.record_fallback()
            if i < len(chain) - 1:
                logger.info(f"[FALLBACK] Switching from {provider.name} to {chain[i+1].name} for quote: {s_clean}")

        # Check stale cache before declaring unavailable
        stale_cached = market_cache.get(cache_key, allow_stale=True)
        if stale_cached and stale_cached.get("price") is not None:
            stale_cached["freshness"] = DataFreshness.LATEST_AVAILABLE.value
            stale_cached["marketStatus"] = "CLOSED" if not is_market_open else stale_cached.get("marketStatus", "CLOSED")
            stale_cached["message"] = "Latest available market data shown"
            return stale_cached

        # Truthful unavailable response
        return create_unavailable_quote(
            symbol=s_clean,
            message=f"Latest available market data shown ({last_error_msg or 'Providers cycling'})",
            market_status="CLOSED" if not is_market_open else "UNKNOWN"
        )

    def get_candles(self, symbol: str, interval: str = "1d", range_period: str = "1mo") -> Dict[str, Any]:
        norm = normalize_global_symbol(symbol)
        s_clean = norm["canonical_symbol"].strip()
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
                    if tracker:
                        tracker.record_fallback()
                    if i < len(chain) - 1:
                        logger.info(f"[FALLBACK] No candle observations from {provider.name}. Switching to {chain[i+1].name} for {s_clean}")
            except Exception as e:
                err_str = str(e)
                is_rate_limit = "429" in err_str or "rate limit" in err_str.lower()
                is_network = "network" in err_str.lower() or "connection" in err_str.lower() or "timeout" in err_str.lower()

                if tracker:
                    tracker.record_error(error_msg=scrub_sensitive_tokens(err_str), is_rate_limit=is_rate_limit, is_network=is_network)
                    tracker.record_fallback()
                if i < len(chain) - 1:
                    logger.info(f"[FALLBACK] Exception in {provider.name}. Falling back to {chain[i+1].name} for candles: {s_clean}")

        # Check stale cached candles
        stale_candles = market_cache.get(cache_key, allow_stale=True)
        if stale_candles and stale_candles.get("observations"):
            stale_candles["freshness"] = DataFreshness.LATEST_AVAILABLE.value
            stale_candles["message"] = "Latest available market data shown"
            return stale_candles

        return {
            "symbol": s_clean,
            "range": range_period,
            "interval": interval,
            "observations": [],
            "freshness": DataFreshness.LATEST_AVAILABLE.value,
            "message": "Latest available market data shown"
        }

    def get_health_status(self) -> Dict[str, Any]:
        return {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "providers": [t.to_dict() for t in self.health_trackers.values()],
            "cache": market_cache.get_stats()
        }

# Global singleton router
provider_router = ProviderRouter()
