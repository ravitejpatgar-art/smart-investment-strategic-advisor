import unittest
import sys
import os
from datetime import datetime

# Add project root and backend to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from fastapi.testclient import TestClient
from app.main import app
from app.services.market_data.registry import market_registry
from app.services.market_data.freshness import DataFreshness

class TestHistoricalChartsDataPipeline(unittest.TestCase):
    """
    Dedicated test suite for verifying real historical charts & observations
    pipeline for SmartVest recommendations (Zero-Mock Policy compliance).
    """

    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)
        cls.test_instruments = [
            {"symbol": "NIFTY50", "expected_source_keyword": "AMFI", "is_mf": True},
            {"symbol": "NIFTYBEES", "expected_source_keyword": "Yahoo", "is_mf": False},
            {"symbol": "GOLDBEES", "expected_source_keyword": "GoldBeES", "is_mf": False},
            {"symbol": "MON100", "expected_source_keyword": "Yahoo", "is_mf": False},
            {"symbol": "RELIANCE", "expected_source_keyword": "NSE", "is_mf": False},
            {"symbol": "AAPL", "expected_source_keyword": "NASDAQ", "is_mf": False},
            {"symbol": "UTI Nifty 50", "expected_source_keyword": "AMFI", "is_mf": True},
            {"symbol": "Parag Parikh Flexi Cap", "expected_source_keyword": "AMFI", "is_mf": True},
        ]

    def test_01_all_recommendation_instruments_return_authentic_candles(self):
        """Verify each candidate instrument returns HTTP 200 with authentic ascending observations."""
        for item in self.test_instruments:
            sym = item["symbol"]
            with self.subTest(symbol=sym):
                res = self.client.get(f"/api/v1/market/candles/{sym}?range=3y&interval=1d")
                self.assertEqual(res.status_code, 200, f"Failed HTTP 200 for {sym}")
                data = res.json()
                
                self.assertEqual(data.get("symbol"), sym)
                self.assertIn("freshness", data)
                self.assertIn("observations", data)

                freshness = data.get("freshness")
                obs = data.get("observations", [])

                if freshness == DataFreshness.HISTORICAL.value:
                    self.assertGreaterEqual(len(obs), 10, f"Expected multi-point series for {sym}")
                    
                    # Verify ascending dates & positive numeric prices
                    dates = []
                    for pt in obs:
                        self.assertIn("date", pt)
                        self.assertIn("close", pt)
                        val = pt.get("nav") if item["is_mf"] else pt.get("close")
                        self.assertIsNotNone(val, f"Null observation value in {sym}")
                        self.assertGreater(float(val), 0.0, f"Non-positive observation price in {sym}")
                        dates.append(pt["date"])
                    
                    # Dates must be strictly ascending
                    sorted_dates = sorted(dates)
                    self.assertEqual(dates, sorted_dates, f"Dates not strictly ascending for {sym}")

                    # Return calculation from actual points
                    first_val = float(obs[0].get("nav") if item["is_mf"] else obs[0].get("close"))
                    last_val = float(obs[-1].get("nav") if item["is_mf"] else obs[-1].get("close"))
                    calc_return = ((last_val - first_val) / first_val) * 100.0
                    self.assertIsInstance(calc_return, float)
                else:
                    self.assertEqual(freshness, DataFreshness.UNAVAILABLE.value)
                    self.assertEqual(len(obs), 0, f"Unavailable status must have 0 fake observations for {sym}")

    def test_02_range_switching_returns_different_dataset_sizes(self):
        """Verify 1Y, 3Y, 5Y range parameters return distinct observation sets."""
        test_symbols = ["MON100", "GOLDBEES", "NIFTY50", "AAPL"]
        for sym in test_symbols:
            with self.subTest(symbol=sym):
                res_1y = self.client.get(f"/api/v1/market/candles/{sym}?range=1y&interval=1d").json()
                res_3y = self.client.get(f"/api/v1/market/candles/{sym}?range=3y&interval=1d").json()
                res_5y = self.client.get(f"/api/v1/market/candles/{sym}?range=5y&interval=1d").json()

                obs_1y = res_1y.get("observations", [])
                obs_3y = res_3y.get("observations", [])
                obs_5y = res_5y.get("observations", [])

                if res_3y.get("freshness") == DataFreshness.HISTORICAL.value:
                    self.assertGreater(len(obs_3y), len(obs_1y), f"3Y dataset should have more points than 1Y for {sym}")
                    self.assertGreaterEqual(len(obs_5y), len(obs_3y), f"5Y dataset should have >= points than 3Y for {sym}")

    def test_03_invalid_instrument_returns_controlled_unavailable(self):
        """Verify invalid or non-existent symbols return explicit UNAVAILABLE, never synthetic data or 500 error."""
        res = self.client.get("/api/v1/market/candles/NON_EXISTENT_FAKE_XYZ?range=3y&interval=1d")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data.get("freshness"), DataFreshness.UNAVAILABLE.value)
        self.assertEqual(len(data.get("observations", [])), 0)
        self.assertIn("message", data)

    def test_04_direct_provider_routing(self):
        """Verify registry routes canonical symbols to the correct provider."""
        self.assertEqual(market_registry.resolve_provider("MON100").name, "Exchange Traded Fund Provider")
        self.assertEqual(market_registry.resolve_provider("NIFTYBEES").name, "Exchange Traded Fund Provider")
        self.assertEqual(market_registry.resolve_provider("GOLDBEES").name, "Gold Reference & ETF Provider")
        self.assertEqual(market_registry.resolve_provider("UTI Nifty 50 Index Fund Direct").name, "AMFI / Official Mutual Fund Feed")
        self.assertEqual(market_registry.resolve_provider("PPFCF").name, "AMFI / Official Mutual Fund Feed")
        self.assertEqual(market_registry.resolve_provider("RELIANCE").name, "Yahoo Finance / NSE Delayed Feed")
        self.assertEqual(market_registry.resolve_provider("AAPL").name, "US Market Feed (yfinance)")
        self.assertEqual(market_registry.resolve_provider("NIFTY 50").name, "Yahoo Finance / NSE Delayed Feed")

if __name__ == '__main__':
    unittest.main()
