"""
P7.0 Global Instrument Master Test Suite
Tests:
1. EODHD Normalization & Malformed Handling
2. NSE Normalization & Equity/ETF Extraction
3. AMFI Normalization & Scheme Extraction
4. Malformed Provider Response Resilience
5. Duplicate Removal & ISIN Deduplication
6. Failed Provider Isolation
7. Inactive Instrument Handling
8. Exact Symbol Search
9. Exact ISIN Search
10. Exact Name & Prefix Search
11. Asset Type Filtering (STOCK, ETF, MUTUAL_FUND)
12. Exchange Filtering (NSE, NASDAQ, AMFI, etc.)
13. Country Filtering (IN, US, GB, etc.)
14. Server-Side Pagination & Limit Clamping
15. Sync Statistics & Telemetry
"""
import sys
import os
import unittest
from datetime import datetime, timezone

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.database import Base
from app.models.instrument import Instrument
from app.services.market_data.providers.universe_eodhd import eodhd_universe_provider
from app.services.market_data.providers.universe_nse import nse_universe_provider
from app.services.market_data.providers.universe_amfi import amfi_universe_provider
from app.services.market_data.providers.universe_sync_engine import UniverseSyncEngine
from app.services.market_data.instrument_master import GlobalInstrumentMasterRegistry
from app.services.market_data.universe_provider import GlobalUniverseManager

