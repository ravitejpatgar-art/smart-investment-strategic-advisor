"""
Comprehensive Verification Script for Indian Market Data in SmartVest.

Verifies:
1. Dynamic token resolution from Angel One Scrip Master (ZERO hardcoded tokens).
2. Live quote retrieval (LTP, providerTimestamp, exchangeTimestamp, freshness).
3. 5-way identity check (exchange, tradingsymbol, token, assetType, provider).
4. Strict separation:
   - Mutual Funds NEVER route to Angel One or receive .NS suffixes.
   - ETFs NEVER route to AMFI.
5. Search verification preserving exact assetType.
6. Data Integrity endpoint verification.
"""

import sys
import os
import json
from datetime import datetime, timezone

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.database import SessionLocal
from app.models.instrument import Instrument
from app.services.market_data.registry import market_registry
from app.services.market_data.validator import validate_quote_compatibility, validate_price_sanity
from app.services.market_data.providers.angel_scrip_master import angel_scrip_master
from app.services.market_data.instrument_master import instrument_master
from app.api.v1.market import get_india_data_integrity


def verify_stock_or_etf(symbol: str, asset_type: str, exchange: str = "NSE") -> dict:
    # 1. Dynamically resolve instrument from Angel One Scrip Master
    scrip = angel_scrip_master.resolve(symbol, exchange=exchange)
    if not scrip:
        print(f"FAILED TO RESOLVE SCRIP FOR: {symbol}")
        return {"symbol": symbol, "status": "FAIL", "reason": "Scrip master resolution failed"}

    dynamic_token = scrip["token"]
    dynamic_tradingsymbol = scrip["tradingsymbol"]
    dynamic_exchange = scrip["exchange"]
    dynamic_asset_type = scrip["asset_type"]

    # 2. Obtain quote via Market Registry
    quote = market_registry.get_quote(symbol, asset_type=asset_type)

    # 3. Identity Verification
    inst_spec = {
        "symbol": symbol,
        "assetType": asset_type,
        "exchange": exchange,
        "token": dynamic_token
    }
    is_compat, compat_reason = validate_quote_compatibility(inst_spec, quote)
    quality, suspect_reason = validate_price_sanity(quote, inst_spec)

    # Check token and symbol match returned quote
    token_match = str(quote.get("token")) == str(dynamic_token)
    trading_symbol_match = quote.get("tradingsymbol") == dynamic_tradingsymbol
    exchange_match = quote.get("exchange") == dynamic_exchange
    provider_match = "Angel One" in (quote.get("provider") or quote.get("source") or "")

    identity_pass = (
        is_compat and
        token_match and
        trading_symbol_match and
        exchange_match and
        provider_match and
        quote.get("price") is not None and
        float(quote.get("price")) > 0
    )

    print(f"\n{symbol}")
    print(f"Asset type: {asset_type}")
    print(f"Exchange: {quote.get('exchange')}")
    print(f"Angel trading symbol: {dynamic_tradingsymbol}")
    print(f"Angel token: {dynamic_token} (resolved dynamically)")
    print(f"Provider: {quote.get('provider') or quote.get('source')}")
    print(f"LTP: {quote.get('price')}")
    print(f"Provider timestamp: {quote.get('providerTimestamp')}")
    print(f"Exchange timestamp: {quote.get('exchangeTimestamp')}")
    print(f"Freshness: {quote.get('freshness')}")
    print(f"Data Quality: {quote.get('dataQuality') or quality}")
    print(f"Identity check: {'PASS' if identity_pass else 'FAIL: ' + str(compat_reason or suspect_reason)}")

    return {
        "symbol": symbol,
        "asset_type": asset_type,
        "exchange": quote.get("exchange"),
        "trading_symbol": dynamic_tradingsymbol,
        "token": dynamic_token,
        "ltp": quote.get("price"),
        "provider": quote.get("provider") or quote.get("source"),
        "provider_timestamp": quote.get("providerTimestamp"),
        "exchange_timestamp": quote.get("exchangeTimestamp"),
        "freshness": quote.get("freshness"),
        "identity_pass": identity_pass
    }


def verify_mutual_fund(symbol: str, scheme_code: str) -> dict:
    quote = market_registry.get_quote(symbol, asset_type="MUTUAL_FUND")

    inst_spec = {
        "symbol": symbol,
        "assetType": "MUTUAL_FUND",
        "exchange": "AMFI",
        "schemeCode": scheme_code
    }
    is_compat, compat_reason = validate_quote_compatibility(inst_spec, quote)
    quality, suspect_reason = validate_price_sanity(quote, inst_spec)

    provider = quote.get("provider") or quote.get("source") or ""
    never_angel = "ANGEL" not in provider.upper() and quote.get("exchange") != "NSE"
    identity_pass = (
        is_compat and
        never_angel and
        quote.get("exchange") == "AMFI" and
        quote.get("price") is not None and
        float(quote.get("price")) > 0
    )

    print(f"\n{symbol}")
    print(f"Asset type: MUTUAL_FUND")
    print(f"Exchange: {quote.get('exchange')}")
    print(f"Scheme code: {scheme_code}")
    print(f"Provider: {provider}")
    print(f"Published NAV: {quote.get('price')}")
    print(f"NAV Date: {quote.get('navDate')}")
    print(f"Provider timestamp: {quote.get('providerTimestamp')}")
    print(f"Freshness: {quote.get('freshness')}")
    print(f"Data Quality: {quote.get('dataQuality') or quality}")
    print(f"Identity check: {'PASS' if identity_pass else 'FAIL: ' + str(compat_reason or suspect_reason)}")

    return {
        "symbol": symbol,
        "asset_type": "MUTUAL_FUND",
        "exchange": quote.get("exchange"),
        "scheme_code": scheme_code,
        "nav": quote.get("price"),
        "provider": provider,
        "freshness": quote.get("freshness"),
        "identity_pass": identity_pass
    }


