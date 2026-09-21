import unittest
from app.services.market_data.normalizer import (
    normalize_symbol,
    normalize_global_symbol,
    US_KNOWN_STOCKS,
    US_KNOWN_ETFS
)
from app.services.market_data.providers.yahoo_provider import YahooFinanceProvider
from app.services.market_data.providers.angel_scrip_master import angel_scrip_master
from app.services.market_data.router import provider_router
from app.services.market_data.indian_equities import IndianEquitiesProvider
from app.services.market_data.etfs import ETFProvider
from app.services.market_data.us_equities import USEquitiesProvider


class TestSymbolNormalizer(unittest.TestCase):
    """
    Unit tests ensuring US stocks and ETFs never become .NS symbols,
    and Indian stocks correctly resolve to .NS symbols.
    """

    def test_core_normalizer_requirements(self):
        """Task 7: Test META -> META, SPY -> SPY, RELIANCE -> RELIANCE.NS, TCS -> TCS.NS"""
        self.assertEqual(normalize_symbol("META"), "META")
        self.assertEqual(normalize_symbol("SPY"), "SPY")
        self.assertEqual(normalize_symbol("RELIANCE"), "RELIANCE.NS")
        self.assertEqual(normalize_symbol("TCS"), "TCS.NS")

    def test_us_stocks_never_become_ns(self):
        """Task 3: US stocks META, AAPL, MSFT, NVDA, GOOGL, AMZN, TSLA, NFLX, AMD must NEVER become .NS"""
        us_stocks = ["META", "AAPL", "MSFT", "NVDA", "GOOGL", "AMZN", "TSLA", "NFLX", "AMD"]
        for sym in us_stocks:
            # Direct input
            normalized = normalize_symbol(sym)
            self.assertEqual(normalized, sym, f"US stock {sym} was incorrectly converted to {normalized}")
            self.assertFalse(normalized.endswith(".NS"), f"{sym} must not end with .NS")
            self.assertFalse(normalized.endswith(".BO"), f"{sym} must not end with .BO")

            # With inadvertent .NS suffix attached
            ns_input = f"{sym}.NS"
            cleaned = normalize_symbol(ns_input)
            self.assertEqual(cleaned, sym, f"{ns_input} was not cleaned back to {sym}")

            # normalize_global_symbol
            meta = normalize_global_symbol(sym)
            self.assertEqual(meta["canonical_symbol"], sym)
            self.assertEqual(meta["provider_symbol"], sym)
            self.assertEqual(meta["market"], "US")
            self.assertEqual(meta["asset_type"], "STOCK")

            meta_ns = normalize_global_symbol(ns_input)
            self.assertEqual(meta_ns["canonical_symbol"], sym)
            self.assertEqual(meta_ns["market"], "US")

    def test_us_etfs_never_become_ns(self):
        """Task 4: US ETFs SPY, QQQ, VOO, VTI, IVV, IWM, EEM, GLD, SLV must NEVER become .NS"""
        us_etfs = ["SPY", "QQQ", "VOO", "VTI", "IVV", "IWM", "EEM", "GLD", "SLV"]
        for etf in us_etfs:
            # Direct input
            normalized = normalize_symbol(etf)
            self.assertEqual(normalized, etf, f"US ETF {etf} was incorrectly converted to {normalized}")
            self.assertFalse(normalized.endswith(".NS"), f"{etf} must not end with .NS")
            self.assertFalse(normalized.endswith(".BO"), f"{etf} must not end with .BO")

            # With inadvertent .NS suffix attached
            ns_input = f"{etf}.NS"
            cleaned = normalize_symbol(ns_input)
            self.assertEqual(cleaned, etf, f"{ns_input} was not cleaned back to {etf}")

            # normalize_global_symbol
            meta = normalize_global_symbol(etf)
            self.assertEqual(meta["canonical_symbol"], etf)
            self.assertEqual(meta["provider_symbol"], etf)
            self.assertEqual(meta["market"], "US")
            self.assertEqual(meta["asset_type"], "ETF")

            meta_ns = normalize_global_symbol(ns_input)
            self.assertEqual(meta_ns["canonical_symbol"], etf)
            self.assertEqual(meta_ns["market"], "US")

    def test_indian_stocks_resolve_to_ns(self):
        """Task 5: Indian stocks RELIANCE, TCS, INFY, HDFCBANK, ICICIBANK should resolve to RELIANCE.NS etc."""
        in_stocks = {
            "RELIANCE": "RELIANCE.NS",
            "TCS": "TCS.NS",
            "INFY": "INFY.NS",
            "HDFCBANK": "HDFCBANK.NS",
            "ICICIBANK": "ICICIBANK.NS"
        }
        for sym, expected_ns in in_stocks.items():
            self.assertEqual(normalize_symbol(sym), expected_ns)
            self.assertEqual(normalize_symbol(expected_ns), expected_ns)

            meta = normalize_global_symbol(sym)
            self.assertEqual(meta["canonical_symbol"], expected_ns)
            self.assertEqual(meta["market"], "INDIA")
            self.assertEqual(meta["exchange"], "NSE")

    def test_yahoo_provider_never_queries_meta_ns(self):
        """Task 8: Ensure Yahoo provider never queries META.NS"""
        yf_provider = YahooFinanceProvider()

        # Both 'META' and inadvertent 'META.NS' must normalize to 'META'
        self.assertEqual(yf_provider._normalize_symbol("META"), "META")
        self.assertEqual(yf_provider._normalize_symbol("META.NS"), "META")
        self.assertEqual(yf_provider._normalize_symbol("SPY.NS"), "SPY")
        self.assertEqual(yf_provider._normalize_symbol("AAPL.NS"), "AAPL")
        self.assertEqual(yf_provider._normalize_symbol("NVDA.NS"), "NVDA")

        # Indian stocks still retain .NS
        self.assertEqual(yf_provider._normalize_symbol("RELIANCE"), "RELIANCE.NS")
        self.assertEqual(yf_provider._normalize_symbol("TCS"), "TCS.NS")

    def test_angel_scrip_master_rejects_us_symbols(self):
        """Ensure Angel One scrip master never misidentifies US stocks as BSE penny stocks"""
        self.assertIsNone(angel_scrip_master.resolve("META"))
        self.assertIsNone(angel_scrip_master.resolve("SPY"))
        self.assertIsNone(angel_scrip_master.resolve("AAPL"))
        self.assertIsNone(angel_scrip_master.resolve("QQQ"))

        # Indian symbols still resolve
        reliance_scrip = angel_scrip_master.resolve("RELIANCE")
        self.assertIsNotNone(reliance_scrip)
        self.assertEqual(reliance_scrip["tradingsymbol"], "RELIANCE-EQ")

    def test_provider_router_chain_isolation(self):
        """Ensure US symbols route to US provider chain and never include Indian broker/feed"""
        meta_chain = [p.name for p in provider_router._get_provider_chain("META")]
        spy_chain = [p.name for p in provider_router._get_provider_chain("SPY")]
        reliance_chain = [p.name for p in provider_router._get_provider_chain("RELIANCE")]

        # US Stocks chain must not contain Indian feeds
        self.assertNotIn("Angel One SmartAPI", meta_chain)
        self.assertNotIn("TrueData", meta_chain)
        self.assertNotIn("Yahoo Finance / NSE Delayed Feed", meta_chain)
        self.assertIn("YahooFinance", meta_chain)

        # US ETFs chain must not contain Indian feeds
        self.assertNotIn("Angel One SmartAPI", spy_chain)
        self.assertNotIn("TrueData", spy_chain)
        self.assertNotIn("Yahoo Finance / NSE Delayed Feed", spy_chain)
        self.assertIn("YahooFinance", spy_chain)

        # Indian stock chain must contain Indian providers
        self.assertTrue(any("Angel" in name or "NSE" in name for name in reliance_chain))

    def test_specialized_providers_resolve_symbol(self):
        """Ensure indian_equities, etfs, and us_equities resolve_symbol adhere to canonical rules"""
        in_provider = IndianEquitiesProvider()
        etf_provider = ETFProvider()
        us_provider = USEquitiesProvider()

        # IndianEquitiesProvider must not convert US symbols to .NS
        self.assertEqual(in_provider.resolve_symbol("META"), "META")
        self.assertEqual(in_provider.resolve_symbol("SPY"), "SPY")
        self.assertEqual(in_provider.resolve_symbol("RELIANCE"), "RELIANCE.NS")

        # ETFProvider must not convert US ETFs to .NS
        self.assertEqual(etf_provider.resolve_symbol("SPY"), "SPY")
        self.assertEqual(etf_provider.resolve_symbol("SPY.NS"), "SPY")
        self.assertEqual(etf_provider.resolve_symbol("NIFTYBEES"), "NIFTYBEES.NS")

        # USEquitiesProvider must strip any accidental .NS
        self.assertEqual(us_provider.resolve_symbol("META"), "META")
        self.assertEqual(us_provider.resolve_symbol("META.NS"), "META")
        self.assertEqual(us_provider.resolve_symbol("SPY.NS"), "SPY")

    def test_market_quote_api_endpoints(self):
        """Integration test for /api/v1/market/quote endpoints: META, SPY, RELIANCE"""
        from fastapi.testclient import TestClient
        from app.main import app
        client = TestClient(app)

        # GET /api/v1/market/quote/META
        res_meta = client.get("/api/v1/market/quote/META")
        self.assertEqual(res_meta.status_code, 200)
        data_meta = res_meta.json()
        self.assertEqual(data_meta.get("symbol"), "META")
        self.assertEqual(data_meta.get("currency"), "USD")
        self.assertNotIn(".NS", data_meta.get("symbol", ""))

        # GET /api/v1/market/quote/SPY
        res_spy = client.get("/api/v1/market/quote/SPY")
        self.assertEqual(res_spy.status_code, 200)
        data_spy = res_spy.json()
        self.assertEqual(data_spy.get("symbol"), "SPY")
        self.assertEqual(data_spy.get("currency"), "USD")
        self.assertNotIn(".NS", data_spy.get("symbol", ""))

        # GET /api/v1/market/quote/RELIANCE
        res_rel = client.get("/api/v1/market/quote/RELIANCE")
        self.assertEqual(res_rel.status_code, 200)
        data_rel = res_rel.json()
        self.assertIn(data_rel.get("symbol"), ["RELIANCE", "RELIANCE.NS"])
        self.assertEqual(data_rel.get("currency"), "INR")


if __name__ == "__main__":
    unittest.main()
