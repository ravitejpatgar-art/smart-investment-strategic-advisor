import time
import pytest
from unittest.mock import MagicMock, patch
from app.services.market_data.providers.angel_provider import (
    angel_provider,
    SmartStreamWorker,
    scrub_sensitive_tokens,
    TICK_FRESHNESS_THRESHOLD_SECONDS
)
from app.services.market_data.router import provider_router
from app.services.market_data.freshness import DataFreshness

class TestAngelProviderResilience:

    @pytest.fixture(autouse=True)
    def setup_angel(self):
        # Save state
        orig_ticks = dict(angel_provider._latest_ticks)
        yield
        # Restore state
        angel_provider._latest_ticks = orig_ticks

    def test_fresh_websocket_tick_bypasses_rest(self):
        """1. Fresh WebSocket tick (<60s during open market) returns immediately without calling REST."""
        token = "2885"  # RELIANCE
        now = time.time()
        fresh_tick = {
            "symbol": "RELIANCE.NS",
            "name": "RELIANCE",
            "exchange": "NSE",
            "asset_type": "STOCK",
            "price": 2950.50,
            "change": 15.5,
            "change_pct": 0.53,
            "volume": 1200000,
            "open_price": 2940.0,
            "high_price": 2960.0,
            "low_price": 2935.0,
            "prev_close": 2935.0,
            "currency": "INR",
            "freshness": "REALTIME",
            "source": "Angel One SmartAPI",
            "provider": "Angel One SmartAPI",
            "market_status": "OPEN",
            "provider_timestamp": int(now * 1000),
            "is_live": True,
            "token": token,
            "tradingsymbol": "RELIANCE-EQ"
        }
        with angel_provider._lock:
            angel_provider._latest_ticks[token] = fresh_tick

        with patch("app.services.market_data.providers.angel_provider.get_indian_market_status", return_value={"isOpen": True, "status": "OPEN"}), \
             patch.object(angel_provider, "get_rest_quote", side_effect=AssertionError("REST quote should NOT be called when fresh tick exists")):
            quote = angel_provider.get_quote("RELIANCE")

        assert quote is not None
        assert quote["price"] == 2950.50
        assert quote["source"] == "Angel One SmartAPI"
        assert quote["isLive"] is True
        assert quote["freshness"] == "REALTIME"

    def test_stale_websocket_tick_does_not_bypass_rest(self):
        """2. Stale WebSocket tick (>=60s during open market) does NOT bypass REST."""
        token = "2885"
        stale_time = time.time() - 150  # 150s old
        stale_tick = {
            "symbol": "RELIANCE.NS",
            "name": "RELIANCE",
            "exchange": "NSE",
            "price": 2900.0,
            "source": "Angel One SmartAPI",
            "provider_timestamp": int(stale_time * 1000),
            "token": token
        }
        with angel_provider._lock:
            angel_provider._latest_ticks[token] = stale_tick

        mock_rest_quote = {
            "symbol": "RELIANCE.NS",
            "name": "RELIANCE",
            "exchange": "NSE",
            "price": 2955.0,
            "source": "Angel One SmartAPI",
            "isLive": True,
            "freshness": "REALTIME"
        }

        rest_called = []
        def _fake_rest(sym):
            rest_called.append(sym)
            return mock_rest_quote

        with patch("app.services.market_data.providers.angel_provider.get_indian_market_status", return_value={"isOpen": True, "status": "OPEN"}), \
             patch.object(angel_provider, "get_rest_quote", side_effect=_fake_rest):
            quote = angel_provider.get_quote("RELIANCE")

        assert len(rest_called) == 1
        assert quote is not None
        assert quote["price"] == 2955.0

    def test_rest_getmarketdata_success(self):
        """3. REST getMarketData success returns normalized quote."""
        meta = {"token": "2885", "exchange": "NSE", "tradingsymbol": "RELIANCE-EQ", "name": "RELIANCE", "asset_type": "STOCK"}
        
        mock_smart_connect = MagicMock()
        mock_smart_connect.return_value.getMarketData.return_value = {
            "status": True,
            "data": {
                "fetched": [{
                    "ltp": 2965.0,
                    "close": 2940.0,
                    "open": 2950.0,
                    "high": 2970.0,
                    "low": 2945.0,
                    "netChange": 25.0,
                    "percentChange": 0.85,
                    "tradeVolume": 500000,
                    "exchTradeTime": "25-Sep-2026 12:30:00"
                }]
            }
        }

        with patch.object(angel_provider, "resolve_token", return_value=meta), \
             patch.object(angel_provider, "ensure_authenticated", return_value=True), \
             patch("SmartApi.smartConnect.SmartConnect", mock_smart_connect):
            angel_provider.jwt_token = "Bearer dummy_jwt"
            quote = angel_provider.get_rest_quote("RELIANCE")

        assert quote is not None
        assert quote["price"] == 2965.0
        assert quote["source"] == "Angel One SmartAPI"
        assert quote["exchange"] == "NSE"

    def test_rest_ltpdata_fallback(self):
        """4. REST ltpData fallback executes when getMarketData returns status=False."""
        meta = {"token": "2885", "exchange": "NSE", "tradingsymbol": "RELIANCE-EQ", "name": "RELIANCE", "asset_type": "STOCK"}

        mock_smart_connect = MagicMock()
        # getMarketData fails, ltpData succeeds
        mock_smart_connect.return_value.getMarketData.return_value = {"status": False, "message": "Mode FULL unavailable", "errorcode": "AG8001"}
        mock_smart_connect.return_value.ltpData.return_value = {
            "status": True,
            "data": {
                "ltp": 2960.0,
                "close": 2940.0,
                "open": 2950.0,
                "high": 2965.0,
                "low": 2940.0
            }
        }

        with patch.object(angel_provider, "resolve_token", return_value=meta), \
             patch.object(angel_provider, "ensure_authenticated", return_value=True), \
             patch("SmartApi.smartConnect.SmartConnect", mock_smart_connect):
            angel_provider.jwt_token = "Bearer dummy_jwt"
            quote = angel_provider.get_rest_quote("RELIANCE")

        assert quote is not None
        assert quote["price"] == 2960.0
        assert quote["source"] == "Angel One SmartAPI"

    def test_empty_rest_and_no_tick_returns_none_for_fallback(self):
        """5. When both REST and WebSocket tick are unavailable, get_quote returns None for router fallback."""
        token = "2885"
        with angel_provider._lock:
            angel_provider._latest_ticks.pop(token, None)

        with patch.object(angel_provider, "get_rest_quote", return_value=None), \
             patch("app.services.market_data.providers.angel_provider.get_indian_market_status", return_value={"isOpen": True, "status": "OPEN"}):
            quote = angel_provider.get_quote("RELIANCE")

        assert quote is None

    def test_websocket_close_callback_does_not_crash(self):
        """6. WebSocket close callback gracefully handles variable positional arguments from websocket-client."""
        worker = SmartStreamWorker(worker_id=99, provider=angel_provider)
        
        # Test calling _on_worker_close with 1, 2, 3, and 4 arguments
        try:
            worker._on_worker_close("mock_ws")
            worker._on_worker_close("mock_ws", 1000)
            worker._on_worker_close("mock_ws", 1000, "Normal closure")
            worker._on_worker_close("mock_ws", 1000, "Normal closure", {"extra": True})
        except TypeError as e:
            pytest.fail(f"_on_worker_close crashed with TypeError: {e}")

    def test_source_remains_angel_one_smartapi(self):
        """7. Quotes returned from Angel provider strictly preserve source = 'Angel One SmartAPI'."""
        token = "2885"
        tick = {
            "symbol": "RELIANCE.NS",
            "name": "RELIANCE",
            "exchange": "NSE",
            "price": 2950.0,
            "source": "Angel One SmartAPI",
            "provider_timestamp": int(time.time() * 1000),
            "is_live": True,
            "token": token
        }
        with angel_provider._lock:
            angel_provider._latest_ticks[token] = tick

        with patch("app.services.market_data.providers.angel_provider.get_indian_market_status", return_value={"isOpen": True, "status": "OPEN"}):
            quote = angel_provider.get_quote("RELIANCE")

        assert quote["source"] == "Angel One SmartAPI"
        assert quote["provider"] == "Angel One SmartAPI"

    def test_fallback_source_is_not_mislabeled_as_angel_one(self):
        """8. When Angel fails, fallback quote from ProviderRouter is NOT mislabeled as Angel One."""
        with patch.object(angel_provider, "get_quote", return_value=None):
            quote = provider_router.get_quote("RELIANCE")

        assert quote is not None
        assert quote["source"] != "Angel One SmartAPI"
        assert "Yahoo" in quote.get("source", "") or "Fallback" in quote.get("source", "")
        assert quote.get("isLive") is False

    def test_secrets_never_appear_in_logs(self):
        """9. Sensitive tokens (API keys, PINs, passwords, JWT, TOTP) are properly scrubbed."""
        test_str = "Error with api_token=SECRET1234567890123456 and jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9 and eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"
        scrubbed = scrub_sensitive_tokens(test_str)
        assert "SECRET1234567890123456" not in scrubbed
        assert "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9" not in scrubbed
        assert "***" in scrubbed
