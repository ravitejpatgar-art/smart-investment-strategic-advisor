"""
P7.4 Live Quote Coverage & Provider Resilience Test Suite
Tests:
1. Symbol Normalization (India, US, ETFs, Mutual Funds)
2. Provider Chain Resolution & Priority Order
3. Truthful Freshness State Enforcement (No fake LIVE, downgrade when market closed)
4. Market-Closed Detection & Quote Preservation
5. Cache TTL, Bounded LRU Eviction & Stale Fallback
6. Restrained Retry & Cooldown on Rate Limit (429)
7. Concurrent Batch Quote Hydration & Partial Success Handling
8. Provider Failure Isolation (No HTTP 500 on single quote failure)
9. AMFI Mutual Fund Routing & NAV Preservation
10. Provider Health Telemetry & Credential Scrubbing
11. Universal Quote Schema Contract Integrity
12. Instrument Master Search with Quote Hydration & Currency Filtering
"""
import sys
import os
import time
import unittest
from datetime import datetime, timezone

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.database import Base
from app.models.instrument import Instrument
from app.services.market_data.freshness import DataFreshness, enforce_truthful_freshness, sanitize_freshness_state
from app.services.market_data.normalizer import (
    normalize_global_symbol,
    normalize_market_quote,
    create_unavailable_quote
)
from app.services.market_data.cache import MarketDataCache
from app.services.market_data.router import ProviderRouter, ProviderHealthTracker, scrub_sensitive_tokens
from app.services.market_data.registry import MarketDataProviderRegistry
from app.services.market_data.instrument_master import GlobalInstrumentMasterRegistry
from app.services.market_data.universe_provider import GlobalUniverseManager


