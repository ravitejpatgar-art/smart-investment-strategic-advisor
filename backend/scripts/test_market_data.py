import os
import sys
import unittest

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.services.market_data.freshness import DataFreshness, is_data_stale
from app.services.market_data.base import ProviderCapabilities
from app.services.market_data.normalizer import normalize_market_quote, create_unavailable_quote
from app.services.market_data.validator import validate_quote_data
from app.services.market_data.market_hours import get_indian_market_status, get_us_market_status
from app.services.market_data.cache import MarketDataCache
from app.services.market_data.indian_equities import IndianEquitiesProvider
from app.services.market_data.us_equities import USEquitiesProvider
from app.services.market_data.etfs import ETFProvider
from app.services.market_data.mutual_funds import MutualFundsProvider
from app.services.market_data.gold import GoldProvider
from app.services.market_data.fundamentals import get_instrument_fundamentals
from app.services.market_data.registry import market_registry
from app.services.ai_assistant import generate_ai_assistant_response

class TestMarketDataEngine(unittest.TestCase):

    def setUp(self):
        self.cache = MarketDataCache()
        self.cache.clear()

    def test_01_freshness_enum(self):
        """Verify all required freshness classifications exist."""
        self.assertEqual(DataFreshness.REALTIME.value, "REALTIME")
        self.assertEqual(DataFreshness.DELAYED.value, "DELAYED")
        self.assertEqual(DataFreshness.LATEST_AVAILABLE.value, "LATEST_AVAILABLE")
        self.assertEqual(DataFreshness.END_OF_DAY.value, "END_OF_DAY")
        self.assertEqual(DataFreshness.HISTORICAL.value, "HISTORICAL")
        self.assertEqual(DataFreshness.MODEL_ASSUMPTION.value, "MODEL_ASSUMPTION")
        self.assertEqual(DataFreshness.STALE.value, "STALE")
        self.assertEqual(DataFreshness.UNAVAILABLE.value, "UNAVAILABLE")

    def test_02_quote_normalizer_and_validator(self):
        """Verify normalizer creates canonical schema and validator checks sanity."""
        quote = normalize_market_quote(
            symbol="RELIANCE",
            name="Reliance Industries Ltd",
            exchange="NSE",
            asset_type="EQUITY",
            price=2850.50,
            change=25.50,
            change_pct=0.90,
            volume=1500000,
            freshness=DataFreshness.DELAYED,
            source="NSE / Yahoo Finance",
            currency="INR"
        )
        self.assertEqual(quote["symbol"], "RELIANCE")
        self.assertEqual(quote["price"], 2850.50)
        self.assertEqual(quote["freshness"], "DELAYED")
        self.assertEqual(quote["currency"], "INR")
        self.assertIn("asOf", quote)
        
        valid, msg = validate_quote_data(quote)
        self.assertTrue(valid)

    def test_03_unavailable_quote_zero_fake_data(self):
        """Verify unavailable quote contains null price and zero fabricated numbers."""
        unav = create_unavailable_quote("UNKNOWN_XYZ", "Instrument not found")
        self.assertEqual(unav["symbol"], "UNKNOWN_XYZ")
        self.assertIsNone(unav["price"])
        self.assertIsNone(unav["change"])
        self.assertEqual(unav["freshness"], "UNAVAILABLE")
        self.assertIn("not found", unav["message"])

    def test_04_market_hours_engine(self):
        """Verify market hours engine returns status, timezone and reason."""
        in_status = get_indian_market_status()
        self.assertIn(in_status["status"], ["OPEN", "CLOSED", "PRE_MARKET", "AFTER_HOURS"])
        self.assertIn("IST", in_status["timezone"])

        us_status = get_us_market_status()
        self.assertIn(us_status["status"], ["OPEN", "CLOSED", "PRE_MARKET", "AFTER_HOURS"])
        self.assertIn("ET", us_status["timezone"])

    def test_05_cache_ttl_and_stale_handling(self):
        """Verify cache expires after TTL and supports allow_stale fallback with STALE tag."""
        cache = MarketDataCache()
        cache.clear()
        
        sample = {"symbol": "TEST", "price": 100.0, "freshness": "REALTIME"}
        cache.set("quote:test", sample, ttl_seconds=0.01)
        
        import time
        time.sleep(0.05)
        
        # Immediate get should return None
        self.assertIsNone(cache.get("quote:test", allow_stale=False))
        
        # Stale get should return STALE freshness
        stale_val = cache.get("quote:test", allow_stale=True)
        self.assertIsNotNone(stale_val)
        self.assertEqual(stale_val["freshness"], "STALE")

    def test_06_indian_equities_quote(self):
        """Verify IndianEquitiesProvider fetches or normalizes quotes."""
        provider = IndianEquitiesProvider()
        quote = provider.get_quote("NIFTY 50")
        self.assertEqual(quote["symbol"], "NIFTY 50")
        self.assertIn(quote["freshness"], ["DELAYED", "REALTIME", "UNAVAILABLE", "STALE"])
        if quote["price"] is not None:
            self.assertGreater(quote["price"], 1000)

    def test_07_mutual_funds_nav_classification(self):
        """Verify MutualFundsProvider classifies data as LATEST_AVAILABLE and never LIVE."""
        provider = MutualFundsProvider()
        quote = provider.get_quote("UTI Nifty 50 Index Fund Direct")
        self.assertIn(quote["freshness"], ["LATEST_AVAILABLE", "UNAVAILABLE", "STALE"])
        self.assertNotEqual(quote["freshness"], "REALTIME") # Must NEVER be called LIVE
        if quote["price"] is not None:
            self.assertGreater(quote["price"], 50)
            self.assertIn("AMFI", quote["source"])

    def test_08_gold_provider_differentiation(self):
        """Verify GoldProvider differentiates Spot Reference vs Gold ETF."""
        provider = GoldProvider()
        gold_spot = provider.get_quote("GOLD (10g)")
        self.assertIn(gold_spot["assetType"], ["COMMODITY_SPOT", "UNKNOWN"])

        gold_etf = provider.get_quote("GOLDBEES")
        self.assertIn(gold_etf["assetType"], ["GOLD_ETF", "UNKNOWN"])

    def test_09_etf_provider(self):
        """Verify ETF provider quote and fundamentals."""
        provider = ETFProvider()
        quote = provider.get_quote("NIFTYBEES")
        self.assertIn(quote["freshness"], ["DELAYED", "REALTIME", "UNAVAILABLE", "STALE"])

    def test_10_us_equities_provider(self):
        """Verify US equities provider quote."""
        provider = USEquitiesProvider()
        quote = provider.get_quote("AAPL")
        self.assertEqual(quote["currency"], "USD")
        self.assertIn(quote["freshness"], ["REALTIME", "DELAYED", "END_OF_DAY", "UNAVAILABLE", "STALE"])

    def test_11_fundamentals_aggregator(self):
        """Verify fundamental ratios fetch."""
        fund = get_instrument_fundamentals("RELIANCE")
        self.assertEqual(fund["symbol"], "RELIANCE")
        self.assertIn("freshness", fund)

    def test_12_registry_capability_matrix(self):
        """Verify registry capability matrix includes all 5 market segments and entitlementVerified."""
        matrix = market_registry.get_capability_matrix()
        self.assertEqual(len(matrix), 5)
        providers = [m["market"] for m in matrix]
        self.assertTrue(any("India" in p for p in providers))
        self.assertTrue(any("US" in p for p in providers))
        self.assertTrue(any("Mutual Funds" in p for p in providers))
        self.assertTrue(any("ETFs" in p for p in providers))
        self.assertTrue(any("Gold" in p for p in providers))
        
        # Verify entitlementVerified is reported
        for p in matrix:
            self.assertIn("entitlementVerified", p)

    def test_13_registry_market_overview(self):
        """Verify global market overview returns structured indices and status."""
        ov = market_registry.get_market_overview()
        self.assertIn("india_status", ov)
        self.assertIn("us_status", ov)
        self.assertIn("indices", ov)
        self.assertIn("top_gainers", ov)

    def test_14_ai_assistant_market_query_integration(self):
        """Verify AI assistant incorporates real market quotes when asked about Nifty."""
        user_ctx = {
            "name": "Ravi",
            "age": 29,
            "monthlyIncome": 120000,
            "monthlyExpenses": 50000,
            "riskTolerance": "Moderate",
            "investmentHorizon": "10 years"
        }
        res = generate_ai_assistant_response("What is Nifty doing today in the market?", user_ctx)
        self.assertEqual(res["intent"], "MARKET_QUESTION")
        self.assertIn("BOTTOM LINE", res["answer"])
        self.assertIn("NIFTY 50", res["answer"])
        self.assertIn("Timestamp", res["answer"])

    def test_15_health_check_endpoint(self):
        """Verify health check returns active providers."""
        health = market_registry.get_health_status()
        self.assertEqual(health["status"], "HEALTHY")
        self.assertIn("providers", health)

    def test_16_runtime_entitlement_and_yfinance_never_realtime_nse(self):
        """Verify that without verified NSE subscription, Indian feed outputs DELAYED, never REALTIME."""
        provider = IndianEquitiesProvider()
        if not provider.capabilities.entitlement_verified:
            self.assertFalse(provider.capabilities.realtime)
            quote = provider.get_quote("RELIANCE")
            if quote["price"] is not None:
                self.assertEqual(quote["freshness"], "DELAYED")
                self.assertNotEqual(quote["freshness"], "REALTIME")

    def test_17_historical_candles_validation_and_range_scaling(self):
        """Verify candles endpoint returns valid ascending numeric observation series with distinct 1Y vs 3Y datasets."""
        # 1. Mutual Fund (AMFI)
        mf_1y = market_registry.get_candles("nifty50_index", "1d", "1y")
        mf_3y = market_registry.get_candles("nifty50_index", "1d", "3y")
        
        self.assertIn(mf_1y["freshness"], ["HISTORICAL", "UNAVAILABLE"])
        if mf_1y["freshness"] == "HISTORICAL":
            self.assertGreater(len(mf_1y["observations"]), 20)
            self.assertGreater(len(mf_3y["observations"]), 20)
            
            # Verify observation properties
            first_obs_1y = mf_1y["observations"][0]
            last_obs_1y = mf_1y["observations"][-1]
            first_obs_3y = mf_3y["observations"][0]
            
            self.assertIn("date", first_obs_1y)
            self.assertIn("close", first_obs_1y)
            self.assertIn("nav", first_obs_1y)
            self.assertIsInstance(first_obs_1y["close"], (int, float))
            self.assertGreater(first_obs_1y["close"], 0)
            
            # Verify ascending date order
            self.assertLessEqual(first_obs_1y["date"], last_obs_1y["date"])
            
            # Verify 3Y starts earlier than 1Y
            self.assertLess(first_obs_3y["date"], first_obs_1y["date"])
        
        # 2. ETF (MON100 / GOLDBEES)
        etf_candles = market_registry.get_candles("MON100", "1d", "1y")
        self.assertEqual(etf_candles["freshness"], "HISTORICAL")
        self.assertGreater(len(etf_candles["observations"]), 20)
        self.assertIsInstance(etf_candles["observations"][0]["close"], (int, float))

    def test_18_unavailable_instrument_no_fake_chart(self):
        """Verify unavailable instrument returns empty observation list, not synthetic data."""
        candles = market_registry.get_candles("NON_EXISTENT_XYZ_123", "1d", "1y")
        self.assertEqual(candles["freshness"], "UNAVAILABLE")
        self.assertEqual(len(candles["observations"]), 0)

if __name__ == "__main__":
    unittest.main(verbosity=2)
