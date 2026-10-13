import os
import sys
import time
import unittest
from unittest.mock import patch, MagicMock

# Ensure backend root is on sys.path
backend_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if backend_root not in sys.path:
    sys.path.insert(0, backend_root)

# Mock external heavy Angel One scrip master network/disk load for isolated testing
sys.modules["app.services.market_data.providers.angel_scrip_master"] = MagicMock()

from app.services.market_data.instrument_master import instrument_master
from app.services.market_data.signal_engine import market_signal_engine


class TestInstrumentMasterSignalSemantics(unittest.TestCase):
    """
    Regression test suite ensuring that catalog browsing does not fabricate
    daily-change BUY/HOLD labels or fixed confidence/risk scores.
    """

    def setUp(self):
        # Clear signal engine cache before each test
        market_signal_engine._cache.clear()

    def tearDown(self):
        market_signal_engine._cache.clear()

    @patch("app.services.market_data.instrument_master.GlobalUniverseManager.search_instruments")
    def test_uncached_instruments_do_not_fabricate_signals(self, mock_search):
        """
        1. An uncached instrument must return signalBadge=None and null metadata,
           regardless of whether changePct is strongly positive (+5.0%) or negative (-5.0%).
        """
        # Create mock instruments with high positive and negative price changes
        mock_inst_positive = MagicMock()
        mock_inst_positive.id = 1
        mock_inst_positive.canonical_id = "NSE:INFY"
        mock_inst_positive.figi = None
        mock_inst_positive.symbol = "INFY"
        mock_inst_positive.ticker = "INFY"
        mock_inst_positive.name = "Infosys Ltd"
        mock_inst_positive.short_name = "Infosys"
        mock_inst_positive.asset_type = "STOCK"
        mock_inst_positive.asset_class = "EQUITY"
        mock_inst_positive.market = "INDIA"
        mock_inst_positive.country = "IN"
        mock_inst_positive.exchange = "NSE"
        mock_inst_positive.exchange_mic = "XNSE"
        mock_inst_positive.currency = "INR"
        mock_inst_positive.provider = "AngelOne"
        mock_inst_positive.provider_symbol = "INFY"
        mock_inst_positive.status = "ACTIVE"
        mock_inst_positive.is_active = True
        mock_inst_positive.sector = "Technology"
        mock_inst_positive.industry = "IT Services"
        mock_inst_positive.fund_house = None
        mock_inst_positive.fund_category = None
        mock_inst_positive.scheme_code = None
        mock_inst_positive.plan = None
        mock_inst_positive.option = None
        mock_inst_positive.nav = None
        mock_inst_positive.nav_date = None
        mock_inst_positive.isin = "INE009A01021"
        mock_inst_positive.cusip = None
        mock_inst_positive.sedol = None
        mock_inst_positive.benchmark = None
        mock_inst_positive.expense_ratio = None
        mock_inst_positive.risk_level = "Moderate"
        mock_inst_positive.aliases = []
        mock_inst_positive.updated_at = None

        mock_inst_negative = MagicMock()
        mock_inst_negative.id = 2
        mock_inst_negative.canonical_id = "NSE:TCS"
        mock_inst_negative.figi = None
        mock_inst_negative.symbol = "TCS"
        mock_inst_negative.ticker = "TCS"
        mock_inst_negative.name = "Tata Consultancy Services"
        mock_inst_negative.short_name = "TCS"
        mock_inst_negative.asset_type = "STOCK"
        mock_inst_negative.asset_class = "EQUITY"
        mock_inst_negative.market = "INDIA"
        mock_inst_negative.country = "IN"
        mock_inst_negative.exchange = "NSE"
        mock_inst_negative.exchange_mic = "XNSE"
        mock_inst_negative.currency = "INR"
        mock_inst_negative.provider = "AngelOne"
        mock_inst_negative.provider_symbol = "TCS"
        mock_inst_negative.status = "ACTIVE"
        mock_inst_negative.is_active = True
        mock_inst_negative.sector = "Technology"
        mock_inst_negative.industry = "IT Services"
        mock_inst_negative.fund_house = None
        mock_inst_negative.fund_category = None
        mock_inst_negative.scheme_code = None
        mock_inst_negative.plan = None
        mock_inst_negative.option = None
        mock_inst_negative.nav = None
        mock_inst_negative.nav_date = None
        mock_inst_negative.isin = "INE467B01029"
        mock_inst_negative.cusip = None
        mock_inst_negative.sedol = None
        mock_inst_negative.benchmark = None
        mock_inst_negative.expense_ratio = None
        mock_inst_negative.risk_level = "Moderate"
        mock_inst_negative.aliases = []
        mock_inst_negative.updated_at = None

        mock_search.return_value = {
            "items": [mock_inst_positive, mock_inst_negative],
            "total": 2,
            "has_next": False
        }

        # Simulate cached quotes with strong positive (+3.5%) and negative (-4.2%) changes
        with patch("app.services.market_data.instrument_master.market_cache.get") as mock_cache_get:
            def fake_cache_lookup(key, allow_stale=False):
                if "INFY" in key:
                    return {
                        "symbol": "INFY",
                        "price": 1850.0,
                        "change": 65.0,
                        "changePct": 3.64,
                        "currency": "INR",
                        "exchange": "NSE"
                    }
                if "TCS" in key:
                    return {
                        "symbol": "TCS",
                        "price": 3900.0,
                        "change": -160.0,
                        "changePct": -3.94,
                        "currency": "INR",
                        "exchange": "NSE"
                    }
                return None

            mock_cache_get.side_effect = fake_cache_lookup

            res = instrument_master.search(query="IT", page=1, limit=10)

        items = res["items"]
        self.assertEqual(len(items), 2)

        # INFY has changePct = +3.64%. Under old bad rule, it was forced to BUY (78%, MODERATE).
        # Under genuine cleanup, it MUST be None.
        infy = items[0]
        self.assertIsNone(infy["signalBadge"])
        self.assertIsNone(infy["signal"])
        self.assertIsNone(infy["confidence"])
        self.assertIsNone(infy["riskScore"])

        # TCS has changePct = -3.94%. Under old bad rule, it was forced to HOLD (68%, MODERATE).
        # Under genuine cleanup, it MUST be None.
        tcs = items[1]
        self.assertIsNone(tcs["signalBadge"])
        self.assertIsNone(tcs["signal"])
        self.assertIsNone(tcs["confidence"])
        self.assertIsNone(tcs["riskScore"])

    @patch("app.services.market_data.instrument_master.GlobalUniverseManager.search_instruments")
    def test_valid_cached_signals_are_preserved(self, mock_search):
        """
        2. If an authentic quantitative signal was previously calculated and cached
           by market_signal_engine, it must be returned in the catalog listing.
        """
        mock_inst = MagicMock()
        mock_inst.id = 10
        mock_inst.canonical_id = "NSE:RELIANCE"
        mock_inst.figi = None
        mock_inst.symbol = "RELIANCE"
        mock_inst.ticker = "RELIANCE"
        mock_inst.name = "Reliance Industries Ltd"
        mock_inst.short_name = "Reliance"
        mock_inst.asset_type = "STOCK"
        mock_inst.asset_class = "EQUITY"
        mock_inst.market = "INDIA"
        mock_inst.country = "IN"
        mock_inst.exchange = "NSE"
        mock_inst.exchange_mic = "XNSE"
        mock_inst.currency = "INR"
        mock_inst.provider = "AngelOne"
        mock_inst.provider_symbol = "RELIANCE"
        mock_inst.status = "ACTIVE"
        mock_inst.is_active = True
        mock_inst.sector = "Energy"
        mock_inst.industry = "Oil & Gas"
        mock_inst.fund_house = None
        mock_inst.fund_category = None
        mock_inst.scheme_code = None
        mock_inst.plan = None
        mock_inst.option = None
        mock_inst.nav = None
        mock_inst.nav_date = None
        mock_inst.isin = "INE002A01018"
        mock_inst.cusip = None
        mock_inst.sedol = None
        mock_inst.benchmark = None
        mock_inst.expense_ratio = None
        mock_inst.risk_level = "Moderate"
        mock_inst.aliases = []
        mock_inst.updated_at = None

        mock_search.return_value = {
            "items": [mock_inst],
            "total": 1,
            "has_next": False
        }

        # Populate memory cache with an authentic signal bundle
        authentic_signal = {
            "overallSignal": "BUY",
            "confidence": 84,
            "riskScore": "MODERATE",
            "scoringComponents": {"trendScore": 80, "momentumScore": 75}
        }
        market_signal_engine._cache["RELIANCE"] = (time.time(), authentic_signal)

        res = instrument_master.search(query="RELIANCE", page=1, limit=10)
        items = res["items"]
        self.assertEqual(len(items), 1)

        rel = items[0]
        self.assertIsNotNone(rel["signalBadge"])
        self.assertEqual(rel["signalBadge"]["signal"], "BUY")
        self.assertEqual(rel["signalBadge"]["confidence"], 84)
        self.assertEqual(rel["signalBadge"]["riskScore"], "MODERATE")
        self.assertEqual(rel["signal"], "BUY")
        self.assertEqual(rel["confidence"], 84)
        self.assertEqual(rel["riskScore"], "MODERATE")

    @patch("app.services.market_data.instrument_master.GlobalUniverseManager.search_instruments")
    def test_uncached_quotes_do_not_block_catalog(self, mock_search):
        """
        3. Instruments with uncached quotes return an unavailable quote structure
           with price=None immediately, never executing blocking live network calls.
        """
        mock_inst = MagicMock()
        mock_inst.id = 20
        mock_inst.canonical_id = "NSE:NEWSTOCK"
        mock_inst.figi = None
        mock_inst.symbol = "NEWSTOCK"
        mock_inst.ticker = "NEWSTOCK"
        mock_inst.name = "New Stock Ltd"
        mock_inst.short_name = "New Stock"
        mock_inst.asset_type = "STOCK"
        mock_inst.asset_class = "EQUITY"
        mock_inst.market = "INDIA"
        mock_inst.country = "IN"
        mock_inst.exchange = "NSE"
        mock_inst.exchange_mic = "XNSE"
        mock_inst.currency = "INR"
        mock_inst.provider = "AngelOne"
        mock_inst.provider_symbol = "NEWSTOCK"
        mock_inst.status = "ACTIVE"
        mock_inst.is_active = True
        mock_inst.sector = "Financial Services"
        mock_inst.industry = "Finance"
        mock_inst.fund_house = None
        mock_inst.fund_category = None
        mock_inst.scheme_code = None
        mock_inst.plan = None
        mock_inst.option = None
        mock_inst.nav = None
        mock_inst.nav_date = None
        mock_inst.isin = None
        mock_inst.cusip = None
        mock_inst.sedol = None
        mock_inst.benchmark = None
        mock_inst.expense_ratio = None
        mock_inst.risk_level = "Moderate"
        mock_inst.aliases = []
        mock_inst.updated_at = None

        mock_search.return_value = {
            "items": [mock_inst],
            "total": 1,
            "has_next": False
        }

        # Cache returns None for quotes
        with patch("app.services.market_data.instrument_master.market_cache.get", return_value=None):
            with patch("app.services.market_data.registry.market_registry.get_quote") as mock_live_quote:
                res = instrument_master.search(query="NEWSTOCK", page=1, limit=10)
                # Verify that get_quote was NEVER called synchronously during catalog search
                mock_live_quote.assert_not_called()

        item = res["items"][0]
        self.assertIsNone(item["price"])
        self.assertEqual(item["quote"]["status"], "UNAVAILABLE")
        self.assertIsNone(item["signalBadge"])


if __name__ == "__main__":
    unittest.main()