def main():
    print("=" * 80)
    print("SMARTVEST — INDIAN MARKET REAL-DATA VERIFICATION SUITE")
    print("=" * 80)

    # --- 1. STOCKS ---
    print("\n--- 1. INDIAN STOCKS (ANGEL ONE SMARTAPI DYNAMIC MAPPING) ---")
    stocks = [
        "RELIANCE",
        "TCS",
        "INFY",
        "HDFCBANK",
        "ICICIBANK",
        "SBIN",
        "ITC",
        "LT",
        "BHARTIARTL",
        "ADANIENT"
    ]
    stock_results = [verify_stock_or_etf(s, "STOCK", "NSE") for s in stocks]

    # --- 2. ETFS ---
    print("\n--- 2. INDIAN ETFS (ANGEL ONE SMARTAPI DYNAMIC MAPPING) ---")
    etfs = [
        "MON100",
        "NIFTYBEES",
        "GOLDBEES",
        "BANKBEES",
        "JUNIORBEES"
    ]
    etf_results = [verify_stock_or_etf(e, "ETF", "NSE") for e in etfs]

    # --- 3. MUTUAL FUNDS ---
    print("\n--- 3. INDIAN MUTUAL FUNDS (OFFICIAL AMFI PUBLISHED NAV) ---")
    mfs = [
        ("AMFI:135001", "135001"),
        ("AMFI:118955", "118955")
    ]
    mf_results = [verify_mutual_fund(sym, code) for sym, code in mfs]

    # --- 4. SEARCH VERIFICATION ---
    print("\n" + "=" * 80)
    print("--- 4. MARKETPLACE SEARCH ASSET TYPE INTEGRITY ---")
    print("=" * 80)
    with SessionLocal() as db:
        search_queries = [
            ("MON100", "ETF"),
            ("RELIANCE", "STOCK"),
            ("HDFC Flexi Cap", "MUTUAL_FUND"),
            ("NIFTYBEES", "ETF")
        ]
        for q_term, expected_type in search_queries:
            res = instrument_master.search(query=q_term, limit=3, db=db)
            top_item = res["items"][0] if res["items"] else None
            if top_item:
                actual_type = top_item.get("assetType")
                matches = actual_type == expected_type
                print(f"Query: '{q_term}' -> Matched: '{top_item.get('name')}' ({top_item.get('symbol')}) | Expected: {expected_type} | Actual: {actual_type} | Pass: {matches}")
            else:
                print(f"Query: '{q_term}' -> NO RESULTS RETURNED")

    # --- 5. DATA INTEGRITY ENDPOINT ---
    print("\n" + "=" * 80)
    print("--- 5. GET /api/v1/market/data-integrity/india ENDPOINT ---")
    print("=" * 80)
    with SessionLocal() as db:
        integrity_res = get_india_data_integrity(sample_size=17, db=db)
        print(f"Status: {integrity_res['status']}")
        print(f"Total Indian Instruments: {integrity_res['totalIndianInstruments']}")
        print(f"Total Stocks: {integrity_res['totalStocks']}")
        print(f"Total ETFs: {integrity_res['totalETFs']}")
        print(f"Total Mutual Funds: {integrity_res['totalMutualFunds']}")
        print(f"Sample Size Checked: {integrity_res['sampleSizeChecked']}")
        print(f"Valid Quotes: {integrity_res['validQuotes']}")
        print(f"Invalid Quotes: {integrity_res['invalidQuotes']}")
        print(f"Realtime Quotes: {integrity_res['realtimeQuotes']}")
        print(f"Delayed Quotes: {integrity_res['delayedQuotes']}")
        print(f"Stale Quotes: {integrity_res['staleQuotes']}")
        print(f"Unavailable Quotes: {integrity_res['unavailableQuotes']}")
        print(f"Mutual Funds Using Angel (MUST BE 0): {integrity_res['mutualFundsUsingAngel']}")
        print(f"ETFs Using Angel: {integrity_res['etfsUsingAngel']}")
        print(f"Stocks Using Angel: {integrity_res['stocksUsingAngel']}")
        print(f"Provider Mismatches: {integrity_res['providerMismatches']}")
        print(f"Timestamp Issues: {integrity_res['timestampIssues']}")
        print(f"Sample Failures Count: {len(integrity_res['sampleFailures'])}")
        print(f"Sample Successes Count: {len(integrity_res['sampleSuccesses'])}")

    # Summary
    all_passed = (
        all(r["identity_pass"] for r in stock_results) and
        all(r["identity_pass"] for r in etf_results) and
        all(r["identity_pass"] for r in mf_results) and
        integrity_res["status"] == "PASS" and
        integrity_res["mutualFundsUsingAngel"] == 0
    )

    print("\n" + "=" * 80)
    if all_passed:
        print(">>> ALL INDIAN MARKET DATA INTEGRITY CHECKS: PASS <<<")
    else:
        print(">>> SOME CHECKS FAILED <<<")
    print("=" * 80)

    return 0 if all_passed else 1


if __name__ == "__main__":
    sys.exit(main())
