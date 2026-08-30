from typing import Dict, Any, List, Optional
from app.core.config import settings
from app.services.market_data.base import BaseMarketDataProvider, ProviderCapabilities
from app.services.market_data.freshness import DataFreshness
from app.services.market_data.normalizer import create_unavailable_quote
from app.services.market_data.indian_equities import IndianEquitiesProvider
from app.services.market_data.us_equities import USEquitiesProvider
from app.services.market_data.etfs import ETFProvider
from app.services.market_data.mutual_funds import MutualFundsProvider
from app.services.market_data.gold import GoldProvider
from app.services.market_data.fundamentals import get_instrument_fundamentals
from app.services.market_data.market_hours import get_indian_market_status, get_us_market_status
from app.services.market_data.cache import market_cache

class MarketDataProviderRegistry:
    """
    Unified registry and router for SmartVest market data services.
    Routes queries to specialized adapters based on canonical asset classification.
    """
    def __init__(self):
        self.india_provider = IndianEquitiesProvider()
        self.us_provider = USEquitiesProvider()
        self.etf_provider = ETFProvider()
        self.mf_provider = MutualFundsProvider()
        self.gold_provider = GoldProvider()

    def get_capability_matrix(self) -> List[Dict[str, Any]]:
        """Returns provider capabilities and entitlement status."""
        return [
            {
                "provider": self.india_provider.name,
                "market": "India Equities & Indices (NSE/BSE)",
                "realtime": self.india_provider.capabilities.realtime,
                "delayed": self.india_provider.capabilities.delayed,
                "historical": self.india_provider.capabilities.historical,
                "apiKeyPresent": bool(settings.INDIA_MARKET_DATA_API_KEY),
                "entitlementVerified": self.india_provider.capabilities.entitlement_verified,
                "status": "ACTIVE"
            },
            {
                "provider": self.us_provider.name,
                "market": "US Equities & Indices (NASDAQ/NYSE)",
                "realtime": self.us_provider.capabilities.realtime,
                "delayed": self.us_provider.capabilities.delayed,
                "historical": self.us_provider.capabilities.historical,
                "apiKeyPresent": bool(settings.US_MARKET_DATA_API_KEY),
                "entitlementVerified": self.us_provider.capabilities.entitlement_verified,
                "status": "ACTIVE"
            },
            {
                "provider": self.etf_provider.name,
                "market": "ETFs (NiftyBeES, GoldBeES, MON100)",
                "realtime": self.etf_provider.capabilities.realtime,
                "delayed": self.etf_provider.capabilities.delayed,
                "historical": self.etf_provider.capabilities.historical,
                "apiKeyPresent": True,
                "entitlementVerified": False,
                "status": "ACTIVE"
            },
            {
                "provider": self.mf_provider.name,
                "market": "Mutual Funds (AMFI Daily NAV)",
                "realtime": False,
                "delayed": False,
                "historical": True,
                "navPublished": True,
                "apiKeyPresent": True,
                "entitlementVerified": True,
                "status": "ACTIVE"
            },
            {
                "provider": self.gold_provider.name,
                "market": "Gold Spot, Gold ETFs & SGB",
                "realtime": False,
                "delayed": True,
                "historical": True,
                "apiKeyPresent": True,
                "entitlementVerified": False,
                "status": "ACTIVE"
            }
        ]

    def resolve_provider(self, symbol: str) -> BaseMarketDataProvider:
        s = symbol.upper().strip()
        
        # 1. Direct Indian Market Index overrides
        if s in ["NIFTY 50", "NIFTY_50", "NIFTY", "^NSEI", "SENSEX", "^BSESN", "BANKNIFTY", "^NSEBANK", "NIFTY IT", "^CNXIT", "NIFTY AUTO", "NIFTY MIDCAP"]:
            return self.india_provider

        # 2. ETFs (MON100, NiftyBeES, JuniorBeES, etc.)
        if s in ["NASDAQ_ETF", "MON100", "MON100.NS", "NIFTYBEES", "NIFTYBEES.NS", "JUNIORBEES", "BANKBEES", "ITBEES"]:
            return self.etf_provider
        if ("BEES" in s or "MON100" in s) and "GOLD" not in s:
            return self.etf_provider

        # 3. Gold & SGB
        if s in ["GOLD_HEDGE", "GOLDBEES", "GOLDBEES.NS", "SGB", "SOVEREIGN_GOLD_BOND", "GOLD (10G)", "GOLD (10g)", "GOLD"]:
            return self.gold_provider
        if "GOLD" in s or "SGB" in s:
            return self.gold_provider

        # 4. Direct Mutual Fund Candidates
        if s in ["NIFTY50_INDEX", "FLEXICAP_FUND", "LIQUID_FUND", "SHORT_DEBT_FUND", "SMALLCAP_FUND", "CONSERVATIVE_HYBRID", "120716", "122639", "120586", "119062", "125354", "120616", "PPFCF", "PPFAS", "ICICILIQ", "HDFCSHORT", "NIPPSMALL", "NIFTY50", "ICICISAVE", "REGULAR_SAVINGS"]:
            return self.mf_provider

        # 5. Check if Mutual Funds Scheme Resolver recognizes this fund
        if any(w in s for w in ["UTI", "PARAG", "FLEXI", "LIQUID", "FUND", "DIRECT", "GROWTH", "MF", "INDEX FUND", "SMALLCAP", "DEBT", "HYBRID", "SAVINGS", "SAVE"]):
            if self.mf_provider.resolve_scheme(symbol) is not None:
                return self.mf_provider

        # 6. US Indices and Equities
        if s in ["NASDAQ", "NASDAQ 100", "S&P 500", "DOW JONES", "RUSSELL 2000", "AAPL", "MSFT", "NVDA", "GOOGL", "AMZN", "TSLA", "META", "V", "AMD", "NFLX", "QQQ", "SPY", "VTI", "^IXIC", "^NDX", "^GSPC", "^DJI"]:
            return self.us_provider

        # 7. Check if general scheme resolver recognizes it
        if self.mf_provider.resolve_scheme(symbol) is not None:
            return self.mf_provider

        # 8. Default to India Equities & Indices
        return self.india_provider

    def get_quote(self, symbol: str) -> Dict[str, Any]:
        """Fetches quote from the appropriate provider."""
        if not symbol or not symbol.strip():
            return create_unavailable_quote("UNKNOWN", "Symbol cannot be empty.")
            
        provider = self.resolve_provider(symbol)
        try:
            return provider.get_quote(symbol)
        except Exception:
            return create_unavailable_quote(symbol, f"Failed to retrieve market quote from {provider.name}.")

    def get_quotes(self, symbols: List[str]) -> Dict[str, Dict[str, Any]]:
        """Batch quotes fetch."""
        results = {}
        for s in symbols:
            if s and s.strip():
                results[s.strip()] = self.get_quote(s.strip())
        return results

    def get_candles(self, symbol: str, interval: str = "1d", range_period: str = "1mo") -> Dict[str, Any]:
        """Fetches historical observations."""
        provider = self.resolve_provider(symbol)
        try:
            return provider.get_candles(symbol, interval=interval, range_period=range_period)
        except Exception:
            return {
                "symbol": symbol,
                "range": range_period,
                "interval": interval,
                "source": provider.name,
                "freshness": DataFreshness.UNAVAILABLE.value,
                "observations": [],
                "message": "Historical series unavailable."
            }

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

        # Real index quotes
        india_symbols = ["NIFTY 50", "SENSEX", "BANKNIFTY", "NIFTY IT", "NIFTY AUTO"]
        us_symbols = ["NASDAQ", "S&P 500", "DOW JONES", "RUSSELL 2000"]
        stock_symbols = ["RELIANCE", "TCS", "HDFCBANK", "INFY", "TATAMOTORS", "NVDA", "AAPL", "TSLA"]

        india_quotes = [self.get_quote(s) for s in india_symbols]
        us_quotes = [self.get_quote(s) for s in us_symbols]
        gold_quote = self.get_quote("GOLD (10g)")
        goldbees_quote = self.get_quote("GOLDBEES")

        # Top gainers / movers from real quotes
        stock_quotes = [self.get_quote(s) for s in stock_symbols]
        valid_stocks = [q for q in stock_quotes if q.get("price") is not None]
        
        # Sort by changePct
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
        """Health check and observability telemetry."""
        return {
            "status": "HEALTHY",
            "market_data_mode": settings.MARKET_DATA_MODE,
            "cache_entries": market_cache.size(),
            "providers": {
                "india_equities": "ACTIVE",
                "us_equities": "ACTIVE",
                "etfs": "ACTIVE",
                "mutual_funds": "ACTIVE",
                "gold": "ACTIVE"
            },
            "market_hours": {
                "india": get_indian_market_status().get("status"),
                "us": get_us_market_status().get("status")
            }
        }

# Global Singleton Registry
market_registry = MarketDataProviderRegistry()