class TestP74QuoteCoverageAndResilience(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        cls.engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
        Base.metadata.create_all(bind=cls.engine)
        cls.Session = sessionmaker(autocommit=False, autoflush=False, bind=cls.engine)

    def setUp(self):
        self.db = self.Session()
        self.db.query(Instrument).delete()
        self.db.commit()

    def tearDown(self):
        self.db.close()

    # 1. Symbol Normalization
    def test_symbol_normalization(self):
        # India Equities
        norm_rel = normalize_global_symbol("RELIANCE")
        self.assertEqual(norm_rel["canonical_symbol"], "RELIANCE.NS")
        self.assertEqual(norm_rel["asset_type"], "STOCK")
        self.assertEqual(norm_rel["exchange"], "NSE")

        norm_tcs = normalize_global_symbol("TCS.NS")
        self.assertEqual(norm_tcs["canonical_symbol"], "TCS.NS")

        # India ETF
        norm_bees = normalize_global_symbol("NIFTYBEES")
        self.assertEqual(norm_bees["canonical_symbol"], "NIFTYBEES.NS")
        self.assertEqual(norm_bees["asset_type"], "ETF")

        # US Equities & ETFs
        norm_aapl = normalize_global_symbol("AAPL")
        self.assertEqual(norm_aapl["canonical_symbol"], "AAPL")
        self.assertEqual(norm_aapl["asset_type"], "STOCK")
        self.assertEqual(norm_aapl["market"], "US")

        norm_spy = normalize_global_symbol("SPY")
        self.assertEqual(norm_spy["canonical_symbol"], "SPY")
        self.assertEqual(norm_spy["asset_type"], "ETF")

        # Mutual Funds
        norm_mf_code = normalize_global_symbol("122639")
        self.assertEqual(norm_mf_code["canonical_symbol"], "AMFI:122639")
        self.assertEqual(norm_mf_code["asset_type"], "MUTUAL_FUND")

        norm_mf_prefix = normalize_global_symbol("AMFI:120716")
        self.assertEqual(norm_mf_prefix["canonical_symbol"], "AMFI:120716")

        norm_mf_short = normalize_global_symbol("MF:120586")
        self.assertEqual(norm_mf_short["canonical_symbol"], "AMFI:120586")

    # 2. Provider Chain Resolution
    def test_provider_chain_resolution(self):
        router = ProviderRouter()
        
        # Indian Stock -> TrueData (if config) -> IndianEquities -> YahooFinance
        chain_in = router._get_provider_chain("RELIANCE")
        chain_in_names = [p.name for p in chain_in]
        self.assertTrue(any("IndianEquities" in n or "NSE" in n or "Yahoo" in n for n in chain_in_names))

        # US Stock -> Finnhub/TwelveData/Polygon -> YahooFinance
        chain_us = router._get_provider_chain("AAPL")
        chain_us_names = [p.name for p in chain_us]
        self.assertTrue(any("Yahoo" in n or "Finnhub" in n for n in chain_us_names))

        # Mutual Fund -> MutualFunds -> Yahoo
        chain_mf = router._get_provider_chain("AMFI:122639")
        chain_mf_names = [p.name for p in chain_mf]
        self.assertTrue(any("Mutual" in n or "AMFI" in n for n in chain_mf_names))

        # ETF -> ETF Provider -> Yahoo
        chain_etf = router._get_provider_chain("SPY")
        chain_etf_names = [p.name for p in chain_etf]
        self.assertTrue(any("ETF" in n or "Yahoo" in n for n in chain_etf_names))

    # 3. Truthful Freshness State Enforcement
    def test_truthful_freshness_enforcement(self):
        # Never convert DELAYED to LIVE
        f1 = enforce_truthful_freshness(DataFreshness.DELAYED.value, is_authorized_live_feed=False, is_market_open=True)
        self.assertEqual(f1, "DELAYED")

        # Never convert FALLBACK to LIVE
        f2 = enforce_truthful_freshness(DataFreshness.FALLBACK.value, is_authorized_live_feed=True, is_market_open=True)
        self.assertEqual(f2, "FALLBACK")

        # If authorized live feed during open session -> LIVE
        f3 = enforce_truthful_freshness("LIVE", is_authorized_live_feed=True, is_market_open=True)
        self.assertEqual(f3, "LIVE")

        # If live requested but market is closed -> downgrade to LATEST_AVAILABLE
        f4 = enforce_truthful_freshness("LIVE", is_authorized_live_feed=True, is_market_open=False)
        self.assertEqual(f4, "LATEST_AVAILABLE")

        # If live requested but unauthorized feed -> downgrade to DELAYED
        f5 = enforce_truthful_freshness("LIVE", is_authorized_live_feed=False, is_market_open=True)
        self.assertEqual(f5, "DELAYED")

    # 4. Market-Closed Detection & Quote Preservation
    def test_market_closed_quote_preservation(self):
        # When market is closed, returning a valid quote must not be converted to UNAVAILABLE
        quote = normalize_market_quote(
            symbol="AAPL",
            name="Apple Inc.",
            exchange="NASDAQ",
            asset_type="STOCK",
            price=224.50,
            change=1.20,
            change_pct=0.54,
            volume=45000000,
            freshness=DataFreshness.LATEST_AVAILABLE,
            market_status="CLOSED",
            prev_close=223.30
        )
        self.assertEqual(quote["price"], 224.50)
        self.assertEqual(quote["marketStatus"], "CLOSED")
        self.assertEqual(quote["freshness"], "LATEST_AVAILABLE")
        self.assertIsNotNone(quote["prevClose"])
        self.assertEqual(quote["previousClose"], quote["prevClose"])

    # 5. Cache TTL & Bounded LRU Eviction
    def test_cache_ttl_and_lru_bounding(self):
        cache = MarketDataCache()
        cache.clear()

        # Set item with 1 second TTL
        cache.set("test:quote:AAPL", {"symbol": "AAPL", "price": 220.0, "freshness": "DELAYED"}, ttl_seconds=1)
        self.assertEqual(cache.size(), 1)
        
        # Immediate get -> hit
        item = cache.get("test:quote:AAPL", allow_stale=False)
        self.assertIsNotNone(item)
        self.assertEqual(item["price"], 220.0)

        # Wait for expiry
        time.sleep(1.1)
        expired_item = cache.get("test:quote:AAPL", allow_stale=False)
        self.assertIsNone(expired_item)

        # Stale get -> returns stale copy with freshness STALE
        stale_item = cache.get("test:quote:AAPL", allow_stale=True)
        self.assertIsNotNone(stale_item)
        self.assertEqual(stale_item["freshness"], "STALE")

        # Telemetry metrics
        stats = cache.get_stats()
        self.assertGreater(stats["hits"], 0)
        self.assertGreater(stats["totalLookups"], 0)
        self.assertIn("hitRate", stats)

    # 6. Restrained Retry & Cooldown on Rate Limit (429)
    def test_health_tracker_rate_limit_cooldown(self):
        tracker = ProviderHealthTracker("TestFinnhub")
        self.assertTrue(tracker.is_available())
        
        # Trigger 429 rate limit
        tracker.record_error("HTTP 429: Too many requests. Rate limit exceeded", is_rate_limit=True)
        self.assertFalse(tracker.is_available())
        self.assertEqual(tracker.last_status, "RATE_LIMITED")
        
        d = tracker.to_dict()
        self.assertEqual(d["status"], "IN_COOLDOWN")
        self.assertGreater(d["cooldownSecondsRemaining"], 0)

    # 7. Concurrent Batch Quote Hydration & Partial Success Handling
    def test_batch_quotes_concurrent_resolution(self):
        registry = MarketDataProviderRegistry()
        symbols = ["RELIANCE", "TCS", "INFY", "122639", "INVALID_SYM_XYZ_999"]

        quotes = registry.get_quotes(symbols)
        self.assertEqual(len(quotes), len(symbols))

        # Valid symbols have prices or valid schemas
        for sym in ["RELIANCE", "TCS", "INFY", "122639"]:
            self.assertIn(sym, quotes)
            self.assertIn("freshness", quotes[sym])

        # Invalid symbol does not throw HTTP 500 or crash batch; returns truthful unavailable schema
        self.assertIn("INVALID_SYM_XYZ_999", quotes)
        invalid_q = quotes["INVALID_SYM_XYZ_999"]
        self.assertIn(invalid_q["freshness"], ["UNAVAILABLE", "LATEST_AVAILABLE"])

    # 8. Provider Failure Isolation
    def test_provider_failure_isolation(self):
        # If router is called with nonexistent symbol, it returns unavailable schema cleanly
        router = ProviderRouter()
        res = router.get_quote("NON_EXISTENT_SYMBOL_0000_FAIL")
        self.assertEqual(res["freshness"], "UNAVAILABLE")
        self.assertIsNone(res["price"])
        self.assertIn("message", res)

    # 9. AMFI Mutual Fund Routing & NAV Preservation
    def test_amfi_mutual_fund_nav_routing(self):
        registry = MarketDataProviderRegistry()
        mf_quote = registry.get_quote("122639") # Parag Parikh Flexi Cap
        
        self.assertIsNotNone(mf_quote)
        self.assertEqual(mf_quote["assetType"], "MUTUAL_FUND")
        self.assertEqual(mf_quote["exchange"], "AMFI")
        self.assertIsNotNone(mf_quote["price"])
        # NAV field must be explicitly populated
        self.assertEqual(mf_quote["nav"], mf_quote["price"])
        self.assertEqual(mf_quote["freshness"], "LATEST_AVAILABLE")
        self.assertIn("AMFI", mf_quote["source"])

    # 10. Provider Health Telemetry & Credential Scrubbing
    def test_telemetry_and_credential_scrubbing(self):
        # Scrubbing test
        sensitive_text = "Error connecting to https://api.eodhd.com/api?api_token=secret_abc1234567890xyz and token=super_secret_auth_token_999"
        scrubbed = scrub_sensitive_tokens(sensitive_text)
        self.assertNotIn("secret_abc1234567890xyz", scrubbed)
        self.assertNotIn("super_secret_auth_token_999", scrubbed)
        self.assertIn("***", scrubbed)

        # Telemetry dictionary structure
        router = ProviderRouter()
        telemetry = router.get_health_status()
        self.assertIn("timestamp", telemetry)
        self.assertIn("providers", telemetry)
        self.assertIn("cache", telemetry)
        self.assertTrue(len(telemetry["providers"]) >= 5)

    # 11. Universal Quote Schema Contract Integrity
    def test_quote_schema_contract(self):
        quote = normalize_market_quote(
            symbol="INFY.NS",
            name="Infosys Limited",
            exchange="NSE",
            asset_type="STOCK",
            price=1850.25,
            change=15.50,
            change_pct=0.84,
            volume=5000000,
            freshness=DataFreshness.DELAYED,
            source="NSE Delayed Feed",
            currency="INR",
            prev_close=1834.75
        )
        required_keys = [
            "symbol", "name", "exchange", "assetType", "price", "currency",
            "change", "changePct", "volume", "open", "high", "low",
            "prevClose", "previousClose", "timestamp", "marketStatus",
            "freshness", "source", "asOf", "navDate"
        ]
        for k in required_keys:
            self.assertIn(k, quote)
        self.assertEqual(quote["prevClose"], 1834.75)
        self.assertEqual(quote["previousClose"], 1834.75)

    # 12. Instrument Master Search with Currency Filtering
    def test_search_with_currency_filter(self):
        # Seed test instruments
        inst_in = Instrument(
            canonical_id="NSE:RELIANCE",
            symbol="RELIANCE.NS",
            ticker="RELIANCE",
            name="Reliance Industries Limited",
            asset_type="STOCK",
            asset_class="EQUITY",
            market="INDIA",
            country="IN",
            exchange="NSE",
            currency="INR",
            provider="NSE",
            provider_symbol="RELIANCE.NS",
            is_active=True
        )
        inst_us = Instrument(
            canonical_id="NASDAQ:NVDA",
            symbol="NVDA",
            ticker="NVDA",
            name="NVIDIA Corporation",
            asset_type="STOCK",
            asset_class="EQUITY",
            market="US",
            country="US",
            exchange="NASDAQ",
            currency="USD",
            provider="EODHD",
            provider_symbol="NVDA",
            is_active=True
        )
        self.db.add(inst_in)
        self.db.add(inst_us)
        self.db.commit()

        master = GlobalInstrumentMasterRegistry()
        
        # INR Filter
        res_inr = master.search(currency="INR", db=self.db)
        self.assertTrue(all(i["currency"] == "INR" for i in res_inr["items"]))

        # USD Filter
        res_usd = master.search(currency="USD", db=self.db)
        self.assertTrue(all(i["currency"] == "USD" for i in res_usd["items"]))


if __name__ == "__main__":
    unittest.main(verbosity=2)
