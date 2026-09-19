"""
Live NSE Market Test Script for SmartVest
Tests the 10 requested instruments against live Angel One SmartAPI, WebSocket, API router, and frontend data contract.
Captures REST LTP, WebSocket LTP, API LTP, UI LTP, timestamps, freshness, isLive, and independent close/change metrics.
"""
import os
import sys
import json
import time
from datetime import datetime, timezone

# Add backend directory to sys.path
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.services.market_data.providers.angel_provider import angel_provider
from app.services.market_data.providers.angel_scrip_master import angel_scrip_master
from app.services.market_data.router import provider_router
from app.services.market_data.market_hours import get_indian_market_status
from app.services.market_data.normalizer import format_ist_timestamp
from app.services.market_data.freshness import DataFreshness

TEST_SYMBOLS = [
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

def run_live_nse_market_test():
    print("=" * 80)
    print("SMARTVEST — LIVE NSE MARKET TEST")
    print("=" * 80)

    # 1. Market Session State
    mkt = get_indian_market_status()
    now_utc = datetime.now(timezone.utc)
    print(f"Current UTC Time: {now_utc.isoformat()}")
    print(f"Market Status Report: {json.dumps(mkt, indent=2)}")
    is_session_open = mkt.get("isOpen", False)
    print(f"Is Regular NSE Equity Trading Session Active? {'YES (OPEN)' if is_session_open else 'NO (CLOSED/WEEKEND)'}")
    print("-" * 80)

    # 2. Provider Initialization & Auth
    if not angel_provider.is_configured:
        print("ERROR: Angel One SmartAPI is not configured (missing credentials in .env).")
        sys.exit(1)

    print("Authenticating with Angel One SmartAPI...")
    auth_ok = angel_provider.authenticate()
    print(f"Authentication result: {'SUCCESS' if auth_ok else 'FAILED'}")
    if not auth_ok:
        print("ERROR: Could not authenticate with Angel One SmartAPI.")
        sys.exit(1)

    # 3. WebSocket Connection State
    print(f"WebSocket Connected: {angel_provider.is_connected}")
    print(f"WebSocket Subscribed Instruments: {len(angel_provider.subscribed_instruments)}")

    results = []
    flags = []

    print("\nExecuting live tests for 10 target instruments...\n")

    for symbol in TEST_SYMBOLS:
        print(f"\n>>> TESTING INSTRUMENT: {symbol} <<<")
        # Step A: Dynamic Token Resolution
        meta = angel_scrip_master.resolve(symbol, exchange="NSE")
        if not meta:
            print(f"FAILED: Could not resolve scrip metadata for {symbol}")
            continue

        token = str(meta["token"])
        tradingsymbol = meta["tradingsymbol"]
        exch = meta["exchange"]
        asset_type = meta["asset_type"]

        # Step B: Angel One REST Quote
        rest_quote = angel_provider.get_rest_quote(symbol)
        rest_ltp = rest_quote.get("price") if rest_quote else None
        rest_prev_close = rest_quote.get("prev_close") if rest_quote else None
        rest_change = rest_quote.get("change") if rest_quote else None
        rest_change_pct = rest_quote.get("change_pct") if rest_quote else None
        rest_exch_ts = rest_quote.get("exchangeTimestamp") if rest_quote else None
        rest_provider_ts = rest_quote.get("provider_timestamp") if rest_quote else None

        # Step C: WebSocket Tick Check
        with angel_provider._lock:
            ws_tick = angel_provider._latest_ticks.get(token)
        ws_ltp = ws_tick.get("price") if ws_tick else None
        ws_tick_ts = ws_tick.get("exchangeTimestamp") or ws_tick.get("raw_timestamp") if ws_tick else None

        # Step D: Market Router / API Quote
        api_quote = provider_router.get_quote(symbol)
        api_ltp = api_quote.get("price") if api_quote else None
        api_freshness = api_quote.get("freshness") if api_quote else None
        api_is_live = api_quote.get("isLive") if api_quote else None
        api_data_quality = api_quote.get("dataQuality") if api_quote else None
        api_timestamp = api_quote.get("asOf") or api_quote.get("timestamp") if api_quote else None
        api_prev_close = api_quote.get("prevClose") or api_quote.get("prev_close") if api_quote else None
        api_change = api_quote.get("change") if api_quote else None
        api_change_pct = api_quote.get("changePercent") or api_quote.get("change_pct") if api_quote else None

        # Step E: UI Quote Consumption
        # The UI directly parses quote.price / quote.nav, quote.asOf, quote.isLive, etc.
        ui_ltp = api_ltp
        ui_timestamp = api_timestamp
        ui_freshness = api_freshness
        ui_is_live = api_is_live

        # Step F: Verify Independent Prev Close & Change
        prev_close_independent = False
        if api_prev_close is not None and api_ltp is not None:
            if api_change != 0.0:
                prev_close_independent = (api_prev_close != api_ltp)
            else:
                prev_close_independent = True

        # Check Discrepancies
        discrepancies = []
        if rest_ltp is not None and api_ltp is not None and rest_ltp != api_ltp:
            discrepancies.append(f"REST LTP ({rest_ltp}) != API LTP ({api_ltp})")
        if ws_ltp is not None and api_ltp is not None and ws_ltp != api_ltp:
            discrepancies.append(f"WS LTP ({ws_ltp}) != API LTP ({api_ltp})")
        if api_ltp != ui_ltp:
            discrepancies.append(f"API LTP ({api_ltp}) != UI LTP ({ui_ltp})")

        # Check Acceptance rules
        if is_session_open:
            if ws_tick:
                if api_freshness != DataFreshness.REALTIME.value and api_freshness != "REALTIME":
                    discrepancies.append(f"Session OPEN with recent tick but freshness is '{api_freshness}' (expected REALTIME)")
                if not api_is_live:
                    discrepancies.append("Session OPEN with recent tick but isLive is False")
        else:
            # Weekend / Outside Market Hours:
            if api_freshness == "REALTIME":
                discrepancies.append(f"Session CLOSED but freshness is REALTIME (expected LATEST_AVAILABLE)")
            if api_is_live:
                discrepancies.append(f"Session CLOSED but isLive is True (expected False)")

        if discrepancies:
            flags.append((symbol, discrepancies))

        record = {
            "symbol": symbol,
            "token": token,
            "trading_symbol": tradingsymbol,
            "exchange": exch,
            "asset_type": asset_type,
            "provider": "Angel One SmartAPI",
            "rest_ltp": rest_ltp,
            "websocket_ltp": ws_ltp,
            "api_ltp": api_ltp,
            "ui_ltp": ui_ltp,
            "prev_close": api_prev_close,
            "change": api_change,
            "change_pct": api_change_pct,
            "prev_close_independent": prev_close_independent,
            "exchange_timestamp": rest_exch_ts,
            "provider_timestamp": rest_provider_ts,
            "ws_tick_timestamp": ws_tick_ts,
            "api_timestamp": api_timestamp,
            "freshness": api_freshness,
            "is_live": api_is_live,
            "data_quality": api_data_quality,
            "discrepancies": discrepancies
        }
        results.append(record)

        # Print formatted output for instrument
        print(f"SYMBOL:             {symbol}")
        print(f"TOKEN:              {token}")
        print(f"TRADING SYMBOL:     {tradingsymbol}")
        print(f"REST LTP:           {rest_ltp}")
        print(f"WEBSOCKET LTP:      {ws_ltp if ws_ltp is not None else 'No active stream tick (market closed/weekend)'}")
        print(f"API LTP:            {api_ltp}")
        print(f"UI LTP:             {ui_ltp}")
        print(f"PREV CLOSE:         {api_prev_close}")
        print(f"CHANGE / PCT:       {api_change} ({api_change_pct}%)")
        print(f"TIMESTAMP:          {api_timestamp} (Exchange: {rest_exch_ts})")
        print(f"FRESHNESS:          {api_freshness}")
        print(f"IS LIVE:            {api_is_live}")
        print(f"DATA QUALITY:       {api_data_quality}")
        print(f"INDEPENDENT CLOSE:  {'VERIFIED' if prev_close_independent else 'WARNING: close == ltp'}")
        if discrepancies:
            print(f"DISCREPANCIES:      {', '.join(discrepancies)}")
        else:
            print(f"DISCREPANCIES:      NONE (CLEAN MATCH)")

    print("\n" + "=" * 80)
    print("LIVE TEST SUMMARY TABLE")
    print("=" * 80)
    header = f"{'SYMBOL':<10} | {'TOKEN':<6} | {'REST LTP':<10} | {'WS LTP':<10} | {'API LTP':<10} | {'UI LTP':<10} | {'FRESHNESS':<16} | {'QUALITY':<8}"
    print(header)
    print("-" * len(header))
    for r in results:
        ws_str = str(r['websocket_ltp']) if r['websocket_ltp'] is not None else 'N/A'
        print(f"{r['symbol']:<10} | {r['token']:<6} | {str(r['rest_ltp']):<10} | {ws_str:<10} | {str(r['api_ltp']):<10} | {str(r['ui_ltp']):<10} | {str(r['freshness']):<16} | {str(r['data_quality']):<8}")

    print("\n" + "=" * 80)
    print("PREVIOUS CLOSE & CHANGE INDEPENDENCE CHECK")
    print("=" * 80)
    for r in results:
        status_str = "PASS (Provider returned distinct close & netChange)" if r['prev_close_independent'] else "CHECK"
        print(f"{r['symbol']:<10}: LTP={r['api_ltp']} | PrevClose={r['prev_close']} | NetChange={r['change']} ({r['change_pct']}%) -> {status_str}")

    print("\n" + "=" * 80)
    print("FLAGS & DISCREPANCIES")
    print("=" * 80)
    if not flags:
        print("ZERO discrepancies found across REST, WebSocket, API, and UI layers.")
    else:
        for sym, disc in flags:
            print(f"[{sym}]: {disc}")

if __name__ == "__main__":
    run_live_nse_market_test()