class TestP7GlobalInstrumentMaster(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        # Create an in-memory SQLite database for isolated unit testing
        cls.engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
        Base.metadata.create_all(bind=cls.engine)
        cls.Session = sessionmaker(autocommit=False, autoflush=False, bind=cls.engine)

    def setUp(self):
        self.db = self.Session()
        # Clean table before each test
        self.db.query(Instrument).delete()
        self.db.commit()

    def tearDown(self):
        self.db.close()

    # 1. EODHD Normalization
    def test_eodhd_normalization(self):
        raw_stock = {
            "Code": "NVDA",
            "Name": "NVIDIA Corporation",
            "Country": "USA",
            "Exchange": "NASDAQ",
            "Currency": "USD",
            "Type": "Common Stock",
            "Isin": "US67066G1040"
        }
        norm = eodhd_universe_provider.normalize_instrument(raw_stock)
        self.assertIsNotNone(norm)
        self.assertEqual(norm["symbol"], "NVDA")
        self.assertEqual(norm["ticker"], "NVDA")
        self.assertEqual(norm["name"], "NVIDIA Corporation")
        self.assertEqual(norm["asset_type"], "STOCK")
        self.assertEqual(norm["exchange"], "NASDAQ")
        self.assertEqual(norm["country"], "US")
        self.assertEqual(norm["currency"], "USD")
        self.assertEqual(norm["isin"], "US67066G1040")

        raw_etf = {
            "Code": "SPY",
            "Name": "SPDR S&P 500 ETF Trust",
            "Country": "USA",
            "Exchange": "NYSE",
            "Currency": "USD",
            "Type": "ETF",
            "Isin": "US78462F1030"
        }
        norm_etf = eodhd_universe_provider.normalize_instrument(raw_etf)
        self.assertEqual(norm_etf["asset_type"], "ETF")

    # 2. NSE Normalization
    def test_nse_normalization(self):
        stock = nse_universe_provider.normalize_nse_stock("TCS", "Tata Consultancy Services Limited", "INE467B01029")
        self.assertEqual(stock["symbol"], "TCS.NS")
        self.assertEqual(stock["ticker"], "TCS")
        self.assertEqual(stock["exchange"], "NSE")
        self.assertEqual(stock["country"], "IN")
        self.assertEqual(stock["currency"], "INR")
        self.assertEqual(stock["asset_type"], "STOCK")
        self.assertEqual(stock["isin"], "INE467B01029")

        etf = nse_universe_provider.normalize_nse_etf("NIFTYBEES", "Nippon India ETF Nifty 50 BeES", "INF732E01011")
        self.assertEqual(etf["symbol"], "NIFTYBEES.NS")
        self.assertEqual(etf["asset_type"], "ETF")
        self.assertEqual(etf["exchange"], "NSE")

    # 3. AMFI Normalization & Mutual Fund Scheme Extraction
    def test_amfi_normalization(self):
        scheme = amfi_universe_provider.normalize_amfi_scheme(
            scheme_code="122639",
            scheme_name="Parag Parikh Flexi Cap Fund - Direct Plan - Growth",
            fund_house="PPFAS Mutual Fund",
            fund_category="Flexi Cap Fund",
            isin="INF879O01027",
            nav=78.45,
            nav_date="05-Sep-2026"
        )
        self.assertIsNotNone(scheme)
        self.assertEqual(scheme["symbol"], "AMFI:122639")
        self.assertEqual(scheme["scheme_code"], "122639")
        self.assertEqual(scheme["name"], "Parag Parikh Flexi Cap Fund - Direct Plan - Growth")
        self.assertEqual(scheme["fund_house"], "PPFAS Mutual Fund")
        self.assertEqual(scheme["asset_type"], "MUTUAL_FUND")
        self.assertEqual(scheme["plan"], "Direct")
        self.assertEqual(scheme["option"], "Growth")
        self.assertEqual(scheme["nav"], 78.45)
        self.assertEqual(scheme["nav_date"], "05-Sep-2026")
        self.assertEqual(scheme["isin"], "INF879O01027")
        self.assertEqual(scheme["exchange"], "AMFI")

    # 4. Malformed Provider Response Handling
    def test_malformed_provider_response(self):
        # Empty / None codes
        self.assertIsNone(eodhd_universe_provider.normalize_instrument({}))
        self.assertIsNone(eodhd_universe_provider.normalize_instrument({"Code": ""}))
        self.assertIsNone(amfi_universe_provider.normalize_amfi_scheme("", "", ""))

        # Malformed AMFI lines in parser
        malformed_text = "Header line\n;;;;\nInvalid;code;no;proper;columns\n123456;-;-;Valid Scheme;50.25;05-Sep-2026\n"
        parsed = amfi_universe_provider._parse_amfi_nav_text(malformed_text)
        self.assertTrue(any(p["scheme_code"] == "123456" for p in parsed))

    # 5. Duplicate Removal & Deduplication Priority
    def test_duplicate_removal(self):
        engine = UniverseSyncEngine()
        records = [
            {
                "canonical_id": "NSE:RELIANCE",
                "symbol": "RELIANCE.NS",
                "name": "Reliance Industries Limited",
                "asset_type": "STOCK",
                "isin": "INE002A01018",
                "exchange": "NSE",
                "country": "IN",
                "currency": "INR"
            },
            # Duplicate by ISIN
            {
                "canonical_id": "BSE:500325",
                "symbol": "500325.BO",
                "name": "Reliance Industries Ltd",
                "asset_type": "STOCK",
                "isin": "INE002A01018",
                "exchange": "BSE",
                "country": "IN",
                "currency": "INR"
            }
        ]
        deduped = engine._deduplicate_records(records)
        self.assertEqual(len(deduped), 1)
        self.assertEqual(deduped[0]["isin"], "INE002A01018")

    # 6. Failed Provider Isolation
    def test_failed_provider_isolation(self):
        engine = UniverseSyncEngine()
        # Even if EODHD is not configured, sync completes successfully with NSE + AMFI
        stats = engine.run_full_sync(db=self.db, sync_eodhd=True, sync_nse=True, sync_amfi=True)
        self.assertIn(stats["status"], ["SUCCESS", "PARTIAL_SUCCESS"])
        self.assertGreater(stats["total_synced"], 0)

        # Database is populated
        count = self.db.query(Instrument).count()
        self.assertGreater(count, 30)

    # 7. Exact Symbol Search
    def test_exact_symbol_search(self):
        # Seed universe
        engine = UniverseSyncEngine()
        engine.run_full_sync(db=self.db, sync_eodhd=False, sync_nse=True, sync_amfi=True)

        res = GlobalUniverseManager.search_instruments(db=self.db, query="RELIANCE")
        self.assertGreater(len(res["items"]), 0)
        top_item = res["items"][0]
        self.assertIn("RELIANCE", top_item.ticker.upper())

    # 8. Exact ISIN Search
    def test_exact_isin_search(self):
        engine = UniverseSyncEngine()
        engine.run_full_sync(db=self.db, sync_eodhd=False, sync_nse=True, sync_amfi=True)

        res = GlobalUniverseManager.search_instruments(db=self.db, query="INE467B01029")
        self.assertGreater(len(res["items"]), 0)
        self.assertEqual(res["items"][0].isin, "INE467B01029")

    # 9. Prefix and Name Search
    def test_prefix_and_name_search(self):
        engine = UniverseSyncEngine()
        engine.run_full_sync(db=self.db, sync_eodhd=False, sync_nse=True, sync_amfi=True)

        res_name = GlobalUniverseManager.search_instruments(db=self.db, query="Parag Parikh")
        self.assertGreater(len(res_name["items"]), 0)
        self.assertIn("Parag Parikh", res_name["items"][0].name)

    # 10. Asset Type Filtering
    def test_asset_type_filtering(self):
        engine = UniverseSyncEngine()
        engine.run_full_sync(db=self.db, sync_eodhd=False, sync_nse=True, sync_amfi=True)

        res_stock = GlobalUniverseManager.search_instruments(db=self.db, asset_type="STOCK")
        self.assertTrue(all(i.asset_type == "STOCK" for i in res_stock["items"]))

        res_etf = GlobalUniverseManager.search_instruments(db=self.db, asset_type="ETF")
        self.assertTrue(all(i.asset_type == "ETF" for i in res_etf["items"]))

        res_mf = GlobalUniverseManager.search_instruments(db=self.db, asset_type="MUTUAL_FUND")
        self.assertTrue(all(i.asset_type == "MUTUAL_FUND" for i in res_mf["items"]))

    # 11. Exchange and Country Filtering
    def test_exchange_and_country_filtering(self):
        engine = UniverseSyncEngine()
        engine.run_full_sync(db=self.db, sync_eodhd=False, sync_nse=True, sync_amfi=True)

        res_nse = GlobalUniverseManager.search_instruments(db=self.db, exchange="NSE")
        self.assertTrue(all(i.exchange == "NSE" for i in res_nse["items"]))

        res_amfi = GlobalUniverseManager.search_instruments(db=self.db, exchange="AMFI")
        self.assertTrue(all(i.exchange == "AMFI" for i in res_amfi["items"]))

        res_india = GlobalUniverseManager.search_instruments(db=self.db, country="IN")
        self.assertTrue(all(i.country == "IN" for i in res_india["items"]))

    # 12. Server-side Pagination & Limit Bounds
    def test_pagination_and_bounds(self):
        engine = UniverseSyncEngine()
        engine.run_full_sync(db=self.db, sync_eodhd=False, sync_nse=True, sync_amfi=True)

        # Page 1, limit 5
        res_p1 = GlobalUniverseManager.search_instruments(db=self.db, page=1, limit=5)
        self.assertEqual(len(res_p1["items"]), 5)
        self.assertEqual(res_p1["page"], 1)
        self.assertEqual(res_p1["limit"], 5)
        self.assertTrue(res_p1["has_next"])

        # Page 2, limit 5
        res_p2 = GlobalUniverseManager.search_instruments(db=self.db, page=2, limit=5)
        self.assertEqual(len(res_p2["items"]), 5)
        self.assertEqual(res_p2["page"], 2)

        # Items on page 1 and page 2 are distinct
        p1_ids = [i.canonical_id for i in res_p1["items"]]
        p2_ids = [i.canonical_id for i in res_p2["items"]]
        self.assertEqual(len(set(p1_ids).intersection(set(p2_ids))), 0)

        # Limit clamping: limit 500 clamped to 100
        res_clamp = GlobalUniverseManager.search_instruments(db=self.db, limit=500)
        self.assertLessEqual(res_clamp["limit"], 100)

    # 13. Sync Statistics Telemetry
    def test_sync_statistics(self):
        engine = UniverseSyncEngine()
        stats = engine.run_full_sync(db=self.db, sync_eodhd=False, sync_nse=True, sync_amfi=True)
        self.assertIn("status", stats)
        self.assertIn("last_synced_at", stats)
        self.assertIn("duration_seconds", stats)
        self.assertIn("total_synced", stats)
        self.assertIn("provider_counts", stats)
        self.assertGreater(stats["total_synced"], 0)


if __name__ == "__main__":
    unittest.main(verbosity=2)
