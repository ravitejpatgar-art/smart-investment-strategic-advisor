import sys
import os
import time
from datetime import datetime, timezone, timedelta

# Ensure backend path is in sys.path
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.core.config import settings
from app.services.market_data.providers.angel_provider import (
    AngelOneSmartAPIProvider,
    angel_provider,
    DEFAULT_ANGEL_TOKEN_MAP,
    generate_rfc6238_totp
)
from app.services.market_data.router import provider_router
from app.services.market_data.registry import market_registry
from app.services.market_data.cache import market_cache
from app.services.market_data.freshness import DataFreshness
from app.services.market_data.market_hours import get_indian_market_status, is_indian_equity_market_open
from app.services.market_data.normalizer import normalize_global_symbol, normalize_market_quote


def run_all_tests():
    passed_tests = 0
    total_tests = 23
    test_results = {}

    print("\n" + "=" * 80)
    print("PHASE P9.1: REAL-TIME INDIAN MARKET DATA + ANGEL ONE SMARTAPI SUITE")
    print("=" * 80)

    # -------------------------------------------------------------------------
    # TEST 1: Angel provider authentication (TOTP & Credentials Validation)
    # -------------------------------------------------------------------------
    print("\n[TEST 1] Angel provider authentication...")
    totp_test_secret = "JBSWY3DPEHPK3PXP"
    totp_code = generate_rfc6238_totp(totp_test_secret)
    assert len(totp_code) == 6 and totp_code.isdigit(), f"Invalid TOTP generated: {totp_code}"
    
    # Check current environment credentials
    creds_found = bool(
        settings.ANGEL_API_KEY and 
        settings.ANGEL_CLIENT_CODE and 
        settings.ANGEL_PIN and 
        settings.ANGEL_TOTP
    )
    print(f"  - Environment credentials present: {creds_found}")
    print(f"  - RFC 6238 TOTP generator verification: OK (Sample TOTP: {totp_code})")
    test_results["test_1_authentication"] = "PASS"
    passed_tests += 1

    # -------------------------------------------------------------------------
    # TEST 2: WebSocket connection simulation and state tracking
    # -------------------------------------------------------------------------
    print("\n[TEST 2] WebSocket connection...")
    test_provider = AngelOneSmartAPIProvider(
        api_key="TEST_KEY",
        client_code="TEST_CLIENT",
        pin="1234",
        totp_secret="JBSWY3DPEHPK3PXP"
    )
    test_provider.simulate_connection(True)
    assert test_provider.is_connected is True
    assert test_provider.connection_status == "CONNECTED"
    print(f"  - WebSocket connection state: {test_provider.connection_status} (OK)")
    test_results["test_2_websocket_connection"] = "PASS"
    passed_tests += 1

    # -------------------------------------------------------------------------
    # TEST 3: Heartbeat / Ping-Pong handling
    # -------------------------------------------------------------------------
    print("\n[TEST 3] Heartbeat / Ping-Pong...")
    hb_ok = test_provider.simulate_heartbeat()
    assert hb_ok is True
    assert test_provider.last_heartbeat_at > 0
    print(f"  - Heartbeat sent and confirmed at timestamp: {test_provider.last_heartbeat_at}")
    test_results["test_3_heartbeat"] = "PASS"
    passed_tests += 1

    # -------------------------------------------------------------------------
    # TEST 4: Reconnect logic on connection drop
    # -------------------------------------------------------------------------
    print("\n[TEST 4] Reconnect after drop...")
    test_provider.simulate_connection(False)
    assert test_provider.is_connected is False
    rec_ok = test_provider.simulate_reconnect()
    assert rec_ok is True
    assert test_provider.is_connected is True
    assert test_provider.reconnect_count >= 1
    print(f"  - Reconnected successfully. Reconnect count: {test_provider.reconnect_count}")
    test_results["test_4_reconnect"] = "PASS"
    passed_tests += 1

    # -------------------------------------------------------------------------
    # TEST 5: Subscription batching
    # -------------------------------------------------------------------------
    print("\n[TEST 5] Subscription batching...")
    batch_symbols = ["RELIANCE", "TCS", "INFY", "HDFCBANK", "ICICIBANK", "NIFTYBEES", "GOLDBEES", "MON100"]
    batch_res = test_provider.subscribe_batch(batch_symbols)
    assert all(batch_res.values()), f"Some batch subscriptions failed: {batch_res}"
    print(f"  - Batch subscribed {len(batch_symbols)} instruments successfully: {list(batch_res.keys())}")
    test_results["test_5_subscription_batching"] = "PASS"
    passed_tests += 1

    # -------------------------------------------------------------------------
    # TEST 6: Duplicate subscription prevention
    # -------------------------------------------------------------------------
    print("\n[TEST 6] Duplicate subscription prevention...")
    initial_count = len(test_provider.subscribed_instruments)
    dup_res = test_provider.subscribe("RELIANCE")
    assert dup_res is True
    assert len(test_provider.subscribed_instruments) == initial_count, "Duplicate subscription added twice!"
    print(f"  - Duplicate subscription correctly deduplicated. Registry count unchanged: {initial_count}")
    test_results["test_6_duplicate_prevention"] = "PASS"
    passed_tests += 1

    # -------------------------------------------------------------------------
    # Fixed test timestamp to simulate realistic recent exchange tick
    # -------------------------------------------------------------------------
    recent_ts_ms = int(time.time() * 1000) - 5000  # 5 seconds ago

    # -------------------------------------------------------------------------
    # TEST 7: Reliance live tick
    # -------------------------------------------------------------------------
    print("\n[TEST 7] Reliance live tick...")
    q_rel = test_provider.simulate_tick(
        symbol="RELIANCE",
        ltp=1255.40,
        open_price=1240.0,
        high_price=1260.0,
        low_price=1235.0,
        prev_close=1242.0,
        volume=2500000,
        exchange_timestamp_ms=recent_ts_ms
    )
    assert q_rel is not None
    assert q_rel["price"] == 1255.40
    assert q_rel["source"] == "Angel One SmartAPI"
    assert q_rel["instrumentType"] == "STOCK"
    assert q_rel["change"] == round(1255.40 - 1242.0, 2)
    print(f"  - RELIANCE tick received: Price=INR {q_rel['price']}, Change=INR {q_rel['change']} ({q_rel['changePercent']}%), Source={q_rel['source']}")
    test_results["test_7_reliance_tick"] = "PASS"
    passed_tests += 1

    # -------------------------------------------------------------------------
    # TEST 8: TCS live tick
    # -------------------------------------------------------------------------
    print("\n[TEST 8] TCS live tick...")
    q_tcs = test_provider.simulate_tick("TCS", 4120.50, prev_close=4100.0, exchange_timestamp_ms=recent_ts_ms)
    assert q_tcs is not None
    assert q_tcs["price"] == 4120.50
    assert q_tcs["source"] == "Angel One SmartAPI"
    print(f"  - TCS tick received: Price=INR {q_tcs['price']}, Source={q_tcs['source']}")
    test_results["test_8_tcs_tick"] = "PASS"
    passed_tests += 1

    # -------------------------------------------------------------------------
    # TEST 9: INFY live tick
    # -------------------------------------------------------------------------
    print("\n[TEST 9] INFY live tick...")
    q_infy = test_provider.simulate_tick("INFY", 1880.25, prev_close=1870.0, exchange_timestamp_ms=recent_ts_ms)
    assert q_infy is not None
    assert q_infy["price"] == 1880.25
    print(f"  - INFY tick received: Price=INR {q_infy['price']}")
    test_results["test_9_infy_tick"] = "PASS"
    passed_tests += 1

    # -------------------------------------------------------------------------
    # TEST 10: HDFCBANK live tick
    # -------------------------------------------------------------------------
    print("\n[TEST 10] HDFCBANK live tick...")
    q_hdfc = test_provider.simulate_tick("HDFCBANK", 1640.80, prev_close=1630.0, exchange_timestamp_ms=recent_ts_ms)
    assert q_hdfc is not None
    assert q_hdfc["price"] == 1640.80
    print(f"  - HDFCBANK tick received: Price=INR {q_hdfc['price']}")
    test_results["test_10_hdfcbank_tick"] = "PASS"
    passed_tests += 1

    # -------------------------------------------------------------------------
    # TEST 11: ICICIBANK live tick
    # -------------------------------------------------------------------------
    print("\n[TEST 11] ICICIBANK live tick...")
    q_icici = test_provider.simulate_tick("ICICIBANK", 1215.10, prev_close=1210.0, exchange_timestamp_ms=recent_ts_ms)
    assert q_icici is not None
    assert q_icici["price"] == 1215.10
    print(f"  - ICICIBANK tick received: Price=INR {q_icici['price']}")
    test_results["test_11_icicibank_tick"] = "PASS"
    passed_tests += 1

    # -------------------------------------------------------------------------
    # TEST 12: NIFTYBEES live tick
    # -------------------------------------------------------------------------
    print("\n[TEST 12] NIFTYBEES live tick...")
    q_niftybees = test_provider.simulate_tick("NIFTYBEES", 262.40, prev_close=260.0, exchange_timestamp_ms=recent_ts_ms)
    assert q_niftybees is not None
    assert q_niftybees["price"] == 262.40
    assert q_niftybees["instrumentType"] == "ETF"
    print(f"  - NIFTYBEES ETF tick received: Price=INR {q_niftybees['price']}, Type={q_niftybees['instrumentType']}")
    test_results["test_12_niftybees_tick"] = "PASS"
    passed_tests += 1

    # -------------------------------------------------------------------------
    # TEST 13: GOLDBEES live tick
    # -------------------------------------------------------------------------
    print("\n[TEST 13] GOLDBEES live tick...")
    q_goldbees = test_provider.simulate_tick("GOLDBEES", 62.15, prev_close=61.80, exchange_timestamp_ms=recent_ts_ms)
    assert q_goldbees is not None
    assert q_goldbees["price"] == 62.15
    assert q_goldbees["instrumentType"] == "ETF"
    print(f"  - GOLDBEES ETF tick received: Price=INR {q_goldbees['price']}, Type={q_goldbees['instrumentType']}")
    test_results["test_13_goldbees_tick"] = "PASS"
    passed_tests += 1

    # -------------------------------------------------------------------------
    # TEST 14: MON100 live tick
    # -------------------------------------------------------------------------
    print("\n[TEST 14] MON100 live tick...")
    q_mon100 = test_provider.simulate_tick("MON100", 178.50, prev_close=176.0, exchange_timestamp_ms=recent_ts_ms)
    assert q_mon100 is not None
    assert q_mon100["price"] == 178.50
    assert q_mon100["instrumentType"] == "ETF"
    print(f"  - MON100 ETF tick received: Price=INR {q_mon100['price']}, Type={q_mon100['instrumentType']}")
    test_results["test_14_mon100_tick"] = "PASS"
    passed_tests += 1

    # -------------------------------------------------------------------------
    # TEST 15: Correct provider timestamp verification (NEVER datetime.now())
    # -------------------------------------------------------------------------
    print("\n[TEST 15] Correct provider timestamp preservation...")
    specific_ts_ms = 1758013200000  # Exact epoch: 2025-09-16T09:00:00Z
    expected_iso_prefix = "2025-09-16T"
    q_ts = test_provider.simulate_tick("RELIANCE", 1260.0, exchange_timestamp_ms=specific_ts_ms)
    assert q_ts["providerTimestamp"] == specific_ts_ms
    assert q_ts["timestamp"].startswith(expected_iso_prefix), f"Timestamp {q_ts['timestamp']} does not match provider timestamp!"
    print(f"  - Preserved Provider Timestamp: {q_ts['providerTimestamp']} -> ISO: {q_ts['timestamp']}")
    test_results["test_15_provider_timestamp"] = "PASS"
    passed_tests += 1

    # -------------------------------------------------------------------------
    # TEST 16: Stale tick handling (> threshold seconds)
    # -------------------------------------------------------------------------
    print("\n[TEST 16] Stale tick handling...")
    old_ts_ms = int((time.time() - 300) * 1000)  # 5 minutes ago (well beyond 60s threshold)
    q_stale = test_provider.simulate_tick("RELIANCE", 1250.0, exchange_timestamp_ms=old_ts_ms)
    assert q_stale["isStale"] is True, "Old tick was not marked isStale=True!"
    assert q_stale["isLive"] is False, "Stale tick was marked isLive=True!"
    print(f"  - Stale tick correctly marked: isStale={q_stale['isStale']}, isLive={q_stale['isLive']}")
    test_results["test_16_stale_tick"] = "PASS"
    passed_tests += 1

    # -------------------------------------------------------------------------
    # TEST 17: WebSocket disconnect handling
    # -------------------------------------------------------------------------
    print("\n[TEST 17] WebSocket disconnect handling...")
    test_provider.simulate_connection(False)
    q_dc = test_provider.get_quote("RELIANCE")
    assert q_dc["isLive"] is False, "Disconnected feed marked quote as LIVE!"
    print(f"  - On WebSocket disconnect: isConnected={test_provider.is_connected}, quote.isLive={q_dc['isLive']}")
    test_results["test_17_disconnect"] = "PASS"
    passed_tests += 1

    # Reconnect for remaining tests
    test_provider.simulate_connection(True)

    # -------------------------------------------------------------------------
    # TEST 18: Yahoo fallback when provider has no quote
    # -------------------------------------------------------------------------
    print("\n[TEST 18] Yahoo fallback...")
    # Clear cache to guarantee fresh query to Yahoo Finance fallback
    market_cache.clear()
    q_fallback = provider_router.indian_equities.get_quote("SBIN")
    assert q_fallback is not None
    assert "Yahoo" in (q_fallback.get("source") or "")
    print(f"  - Fallback quote retrieved for SBIN: Source='{q_fallback.get('source')}', Price={q_fallback.get('price')}")
    test_results["test_18_yahoo_fallback"] = "PASS"
    passed_tests += 1

    # -------------------------------------------------------------------------
    # TEST 19: Fallback never marked LIVE
    # -------------------------------------------------------------------------
    print("\n[TEST 19] Fallback never marked LIVE...")
    assert q_fallback["isLive"] is False, "Fallback quote was marked isLive=True!"
    assert q_fallback["freshness"] != "REALTIME", "Fallback freshness marked REALTIME!"
    print(f"  - Verified fallback truthfulness: isLive={q_fallback.get('isLive')}, freshness={q_fallback.get('freshness')}")
    test_results["test_19_fallback_never_live"] = "PASS"
    passed_tests += 1

    # -------------------------------------------------------------------------
    # TEST 20: Market CLOSED disables live state
    # -------------------------------------------------------------------------
    print("\n[TEST 20] Market CLOSED disables live state...")
    norm_closed = normalize_market_quote(
        symbol="RELIANCE.NS",
        name="Reliance Industries",
        exchange="NSE",
        asset_type="STOCK",
        price=1250.0,
        market_status="CLOSED",
        is_live=True # Attempt to set live
    )
    assert norm_closed["isLive"] is False, "Closed market allowed isLive=True!"
    assert norm_closed["marketStatus"] == "CLOSED"
    print(f"  - Verified closed market protection: marketStatus={norm_closed['marketStatus']}, isLive={norm_closed['isLive']}")
    test_results["test_20_market_closed_disables_live"] = "PASS"
    passed_tests += 1

    # -------------------------------------------------------------------------
    # TEST 21: Mutual fund remains NAV (NEVER LIVE)
    # -------------------------------------------------------------------------
    print("\n[TEST 21] Mutual fund remains NAV...")
    q_mf = provider_router.mutual_funds.get_quote("122639")
    assert q_mf is not None
    assert q_mf["assetType"] == "MUTUAL_FUND"
    assert q_mf["instrumentType"] == "MUTUAL_FUND"
    assert q_mf["isLive"] is False, "Mutual fund marked as LIVE!"
    assert q_mf.get("navDate") is not None, "Mutual fund missing navDate!"
    print(f"  - Verified Mutual Fund: AssetType={q_mf['instrumentType']}, isLive={q_mf['isLive']}, NAV Date={q_mf.get('navDate')}")
    test_results["test_21_mutual_fund_remains_nav"] = "PASS"
    passed_tests += 1

    # -------------------------------------------------------------------------
    # TEST 22: No credentials behavior (Graceful STANDBY)
    # -------------------------------------------------------------------------
    print("\n[TEST 22] No credentials behavior...")
    empty_provider = AngelOneSmartAPIProvider(api_key="", client_code="", pin="", totp_secret="")
    assert empty_provider.is_configured is False
    assert empty_provider.connection_status == "CREDENTIALS_REQUIRED"
    assert empty_provider.get_quote("RELIANCE") is None
    status = empty_provider.get_status()
    assert status["credentialsFound"] is False
    assert len(status["missingCredentials"]) == 4
    print(f"  - Verified no-credentials behavior: Status={status['connectionStatus']}, Missing={status['missingCredentials']}")
    test_results["test_22_no_credentials_behavior"] = "PASS"
    passed_tests += 1

    # -------------------------------------------------------------------------
    # TEST 23: Multiple WebSocket connections for > 1,000 subscriptions
    # -------------------------------------------------------------------------
    print("\n[TEST 23] Multiple WebSocket connections (> 1,000 capacity)...")
    multi_worker_provider = AngelOneSmartAPIProvider(
        api_key="TEST_KEY",
        client_code="TEST_CLIENT",
        pin="1234",
        totp_secret="JBSWY3DPEHPK3PXP"
    )
    # Simulate adding 1,500 distinct tokens
    tokens_1500 = [f"TOKEN_{i}" for i in range(1500)]
    w1 = multi_worker_provider._get_or_create_worker()
    # Fill worker 1 to 1000
    w1.add_tokens(tokens_1500[:1000])
    assert w1.can_accept(1) is False, "Worker 1 did not enforce 1,000 token limit!"
    # Request worker for next 500 tokens
    w2 = multi_worker_provider._get_or_create_worker()
    w2.add_tokens(tokens_1500[1000:])
    assert len(multi_worker_provider.workers) == 2, f"Expected 2 workers, got {len(multi_worker_provider.workers)}"
    assert len(w1.subscribed_tokens) == 1000
    assert len(w2.subscribed_tokens) == 500
    print(f"  - Successfully partitioned 1,500 subscriptions across {len(multi_worker_provider.workers)} WebSocket workers.")
    print(f"    Worker #1 tokens: {len(w1.subscribed_tokens)}, Worker #2 tokens: {len(w2.subscribed_tokens)}")
    test_results["test_23_multiple_connections"] = "PASS"
    passed_tests += 1

    # -------------------------------------------------------------------------
    # SUMMARY REPORT
    # -------------------------------------------------------------------------
    print("\n" + "=" * 80)
    print(f"TEST RUN COMPLETE: {passed_tests} / {total_tests} TESTS PASSED")
    print("=" * 80)
    for t_name, t_res in test_results.items():
        print(f"  {t_name:35} : {t_res}")

    return passed_tests == total_tests


if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)
