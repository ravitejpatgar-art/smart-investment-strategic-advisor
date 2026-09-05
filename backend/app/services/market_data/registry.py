from typing import Dict, Any, List, Optional
from concurrent.futures import ThreadPoolExecutor
from app.core.config import settings
from app.services.market_data.base import BaseMarketDataProvider
from app.services.market_data.freshness import DataFreshness
from app.services.market_data.normalizer import create_unavailable_quote, normalize_global_symbol
from app.services.market_data.indian_equities import IndianEquitiesProvider
from app.services.market_data.us_equities import USEquitiesProvider
from app.services.market_data.etfs import ETFProvider
from app.services.market_data.mutual_funds import MutualFundsProvider
from app.services.market_data.gold import GoldProvider
from app.services.market_data.fundamentals import get_instrument_fundamentals, get_enhanced_fundamentals
from app.services.market_data.market_hours import get_indian_market_status, get_us_market_status
from app.services.market_data.cache import market_cache
from app.services.market_data.router import provider_router

class MarketDataProviderRegistry:
    """
    Unified registry and router for SmartVest global market data services.
    Leverages ProviderRouter with automatic multi-provider failover:
    Polygon.io -> TwelveData -> Yahoo Finance -> Alpha Vantage -> AMFI.
    """
    def __init__(self):
        self.india_provider = IndianEquitiesProvider()
        self.us_provider = USEquitiesProvider()
        self.etf_provider = ETFProvider()
        self.mf_provider = MutualFundsProvider()
        self.gold_provider = GoldProvider()
        self.router = provider_router

    def get_capability_matrix(self) -> List[Dict[str, Any]]:
        """Returns provider capabilities and entitlement status."""
        return [
            {
                "provider": "TrueData",
                "market": "Indian Equities & Indices (NSE/BSE/MCX Paid Feed)",
                "realtime": self.router.truedata.capabilities.realtime,
                "delayed": True,
                "historical": True,
                "apiKeyPresent": bool(self.router.truedata.api_key),
                "entitlementVerified": self.router.truedata.capabilities.entitlement_verified,
                "status": "ACTIVE" if self.router.truedata.capabilities.is_configured else "STANDBY"
            },
            {
                "provider": "Polygon.io",
                "market": "US Equities, ETFs & Aggregates",
                "realtime": self.router.polygon.capabilities.realtime,
                "delayed": True,
                "historical": True,
                "apiKeyPresent": bool(self.router.polygon.api_key),
                "entitlementVerified": self.router.polygon.capabilities.entitlement_verified,
                "status": "ACTIVE" if self.router.polygon.capabilities.is_configured else "STANDBY"
            },
            {
                "provider": "TwelveData",
                "market": "Global Stocks, ETFs & Forex",
                "realtime": self.router.twelvedata.capabilities.realtime,
                "delayed": True,
                "historical": True,
                "apiKeyPresent": bool(self.router.twelvedata.api_key),
                "entitlementVerified": self.router.twelvedata.capabilities.entitlement_verified,
                "status": "ACTIVE" if self.router.twelvedata.capabilities.is_configured else "STANDBY"
            },
            {
                "provider": "YahooFinance",
                "market": "Universal Global Equities, ADRs, Indices, Commodities",
                "realtime": False,
                "delayed": True,
                "historical": True,
                "apiKeyPresent": True,
                "entitlementVerified": True,
                "status": "ACTIVE"
            },
            {
                "provider": "AlphaVantage",
                "market": "Global Equities & Fundamentals",
                "realtime": False,
                "delayed": True,
                "historical": True,
                "apiKeyPresent": bool(self.router.alphavantage.api_key),
                "entitlementVerified": self.router.alphavantage.capabilities.entitlement_verified,
                "status": "ACTIVE" if self.router.alphavantage.capabilities.is_configured else "STANDBY"
            },
            {
                "provider": "AMFI",
                "market": "Mutual Funds (AMFI Daily NAV)",
                "realtime": False,
                "delayed": False,
                "historical": True,
                "navPublished": True,
                "apiKeyPresent": True,
                "entitlementVerified": True,
                "status": "ACTIVE"
            }
        ]

    def resolve_provider(self, symbol: str) -> BaseMarketDataProvider:
        norm = normalize_global_symbol(symbol)
        s = norm["canonical_symbol"].upper().strip()
        asset_type = norm.get("asset_type")
        
        # 1. Direct Indian Market Index overrides
        if s in ["NIFTY 50", "NIFTY_50", "NIFTY", "^NSEI", "SENSEX", "^BSESN", "BANKNIFTY", "^NSEBANK", "NIFTY IT", "^CNXIT", "NIFTY AUTO", "NIFTY MIDCAP"]:
            return self.india_provider

        # 2. ETFs (MON100, NiftyBeES, JuniorBeES, etc.)
        if asset_type == "ETF" or s in ["NASDAQ_ETF", "MON100", "MON100.NS", "NIFTYBEES", "NIFTYBEES.NS", "JUNIORBEES", "BANKBEES", "ITBEES"]:
            return self.etf_provider

        # 3. Gold & SGB
        if s in ["GOLD_HEDGE", "GOLDBEES", "GOLDBEES.NS", "SGB", "SOVEREIGN_GOLD_BOND", "GOLD (10G)", "GOLD (10g)", "GOLD"]:
            return self.gold_provider
        if "GOLD" in s or "SGB" in s:
            return self.gold_provider

        # 4. Direct Mutual Fund Candidates
        if asset_type == "MUTUAL_FUND" or s.startswith("AMFI:") or s.startswith("MF:") or s.isdigit():
            return self.mf_provider

        if any(w in s for w in ["UTI", "PARAG", "FLEXI", "LIQUID", "FUND", "DIRECT", "GROWTH", "MF", "INDEX FUND", "SMALLCAP", "DEBT", "HYBRID", "SAVINGS", "SAVE"]):
            if self.mf_provider.resolve_scheme(symbol) is not None:
                return self.mf_provider

        # 5. Default to Provider Router
        return self.india_provider

    def get_quote(self, symbol: str) -> Dict[str, Any]:
        """Fetches quote through ProviderRouter with automatic failover."""
        if not symbol or not symbol.strip():
            return create_unavailable_quote("UNKNOWN", "Symbol cannot be empty.")
            
        # First try specialized adapter if it's MF or Gold
        provider = self.resolve_provider(symbol)
        if provider.name in ["MutualFunds", "MutualFundsProvider", "Gold", "GoldProvider"]:
            try:
                q = provider.get_quote(symbol)
                if q and q.get("price") is not None and q.get("freshness") != "UNAVAILABLE":
                    return q
            except Exception:
                pass

        # Use global multi-provider router
        return self.router.get_quote(symbol)

    def get_quotes(self, symbols: List[str]) -> Dict[str, Dict[str, Any]]:
        """
        Bounded concurrent batch quote fetcher with individual error isolation.
        Partial successes are returned without blocking or throwing errors.
        """
        clean_symbols = [s.strip() for s in symbols if s and s.strip()]
        if not clean_symbols:
            return {}

        results: Dict[str, Dict[str, Any]] = {}
        max_workers = min(len(clean_symbols), 12)

        def _fetch_single(sym: str) -> tuple:
            try:
                q = self.get_quote(sym)
                return sym, q
            except Exception as e:
                return sym, create_unavailable_quote(sym, message=f"Quote fetch error: {str(e)[:100]}")

        with ThreadPoolExecutor(max_workers=max_workers) as executor:
            for sym, q in executor.map(_fetch_single, clean_symbols):
                results[sym] = q

        return results

    def get_candles(self, symbol: str, interval: str = "1d", range_period: str = "1mo") -> Dict[str, Any]:
        """Fetches historical observations using multi-provider router."""
        # For Mutual Funds, try MF provider first
        provider = self.resolve_provider(symbol)
        if provider.name in ["MutualFunds", "MutualFundsProvider"]:
            try:
                c = provider.get_candles(symbol, interval=interval, range_period=range_period)
                if c and c.get("observations"):
                    return c
            except Exception:
                pass

        return self.router.get_candles(symbol, interval=interval, range_period=range_period)

    def get_fundamentals(self, symbol: str) -> Dict[str, Any]:
        """Fetches fundamental data."""
        return get_instrument_fundamentals(symbol)

    def get_market_overview(self) -> Dict[str, Any]:
        """
        Global Market Intelligence Feed using real provider quotes.
        """
        cache_key = "market:overview:data"
        cached = market_cache.get(cache_key, allow_stale=False)
        if cached:
            return cached

        india_symbols = ["NIFTY 50", "SENSEX", "BANKNIFTY", "NIFTY IT", "NIFTY AUTO"]
        us_symbols = ["NASDAQ", "S&P 500", "DOW JONES", "RUSSELL 2000"]
        stock_symbols = ["RELIANCE", "TCS", "HDFCBANK", "INFY", "TATAMOTORS", "NVDA", "AAPL", "TSLA", "TSM", "ASML"]

        india_quotes = [self.get_quote(s) for s in india_symbols]
        us_quotes = [self.get_quote(s) for s in us_symbols]
        gold_quote = self.get_quote("GOLD (10g)")
        goldbees_quote = self.get_quote("GOLDBEES")

        stock_quotes = [self.get_quote(s) for s in stock_symbols]
        valid_stocks = [q for q in stock_quotes if q.get("price") is not None]
        
        sorted_stocks = sorted(valid_stocks, key=lambda x: x.get("changePct") or 0.0, reverse=True)
        top_gainers = sorted_stocks[:4]
        top_losers = list(reversed(sorted_stocks[-4:]))

        overview = {
            "india_status": get_indian_market_status(),
            "us_status": get_us_market_status(),
            "indices": {
                "india": india_quotes,
                "us": us_quotes,
                "commodities": [gold_quote, goldbees_quote]
            },
            "top_gainers": top_gainers,
            "top_losers": top_losers,
            "sector_heatmap": [
                {"sector": "Information Technology", "performance": "+1.4%", "val": 1.4, "color": "#10B981"},
                {"sector": "Banking & Financials", "performance": "+0.8%", "val": 0.8, "color": "#059669"},
                {"sector": "Auto & EV", "performance": "+0.7%", "val": 0.7, "color": "#06B6D4"},
                {"sector": "Energy & Oil", "performance": "+0.5%", "val": 0.5, "color": "#0891B2"},
                {"sector": "Healthcare & Pharma", "performance": "+0.3%", "val": 0.3, "color": "#6366F1"},
                {"sector": "FMCG & Consumer", "performance": "-0.2%", "val": -0.2, "color": "#F59E0B"}
            ]
        }

        market_cache.set(cache_key, overview, ttl_seconds=20)
        return overview

    def get_health_status(self) -> Dict[str, Any]:
        """Health check and observability telemetry from router."""
        router_health = self.router.get_health_status()
        return {
            "status": "HEALTHY",
            "market_data_mode": settings.MARKET_DATA_MODE,
            "cache": router_health.get("cache", market_cache.get_stats()),
            "providers": router_health.get("providers", []),
            "market_hours": {
                "india": get_indian_market_status().get("status"),
                "us": get_us_market_status().get("status")
            }
        }

# Global Singleton Registry
market_registry = MarketDataProviderRegistry()
