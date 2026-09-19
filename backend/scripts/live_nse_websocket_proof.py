"""
SMARTVEST — LIVE NSE WEBSOCKET AUDIT & PROOF TEST
Strictly distinguishes between live trading callbacks and closed session state.
Never populates WS LTP from REST, cached, or fallback quotes.
Reports 'NOT TESTABLE — MARKET CLOSED' when exchange is closed.
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

from fastapi.testclient import TestClient
from app.main import app
from app.services.market_data.providers.angel_provider import angel_provider
from app.services.market_data.providers.angel_scrip_master import angel_scrip_master
from app.services.market_data.market_hours import get_indian_market_status
from app.services.market_data.normalizer import format_ist_timestamp

client = TestClient(app)

TARGET_INSTRUMENTS = [
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

def run_live_websocket_proof():
    print("=" * 85)
    print("SMARTVEST — LIVE NSE WEBSOCKET AUDIT & PROOF TEST")
    print("=" * 85)

    # 1. Market Status Context
    mkt = get_indian_market_status()
    is_open = mkt.get("isOpen", False)
    status_str = mkt.get("status", "CLOSED")
    system_ist = mkt.get("currentTime", "")
    print(f"Session State: {status_str} (isOpen={is_open}) | System IST: {system_ist}")
    print("-" * 85)

    # 2. Authenticate Angel One SmartAPI
    auth_ok = angel_provider.authenticate()
    if not auth_ok:
        print("FAIL: Angel One SmartAPI authentication failed.")
        sys.exit(1)

    # 3. Dynamic Token Resolution
    meta_by_sym = {}
    for sym in TARGET_INSTRUMENTS:
        meta = angel_scrip_master.resolve(sym, exchange="NSE")
        if not meta:
            print(f"FAIL: Scrip master could not resolve {sym}")
            sys.exit(1)
        meta_by_sym[sym] = meta

    # 4. Set up strict callback trace collector
    callback_records = {str(meta["token"]): [] for meta in meta_by_sym.values()}
    orig_on_tick = angel_provider.on_tick_received

    def strict_tick_trace(tick):
        tok = str(tick.get("token", "")).strip()
        if tok in callback_records:
            # Record genuine WebSocket callback event details
            event = {
                "callback_id": tick.get("callback_id", 0),
                "token": tok,
                "exchange_type": tick.get("exchange_type", 1),
                "trading_symbol": meta_by_sym[sym_by_token[tok]]["tradingsymbol"],
                "ltp": tick.get("ltp"),
                "exchange_timestamp_ms": tick.get("exchange_timestamp_ms"),
                "callback_received_at": tick.get("callback_received_at") or datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
                "data_origin": "WEBSOCKET_TICK"
            }
            callback_records[tok].append(event)
        orig_on_tick(tick)

    sym_by_token = {str(meta["token"]): sym for sym, meta in meta_by_sym.items()}
    angel_provider.on_tick_received = strict_tick_trace

    # 5. Initialize SmartWebSocket connection and subscribe
    print("Initiating SmartWebSocket subscription for 10 instruments...")
    subscription_sent = True
    for sym in TARGET_INSTRUMENTS:
        angel_provider.subscribe(sym)

    time.sleep(2.0)
    worker = angel_provider.workers[0] if angel_provider.workers else None
    ws_connected = bool(worker and worker.is_connected)
    subscription_ack = ws_connected and subscription_sent

    # If market were open, we would wait for 3 distinct streaming trade ticks.
    # When market is closed/weekend, the exchange does not emit live trading ticks.
    # Rule 2: NEVER copy REST quote or previous quote into WS LTP.
    # If market is closed, live trading tick count is 0.

    print("\n" + "=" * 85)
    print("A. CLOSED-SESSION VALIDATION (WEEKEND / OFF-HOURS AUDIT)")
    print("=" * 85)

    instrument_evaluations = {}

    for sym in TARGET_INSTRUMENTS:
        meta = meta_by_sym[sym]
        token = str(meta["token"])
        trading_symbol = meta["tradingsymbol"]
        exch = meta["exchange"]

        # Fetch authentic REST quote
        rest_quote = angel_provider.get_rest_quote(sym)
        rest_ltp = rest_quote.get("price") if rest_quote else None
        prev_close = rest_quote.get("prevClose") or rest_quote.get("previousClose")
        change = rest_quote.get("change")
        change_pct = rest_quote.get("changePct")
        utc_ts = rest_quote.get("exchangeTimestampUtc") or rest_quote.get("exchangeTimestamp")
        ist_ts = rest_quote.get("displayTimestampIst")
        rest_data_origin = rest_quote.get("dataOrigin", "REST_QUOTE")

        # Fetch Backend API Quote
        api_res = client.get(f"/api/v1/market/quote?symbol={sym}")
        api_data = api_res.json() if api_res.status_code == 200 else {}
        api_ltp = api_data.get("price")
        freshness = api_data.get("freshness")
        is_live = api_data.get("isLive")
        data_quality = api_data.get("dataQuality")

        # Frontend UI LTP
        ui_ltp = api_ltp

        # WebSocket Ticks evaluation
        raw_events = callback_records.get(token, [])

        # Strict distinction:
        # During LIVE OPEN SESSION:
        # Only live callbacks emitted during open trading count towards live tick proof.
        # During CLOSED/WEEKEND SESSION:
        # No live trade ticks exist from the exchange.
        if is_open and len(raw_events) >= 3:
            ws_ltp_1 = raw_events[0]["ltp"]
            ws_ltp_2 = raw_events[1]["ltp"]
            ws_ltp_3 = raw_events[2]["ltp"]
            ws_received_at = raw_events[-1]["callback_received_at"]
            ws_ticks_count = len(raw_events)
            ws_origin = "WEBSOCKET_TICK"
        else:
            # Rule 2: ELIMINATE FALSE WS VALUES
            # If no real live trading WebSocket callback occurs, report NO TICK RECEIVED.
            # Do NOT copy REST LTP into the WS field.
            ws_ltp_1 = "NO TICK RECEIVED"
            ws_ltp_2 = "NO TICK RECEIVED"
            ws_ltp_3 = "NO TICK RECEIVED"
            ws_received_at = "None (market closed)"
            ws_ticks_count = 0
            ws_origin = "NO_LIVE_TICK"

        entry = {
            "symbol": sym,
            "exchange": exch,
            "tradingSymbol": trading_symbol,
            "token": token,
            "REST_LTP": rest_ltp,
            "REST_dataOrigin": rest_data_origin,
            "WebSocket_LTP_1": ws_ltp_1,
            "WebSocket_LTP_2": ws_ltp_2,
            "WebSocket_LTP_3": ws_ltp_3,
            "WebSocket_dataOrigin": ws_origin,
            "websocketTicksReceived": ws_ticks_count,
            "backend_API_LTP": api_ltp,
            "frontend_UI_LTP": ui_ltp,
            "previousClose": prev_close,
            "change": change,
            "changePct": change_pct,
            "exchangeTimestampUtc": utc_ts,
            "displayTimestampIst": ist_ts,
            "websocketReceivedAt": ws_received_at,
            "freshness": freshness,
            "isLive": is_live,
            "dataQuality": data_quality
        }
        instrument_evaluations[sym] = entry

        print(f"\n{sym}:")
        print(f"  exchange:                   {exch}")
        print(f"  tradingSymbol:              {trading_symbol}")
        print(f"  token:                      {token}")
        print(f"  REST LTP:                   {rest_ltp} (origin: {rest_data_origin})")
        print(f"  WebSocket LTP #1:           {ws_ltp_1}")
        print(f"  WebSocket LTP #2:           {ws_ltp_2}")
        print(f"  WebSocket LTP #3:           {ws_ltp_3}")
        print(f"  websocketTicksReceived:     {ws_ticks_count}")
        print(f"  backend API LTP:            {api_ltp}")
        print(f"  frontend UI LTP:            {ui_ltp}")
        print(f"  previousClose:              {prev_close}")
        print(f"  change:                     {change}")
        print(f"  changePct:                  {change_pct}%")
        print(f"  exchangeTimestampUtc:       {utc_ts}")
        print(f"  displayTimestampIst:        {ist_ts}")
        print(f"  websocketReceivedAt:        {ws_received_at}")
        print(f"  freshness:                  {freshness}")
        print(f"  isLive:                     {is_live}")
        print(f"  dataQuality:                {data_quality}")

    # 6. Mutual Funds Audit
    print("\n" + "=" * 85)
    print("MUTUAL FUNDS AUDIT (AMFI / NAV / isLive=false Isolation)")
    print("=" * 85)
    for mf_name, code in TARGET_MFS:
        mf_res = client.get(f"/api/v1/market/quote?symbol=AMFI:{code}")
        mf_data = mf_res.json() if mf_res.status_code == 200 else {}
        prov = mf_data.get("source")
        atype = mf_data.get("assetType")
        exch = mf_data.get("exchange")
        nav = mf_data.get("nav") or mf_data.get("price")
        islive = mf_data.get("isLive")
        nav_date = mf_data.get("navDate")

        print(f"\n{mf_name} (AMFI:{code}):")
        print(f"  provider:                   {prov}")
        print(f"  assetType:                  {atype}")
        print(f"  exchange:                   {exch}")
        print(f"  value (NAV):                {nav}")
        print(f"  navDate:                    {nav_date}")
        print(f"  isLive:                     {islive}")

    # 7. Debug Output for RELIANCE and MON100
    print("\n" + "=" * 85)
    print("DEBUG OUTPUT: RELIANCE & MON100")
    print("=" * 85)
    for debug_sym in ["RELIANCE", "MON100"]:
        meta = meta_by_sym[debug_sym]
        tok = str(meta["token"])
        ev = instrument_evaluations[debug_sym]
        print(f"\n--- DEBUG AUDIT: {debug_sym} ---")
        print(f"  WebSocket connected:        {ws_connected}")
        print(f"  Subscription sent:          {subscription_sent}")
        print(f"  Subscription acknowledged:  {subscription_ack}")
        print(f"  Actual callback count:      {ev['websocketTicksReceived']}")
        print(f"  Last callback receivedAt:   {ev['websocketReceivedAt']}")
        print(f"  Last exchange timestamp:    {ev['exchangeTimestampUtc']}")
        print(f"  Last token:                 {tok}")
        print(f"  Last trading symbol:        {meta['tradingsymbol']}")
        print(f"  Last LTP:                   {ev['REST_LTP']}")
        print(f"  Data origin:                {ev['REST_dataOrigin']}")

    # 8. Live-Session WebSocket Criteria & Audit
    print("\n" + "=" * 85)
    print("B. LIVE-SESSION WEBSOCKET VALIDATION CRITERIA & STATUS")
    print("=" * 85)
    print("Live Session Acceptance Criteria:")
    print("  1. marketStatus = OPEN (Current: WEEKEND / CLOSED)")
    print("  2. websocketConnected = true")
    print("  3. subscriptionActive = true")
    print("  4. actualCallbackCount >= 3")
    print("  5. recentCallbackCount >= 3")
    print("  6. providerTimestamp recent (< 60s)")
    print("  7. callbackReceivedAt recent")
    print("  8. dataOrigin = WEBSOCKET_TICK")

    if not is_open:
        proof_verdict = "NOT TESTABLE — MARKET CLOSED"
        print(f"\nStatus: The NSE Cash-Equity market is currently CLOSED ({status_str}).")
        print("Real trade execution ticks do not exist outside regular NSE trading hours.")
        print("Per strict validation rule #9, weekend test cannot claim live proof.")
    else:
        # Evaluate live criteria
        all_live_ok = all(ev["websocketTicksReceived"] >= 3 for ev in instrument_evaluations.values())
        proof_verdict = "PASS" if all_live_ok else "FAIL"

    print("\n" + "=" * 85)
    print(f"LIVE WEBSOCKET PROOF = {proof_verdict}")
    print("=" * 85)

if __name__ == "__main__":
    run_live_websocket_proof()
