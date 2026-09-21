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
from app.services.market_data.providers.angel_provider import angel_provider
from app.services.market_data.indian_equities import IndianEquitiesProvider
from app.services.market_data.mutual_funds import MutualFundsProvider
from app.services.market_data.gold import GoldProvider
from app.services.market_data.etfs import ETFProvider
from app.services.market_data.cache import market_cache, build_quote_cache_key
from app.services.market_data.normalizer import create_unavailable_quote, normalize_global_symbol
from app.services.market_data.market_hours import get_indian_market_status, get_us_market_status
from app.services.market_data.providers.angel_scrip_master import angel_scrip_master
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
    def __init__(self, name: str, provider: Optional[Any] = None):
        self.name = name
        self.provider = provider
        self.total_requests = 0
        self.success_count = 0
        self.error_count = 0
        self.fallback_count = 0
        self.consecutive_errors = 0
        self.cooldown_until = 0.0
        self.last_latency_ms = 0.0
        # Determine initial status truthfully based on provider configuration
        if provider and hasattr(provider, "capabilities") and not provider.capabilities.is_configured:
            self.last_status = "CREDENTIALS_REQUIRED"
        elif provider and hasattr(provider, "is_configured") and not provider.is_configured:
            self.last_status = "CREDENTIALS_REQUIRED"
        else:
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

    def record_error(
        self,
        error_msg: str = "",
        is_rate_limit: bool = False,
        is_network: bool = False,
        is_server_error: bool = False,
        is_auth: bool = False,
        is_ws_disconnect: bool = False
    ):
        self.total_requests += 1
        self.error_count += 1
        self.last_failure_at = datetime.now(timezone.utc).isoformat()
        self.last_error = scrub_sensitive_tokens(error_msg)[:200] if error_msg else "Provider error"
        self.last_updated = self.last_failure_at

        # Phase 6: Cooldown ONLY for genuine infrastructure failures:
        # - 429 (rate limit)
        # - 5xx (server error)
        # - websocket disconnects
        # - authentication failures
        # - network / timeout failures
        # Unmapped symbol errors or empty quotes MUST NOT place provider into cooldown!
        is_infra_failure = is_rate_limit or is_network or is_server_error or is_auth or is_ws_disconnect
        if is_infra_failure:
            self.consecutive_errors += 1
            self.last_status = (
                "RATE_LIMITED" if is_rate_limit
                else ("AUTH_FAILURE" if is_auth
                      else ("WS_DISCONNECTED" if is_ws_disconnect
                            else ("NETWORK_FAILURE" if is_network else "SERVER_ERROR")))
            )
            cooldown_sec = 60 if is_rate_limit else min(300, 5 * (2 ** min(self.consecutive_errors, 5)))
            self.cooldown_until = time.time() + cooldown_sec
        else:
            # Unmapped symbols, missing quote items, or symbol-specific validation errors:
            # Strictly do NOT put provider into cooldown!
            self.last_status = "DEGRADED"

    def is_available(self) -> bool:
        if self.provider and hasattr(self.provider, "capabilities") and not self.provider.capabilities.is_configured:
            return False
        return time.time() >= self.cooldown_until

    def to_dict(self) -> Dict[str, Any]:
        cooldown_rem = max(0.0, self.cooldown_until - time.time())
        curr_status = self.last_status
        if self.provider and hasattr(self.provider, "capabilities") and not self.provider.capabilities.is_configured:
            curr_status = "CREDENTIALS_REQUIRED"
        elif cooldown_rem > 0:
            curr_status = "IN_COOLDOWN"

        return {
            "name": self.name,
            "status": curr_status,
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
      1. Indian Stocks & ETFs: Angel One SmartAPI (using verified instrument master tokens)
      2. Mutual Funds: AMFI Official Feed -> MFAPI Feed -> Scheme DB (STRICTLY ISOLATED, NEVER EQUITIES)
      3. US Stocks: Finnhub -> TwelveData -> Polygon.io -> Yahoo Finance -> AlphaVantage
      4. Gold: NSE GoldBeES -> MCX Spot Feed -> Yahoo Finance
    """
    def __init__(self):
        self.angel = angel_provider
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
            "Angel One SmartAPI": ProviderHealthTracker("Angel One SmartAPI", self.angel),
            "TrueData": ProviderHealthTracker("TrueData", self.truedata),
            "Finnhub": ProviderHealthTracker("Finnhub", self.finnhub),
            "TwelveData": ProviderHealthTracker("TwelveData", self.twelvedata),
            "Polygon.io": ProviderHealthTracker("Polygon.io", self.polygon),
            "YahooFinance": ProviderHealthTracker("YahooFinance", self.yahoo),
            "AlphaVantage": ProviderHealthTracker("AlphaVantage", self.alphavantage),
            "IndianEquities": ProviderHealthTracker("IndianEquities", self.indian_equities),
            "MutualFunds": ProviderHealthTracker("MutualFunds", self.mutual_funds),
            "Gold": ProviderHealthTracker("Gold", self.gold_provider),
            "ETF": ProviderHealthTracker("ETF", self.etf_provider)
        }

    def _get_provider_chain(self, symbol: str) -> List[BaseMarketDataProvider]:
        norm = normalize_global_symbol(symbol)
        s = norm["canonical_symbol"].upper().strip()
        asset_type = norm.get("asset_type")

        # 1. Mutual Funds -> AMFI Official NAV Feed -> MFAPI (STRICTLY MUTUAL FUNDS ONLY, NEVER LIVE/EQUITY)
        if (
            asset_type == "MUTUAL_FUND"
            or s.startswith("AMFI:")
            or s.startswith("MF:")
            or (s.isdigit() and len(s) in (5, 6))
            or any(w in s for w in ["PARAG", "QUANT", "NIPPON", "MUTUAL", "GROWTH", "DIRECT", "UTI"])
        ):
            return [self.mutual_funds]

        # 2. Check Angel One Master for Indian Stock, ETF, REIT, or INVIT
        angel_scrip = angel_scrip_master.resolve(s)
        if angel_scrip and angel_scrip.get("asset_type") in ("STOCK", "ETF", "REIT", "INVIT"):
            chain = []
            if self.angel.capabilities.is_configured and self.health_trackers["Angel One SmartAPI"].is_available():
                chain.append(self.angel)
            if self.truedata.capabilities.is_configured and self.health_trackers["TrueData"].is_available():
                chain.append(self.truedata)
            # Add appropriate secondary fallback only when Angel is unavailable or fails
            fallback_provider = self.etf_provider if angel_scrip.get("asset_type") == "ETF" else self.indian_equities
            if fallback_provider not in chain:
                chain.append(fallback_provider)
            return chain

        # 3. Gold & Precious Metals -> NSE GoldBeES -> MCX Spot -> Yahoo
        if "GOLD" in s or "SGB" in s or "SILVER" in s or s in ["MCX:GOLD", "GOLDBEES.NS", "GOLDBEES"]:
            return [self.gold_provider, self.indian_equities, self.yahoo]

        # 4. Global / US ETFs
        if asset_type == "ETF" or "ETF" in s or "BEES" in s or s in ["MON100.NS", "MON100", "SP500.NS", "QQQ", "SPY", "VOO", "VTI"]:
            chain = []
            is_us_etf = s in ["QQQ", "SPY", "VOO", "VTI"] or norm.get("market") == "US"
            if not is_us_etf and self.angel.capabilities.is_configured and self.health_trackers["Angel One SmartAPI"].is_available():
                chain.append(self.angel)
            chain.extend([self.etf_provider, self.yahoo])
            return chain

        # 5. Indian Equities & Indices
        if norm.get("market") == "INDIA" or s.endswith(".NS") or s.endswith(".BO") or s in ["NIFTY 50", "^NSEI", "SENSEX", "^BSESN", "BANKNIFTY", "^NSEBANK"]:
            chain = []
            if self.angel.capabilities.is_configured and self.health_trackers["Angel One SmartAPI"].is_available():
                chain.append(self.angel)
            if self.truedata.capabilities.is_configured and self.health_trackers["TrueData"].is_available():
                chain.append(self.truedata)
            chain.extend([self.indian_equities, self.yahoo])
            return chain

        # 6. US Stocks & Global Equities
        chain = []
        if self.finnhub.capabilities.is_configured and self.health_trackers["Finnhub"].is_available():
            chain.append(self.finnhub)
        if self.twelvedata.capabilities.is_configured and self.health_trackers["TwelveData"].is_available():
            chain.append(self.twelvedata)
        if self.polygon.capabilities.is_configured and self.health_trackers["Polygon.io"].is_available():
            chain.append(self.polygon)
        chain.append(self.yahoo)
        if self.alphavantage.capabilities.is_configured and self.health_trackers["AlphaVantage"].is_available():
            chain.append(self.alphavantage)
        return chain

    def get_quote(self, symbol: str) -> Dict[str, Any]:
        norm = normalize_global_symbol(symbol)
        s_clean = norm["canonical_symbol"].strip()

        # Check cache using stable identity
        angel_scrip = angel_scrip_master.resolve(s_clean)
        token = angel_scrip.get("token") if angel_scrip else None
        exch = angel_scrip.get("exchange", norm.get("exchange", "UNKNOWN")) if angel_scrip else norm.get("exchange", "UNKNOWN")
        prov = "Angel_One_SmartAPI" if angel_scrip else ("AMFI" if norm.get("asset_type") == "MUTUAL_FUND" else "Global")

        cache_key = build_quote_cache_key(canonical_id=s_clean, exchange=exch, token=token, provider=prov)
        cached = market_cache.get(cache_key, allow_stale=False)
        if cached and not cached.get("isStale", False):
            # If cached quote is from Yahoo fallback but Angel One is configured and mapped, bypass fallback cache
            if prov == "Angel_One_SmartAPI" and self.angel.capabilities.is_configured:
                cached_src = str(cached.get("source", ""))
                if "Yahoo" in cached_src or "Fallback" in cached_src:
                    cached = None
            if cached:
                cached_copy = dict(cached)
                requested_sym = symbol.strip().upper()
                if "." not in requested_sym and cached_copy.get("symbol", "").endswith((".NS", ".BO")):
                    cached_copy["canonicalSymbol"] = cached_copy["symbol"]
                    cached_copy["symbol"] = requested_sym
                return cached_copy

        chain = self._get_provider_chain(s_clean)
        last_error_msg = ""

        is_india = norm.get("market") == "INDIA" or s_clean.endswith(".NS") or s_clean.endswith(".BO") or s_clean.startswith("^NSE") or s_clean.startswith("AMFI:")
        mkt_status = get_indian_market_status() if is_india else get_us_market_status()
        is_market_open = mkt_status.get("isOpen", False)

        requested_sym = symbol.strip().upper()
        for i, provider in enumerate(chain):
            tracker = self.health_trackers.get(provider.name)
            t_start = time.time()
            max_attempts = 2
            quote = None

            for attempt in range(max_attempts):
                try:
                    quote = provider.get_quote(s_clean)
                    latency = (time.time() - t_start) * 1000

                    if quote and quote.get("price") is not None and quote.get("freshness") != "UNAVAILABLE" and not quote.get("isStale", False):
                        if tracker:
                            tracker.record_success(latency)

                        # Apply market closed detection without converting to UNAVAILABLE
                        # For Angel One quotes, preserve real-time broker feed freshness and live status
                        if not is_market_open and norm.get("asset_type") != "MUTUAL_FUND":
                            quote["marketStatus"] = mkt_status.get("status", "CLOSED")
                            if "Angel" not in str(provider.name):
                                quote["isLive"] = False
                                if quote.get("freshness") in ["LIVE", "REALTIME"]:
                                    quote["freshness"] = DataFreshness.LATEST_AVAILABLE.value

                        # Preserve requested symbol when requested without exchange suffix
                        if "." not in requested_sym and quote.get("symbol") and quote["symbol"].endswith((".NS", ".BO")):
                            quote["canonicalSymbol"] = quote["symbol"]
                            quote["symbol"] = requested_sym

                        # Phase 2: Provider tracing log
                        prov_tag = "ANGEL" if "Angel" in provider.name else ("YAHOO" if ("Yahoo" in provider.name or "IndianEquities" in provider.name) else provider.name.upper())
                        logger.info(f"QUOTE_PROVIDER={prov_tag}\nSYMBOL={requested_sym}")

                        # Cache successful quote with stable identity key
                        ttl = getattr(settings, "MARKET_DATA_CACHE_TTL_SECONDS", 30)
                        market_cache.set(cache_key, quote, ttl_seconds=ttl)
                        return quote
                    else:
                        if "Angel" in provider.name:
                            logger.warning(f"FALLBACK_ACTIVATION\nsymbol={requested_sym}\nreason=Angel returned empty quote")
                        break
                except Exception as e:
                    err_str = str(e)
                    last_error_msg = scrub_sensitive_tokens(err_str)
                    is_rate_limit = "429" in err_str or "rate limit" in err_str.lower()
                    is_auth = "401" in err_str or "403" in err_str or "unauthorized" in err_str.lower() or "token" in err_str.lower()
                    is_network = "network" in err_str.lower() or "connection" in err_str.lower() or "timeout" in err_str.lower()
                    is_server_error = any(code in err_str for code in ["500", "502", "503", "504"])
                    is_ws_disconnect = "websocket" in err_str.lower() or "socket" in err_str.lower()

                    if tracker:
                        tracker.record_error(
                            error_msg=last_error_msg,
                            is_rate_limit=is_rate_limit,
                            is_network=is_network,
                            is_server_error=is_server_error,
                            is_auth=is_auth,
                            is_ws_disconnect=is_ws_disconnect
                        )

                    if "Angel" in provider.name:
                        logger.warning(f"FALLBACK_ACTIVATION\nsymbol={requested_sym}\nreason={last_error_msg or 'Angel provider error'}")

                    if is_rate_limit or is_auth or attempt >= max_attempts - 1:
                        break
                    time.sleep(0.25)

            if tracker:
                tracker.record_fallback()
            if i < len(chain) - 1:
                logger.warning(
                    f"[FALLBACK] primaryProvider='{provider.name}' fallbackProvider='{chain[i+1].name}' "
                    f"symbol='{s_clean}' fallbackReason='{last_error_msg or 'Quote empty or unavailable'}'"
                )

        # Check stale cache before declaring unavailable
        stale_cached = market_cache.get(cache_key, allow_stale=True)
        if stale_cached and stale_cached.get("price") is not None:
            stale_cached["freshness"] = DataFreshness.LATEST_AVAILABLE.value
            stale_cached["isLive"] = False
            stale_cached["isStale"] = True
            stale_cached["marketStatus"] = mkt_status.get("status", "CLOSED") if not is_market_open else stale_cached.get("marketStatus", "CLOSED")
            stale_cached["message"] = "Latest available market data shown"
            return stale_cached

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
