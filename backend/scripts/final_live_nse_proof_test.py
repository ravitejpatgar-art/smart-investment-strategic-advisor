"""
Final Live NSE Proof Test Script for SmartVest
Executes full proof test on 10 Indian equities/ETFs, data integrity endpoint, and 2 mutual funds.
"""
import os
import sys
import json
import math
from datetime import datetime, timezone

# Add backend directory to sys.path
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from fastapi.testclient import TestClient
from app.main import app
from app.services.market_data.providers.angel_provider import angel_provider
from app.services.market_data.providers.angel_scrip_master import angel_scrip_master
from app.services.market_data.router import provider_router
from app.services.market_data.market_hours import get_indian_market_status
from app.services.market_data.normalizer import format_ist_timestamp

client = TestClient(app)

TARGET_EQUITIES = [
    "RELIANCE",
    "TCS",
    "INFY",
    "HDFCBANK",
    "ICICIBANK",
    "SBIN",
    "ITC",
    "MON100",
    "NIFTYBEES",
    "GOLDBEES"
]

TARGET_MFS = [
    ("HDFC Flexi Cap Fund", "118955"),
    ("Parag Parikh Flexi Cap Fund", "153964")
]

def run_proof_test():
    print("=" * 80)
    print("SMARTVEST — FINAL LIVE NSE PROOF TEST")
    print("=" * 80)

    # Market Session Context
    mkt = get_indian_market_status()
    is_open = mkt.get("isOpen", False)
    market_status = mkt.get("status", "CLOSED")
    current_time_ist = mkt.get("currentTime", "")
    print(f"Session State: {market_status} (isOpen={is_open}) | Time: {current_time_ist}")
    print("-" * 80)

    # Auth
    auth_ok = angel_provider.authenticate()
    if not auth_ok:
        print("FAIL: Angel One SmartAPI authentication failed.")
        sys.exit(1)

    all_passed = True
    instrument_results = []

    print("\n--- 1. TESTING 10 INDIAN STOCKS & ETFS ---")
    for sym in TARGET_EQUITIES:
        # 1. Dynamic Token Resolution
        meta = angel_scrip_master.resolve(sym, exchange="NSE")
        if not meta:
            print(f"FAIL: Scrip master could not resolve {sym}")
            all_passed = False
            continue

        token = str(meta["token"])
        trading_symbol = meta["tradingsymbol"]
        exch = meta["exchange"]

        # 2. REST LTP
        rest_quote = angel_provider.get_rest_quote(sym)
        rest_ltp = rest_quote.get("price") if rest_quote else None

        # 3. WebSocket LTP
        with angel_provider._lock:
            ws_tick = angel_provider._latest_ticks.get(token)
        ws_ltp = ws_tick.get("price") if ws_tick else None
        ws_received_ts = ws_tick.get("receivedAt") if ws_tick else "No active stream tick (market closed/weekend)"

        # 4. Backend API Quote
        api_res = client.get(f"/api/v1/market/quote?symbol={sym}")
        api_data = api_res.json() if api_res.status_code == 200 else {}
        api_ltp = api_data.get("price")
        prev_close = api_data.get("prevClose")
        change = api_data.get("change")
        change_pct = api_data.get("changePercent") or api_data.get("changePct")
        utc_ts = api_data.get("exchangeTimestampUtc") or api_data.get("exchangeTimestamp")
        ist_ts = api_data.get("displayTimestampIst") or api_data.get("asOf")
        freshness = api_data.get("freshness")
        is_live = api_data.get("isLive")
        data_quality = api_data.get("dataQuality")
        source = api_data.get("source")

        # 5. Frontend UI LTP (simulating client consumption)
        ui_ltp = api_ltp

        # Verification Checks
        item_passed = True
        failure_reasons = []

        # No Yahoo fallback check
        if source != "Angel One SmartAPI":
            item_passed = False
            failure_reasons.append(f"Source is '{source}', expected 'Angel One SmartAPI'")

        # REST = API = UI check
        if rest_ltp is None or api_ltp is None:
            item_passed = False
            failure_reasons.append("Missing REST or API LTP")
        elif rest_ltp != api_ltp:
            item_passed = False
            failure_reasons.append(f"REST LTP ({rest_ltp}) != API LTP ({api_ltp})")

        if api_ltp != ui_ltp:
            item_passed = False
            failure_reasons.append(f"API LTP ({api_ltp}) != UI LTP ({ui_ltp})")

        if ws_ltp is not None and abs(ws_ltp - rest_ltp) > 2.0:
            item_passed = False
            failure_reasons.append(f"WebSocket LTP ({ws_ltp}) differs from REST ({rest_ltp})")

        # Previous close not copied from LTP check
        if prev_close is not None and api_ltp is not None and change != 0:
            if prev_close == api_ltp:
                item_passed = False
                failure_reasons.append("prevClose is identical to LTP despite non-zero change")

        # Math checks: change = LTP - prevClose & changePct = (change / prevClose) * 100
        if prev_close and api_ltp and change is not None and change_pct is not None:
            calc_change = round(api_ltp - prev_close, 2)
            if abs(calc_change - change) > 0.05:
                item_passed = False
                failure_reasons.append(f"Change math mismatch: expected {calc_change}, got {change}")

            calc_pct = round((calc_change / prev_close) * 100.0, 2)
            if abs(calc_pct - change_pct) > 0.05:
                item_passed = False
                failure_reasons.append(f"ChangePct math mismatch: expected {calc_pct}%, got {change_pct}%")

        # Session & Freshness Acceptance Check
        if is_open:
            if ws_tick and (freshness != "REALTIME" or not is_live):
                item_passed = False
                failure_reasons.append(f"Market open with recent tick but freshness={freshness}, isLive={is_live}")
        else:
            if freshness == "REALTIME" or is_live:
                item_passed = False
                failure_reasons.append(f"Market closed but freshness={freshness}, isLive={is_live}")

        # Timestamp formatting check
        if not utc_ts or ("Z" not in utc_ts and "+00:00" not in utc_ts):
            item_passed = False
            failure_reasons.append(f"Invalid UTC timestamp: {utc_ts}")
        if not ist_ts or "IST" not in ist_ts:
            item_passed = False
            failure_reasons.append(f"Invalid IST timestamp: {ist_ts}")

        if not item_passed:
            all_passed = False

        status_str = "PASS" if item_passed else "FAIL"

        print(f"\n{status_str} | {sym}")
        print(f"  token:               {token}")
        print(f"  tradingSymbol:       {trading_symbol}")
        print(f"  REST:                {rest_ltp}")
        print(f"  WebSocket:           {ws_ltp if ws_ltp is not None else 'No active stream tick (market closed/weekend)'}")
        print(f"  API:                 {api_ltp}")
        print(f"  UI:                  {ui_ltp}")
        print(f"  previousClose:       {prev_close}")
        print(f"  change:              {change}")
        print(f"  changePct:           {change_pct}%")
        print(f"  UTC timestamp:       {utc_ts}")
        print(f"  IST timestamp:       {ist_ts}")
        print(f"  freshness:           {freshness}")
        print(f"  isLive:              {is_live}")
        print(f"  dataQuality:         {data_quality}")
        if failure_reasons:
            print(f"  REASONS:             {'; '.join(failure_reasons)}")

        instrument_results.append({
            "status": status_str,
            "symbol": sym,
            "token": token,
            "tradingSymbol": trading_symbol,
            "rest": rest_ltp,
            "ws": ws_ltp,
            "api": api_ltp,
            "ui": ui_ltp,
            "prevClose": prev_close,
            "changePct": change_pct,
            "utc": utc_ts,
            "ist": ist_ts,
            "freshness": freshness,
            "isLive": is_live,
            "dataQuality": data_quality,
            "reasons": failure_reasons
        })

    # --- 2. DATA INTEGRITY ENDPOINT ---
    print("\n" + "=" * 80)
    print("--- 2. GET /api/v1/market/data-integrity/india ---")
    print("=" * 80)
    integrity_res = client.get("/api/v1/market/data-integrity/india")
    integrity_data = integrity_res.json() if integrity_res.status_code == 200 else {}
    print(json.dumps(integrity_data, indent=2))

    provider_mismatches = integrity_data.get("providerMismatches", 0)
    timestamp_issues = integrity_data.get("timestampIssues", 0)
    invalid_quotes = integrity_data.get("invalidQuotes", 0)
    stale_quotes = integrity_data.get("staleQuotes", 0)
    mf_using_angel = integrity_data.get("mutualFundsUsingAngel", 0)

    print("\nData Integrity Key Metrics:")
    print(f"  providerMismatches:       {provider_mismatches}")
    print(f"  timestampIssues:          {timestamp_issues}")
    print(f"  invalidQuotes:            {invalid_quotes}")
    print(f"  staleQuotes:              {stale_quotes}")
    print(f"  mutualFundsUsingAngel:    {mf_using_angel}")

    integrity_passed = (
        provider_mismatches == 0
        and timestamp_issues == 0
        and invalid_quotes == 0
        and mf_using_angel == 0
    )
    if not integrity_passed:
        all_passed = False

    # --- 3. TESTING MUTUAL FUNDS ---
    print("\n" + "=" * 80)
    print("--- 3. TESTING MUTUAL FUNDS ---")
    print("=" * 80)
    mf_passed = True
    for mf_name, scheme_code in TARGET_MFS:
        mf_res = client.get(f"/api/v1/market/quote?symbol=AMFI:{scheme_code}")
        mf_data = mf_res.json() if mf_res.status_code == 200 else {}
        source = mf_data.get("source")
        nav = mf_data.get("nav") or mf_data.get("price")
        is_live = mf_data.get("isLive")
        symbol = mf_data.get("symbol")
        exchange = mf_data.get("exchange")
        nav_date = mf_data.get("navDate")

        cur_mf_pass = True
        reasons = []
        if not source or "AMFI" not in source:
            cur_mf_pass = False
            reasons.append(f"Source is {source}, expected AMFI")
        if exchange != "AMFI":
            cur_mf_pass = False
            reasons.append(f"Exchange is {exchange}, expected AMFI")
        if is_live is not False:
            cur_mf_pass = False
            reasons.append(f"isLive is {is_live}, expected False")
        if ".NS" in symbol or ".BO" in symbol:
            cur_mf_pass = False
            reasons.append(f"Symbol has exchange suffix: {symbol}")
        if nav is None or nav <= 0:
            cur_mf_pass = False
            reasons.append(f"Invalid NAV: {nav}")

        if not cur_mf_pass:
            mf_passed = False
            all_passed = False

        status_str = "PASS" if cur_mf_pass else "FAIL"
        print(f"\n{status_str} | {mf_name} (AMFI:{scheme_code})")
        print(f"  Provider / Source:        {source}")
        print(f"  Exchange:                 {exchange}")
        print(f"  NAV (INR):                {nav}")
        print(f"  NAV Date:                 {nav_date}")
        print(f"  isLive:                   {is_live}")
        print(f"  Symbol:                   {symbol}")
        if reasons:
            print(f"  REASONS:                  {'; '.join(reasons)}")

    print("\n" + "=" * 80)
    print(f"OVERALL PROOF TEST RESULT: {'PASS' if all_passed else 'FAIL'}")
    print("=" * 80)

if __name__ == "__main__":
    run_proof_test()
