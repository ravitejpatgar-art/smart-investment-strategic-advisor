import json
import logging
import urllib.request
import urllib.parse
from typing import Dict, Any, Optional, List
from datetime import datetime, timezone
from app.services.market_data.base import BaseMarketDataProvider, ProviderCapabilities
from app.services.market_data.freshness import DataFreshness
from app.services.market_data.normalizer import normalize_market_quote, create_unavailable_quote
from app.core.config import settings

logger = logging.getLogger(__name__)

# Canonical symbol mapping for TrueData Indian equities & indices
TRUEDATA_SYMBOL_MAP = {
    "NIFTY 50": "NIFTY 50",
    "NIFTY50": "NIFTY 50",
    "^NSEI": "NIFTY 50",
    "SENSEX": "SENSEX",
    "^BSESN": "SENSEX",
    "BANKNIFTY": "NIFTY BANK",
    "^NSEBANK": "NIFTY BANK",
    "NIFTY IT": "NIFTY IT",
    "^CNXIT": "NIFTY IT",
    "RELIANCE": "RELIANCE-EQ",
    "RELIANCE.NS": "RELIANCE-EQ",
    "TCS": "TCS-EQ",
    "TCS.NS": "TCS-EQ",
    "HDFCBANK": "HDFCBANK-EQ",
    "HDFCBANK.NS": "HDFCBANK-EQ",
    "INFY": "INFY-EQ",
    "INFY.NS": "INFY-EQ",
    "ICICIBANK": "ICICIBANK-EQ",
    "ICICIBANK.NS": "ICICIBANK-EQ",
    "SBIN": "SBIN-EQ",
    "SBIN.NS": "SBIN-EQ",
    "TATAMOTORS": "TATAMOTORS-EQ",
    "TATAMOTORS.NS": "TATAMOTORS-EQ",
    "TATASTEEL": "TATASTEEL-EQ",
    "TATASTEEL.NS": "TATASTEEL-EQ",
    "WIPRO": "WIPRO-EQ",
    "WIPRO.NS": "WIPRO-EQ"
}

class TrueDataProvider(BaseMarketDataProvider):
    """
    TrueData REST API provider adapter for authorized real-time/delayed
    Indian equities, indices, and derivatives feeds (NSE / BSE / MCX).
    
    Strictly disabled unless explicitly configured with server-side credentials
    via PAID_MARKET_DATA_API_KEY / TRUEDATA_API_KEY.
    """
    BASE_URL = "https://api.truedata.in"
    HIST_URL = "https://history.truedata.in"

    def __init__(self, api_key: Optional[str] = None):
        key = (
            api_key or 
            getattr(settings, "TRUEDATA_API_KEY", "") or 
            getattr(settings, "PAID_MARKET_DATA_API_KEY", "") or 
            getattr(settings, "INDIA_MARKET_DATA_API_KEY", "")
        )
        is_enabled = getattr(settings, "PAID_MARKET_DATA_ENABLED", False) or (
            getattr(settings, "INDIA_MARKET_DATA_PROVIDER", "").lower() == "truedata" and bool(key)
        )

        has_valid_key = bool(key and len(key.strip()) > 0)
        is_configured = is_enabled and has_valid_key

        capabilities = ProviderCapabilities(
            name="TrueData",
            realtime=is_configured,
            delayed=True,
            historical=True,
            mutual_funds_nav=False,
            fundamentals=True,
            commercial_display=True,
            api_key_required=True,
            is_configured=is_configured,
            entitlement_verified=is_configured
        )
        super().__init__("TrueData", capabilities)
        self.api_key = key if is_configured else ""

    def resolve_symbol(self, symbol: str) -> str:
        clean = symbol.upper().strip()
        if clean in TRUEDATA_SYMBOL_MAP:
            return TRUEDATA_SYMBOL_MAP[clean]
        # Normalize trailing .NS
        if clean.endswith(".NS"):
            base = clean[:-3]
            return f"{base}-EQ"
        if clean.endswith(".BO"):
            base = clean[:-3]
            return f"{base}-BSE"
        return clean

    def _make_request(self, base_url: str, endpoint: str, params: Optional[Dict[str, str]] = None, timeout: int = 4) -> Optional[Dict[str, Any]]:
        if not self.capabilities.is_configured or not self.api_key:
            return None

        qp = params.copy() if params else {}
        qp["key"] = self.api_key
        url = f"{base_url}{endpoint}?{urllib.parse.urlencode(qp)}"

        try:
            req = urllib.request.Request(
                url,
                headers={
                    "User-Agent": "SmartVest-Production/1.0",
                    "Accept": "application/json"
                }
            )
            with urllib.request.urlopen(req, timeout=timeout) as resp:
                if resp.status == 200:
                    data = json.loads(resp.read().decode("utf-8"))
                    return data
        except Exception as e:
            err_str = str(e)
            if "429" in err_str:
                logger.warning(f"[RATE_LIMIT] TrueData rate limit on {endpoint}: {e}")
            elif "401" in err_str or "403" in err_str:
                logger.warning(f"[AUTH_ERROR] TrueData entitlement error on {endpoint}: {e}")
            else:
                logger.info(f"[NETWORK/API] TrueData request to {endpoint} unsuccessful: {e}")
        return None

    def get_quote(self, symbol: str) -> Dict[str, Any]:
        if not self.capabilities.is_configured:
            return create_unavailable_quote(symbol, message="Paid Indian data provider is unconfigured")

        canonical_sym = symbol.upper().strip()
        td_sym = self.resolve_symbol(canonical_sym)

        # Call real-time snapshot endpoint
        data = self._make_request(self.BASE_URL, "/getRealtimeFeed", {"symbol": td_sym})
        if not data:
            return create_unavailable_quote(canonical_sym, message="TrueData quote unavailable")

        try:
            # Parse TrueData response payload
            price = float(data.get("ltp") or data.get("price") or 0.0)
            if price <= 0:
                return create_unavailable_quote(canonical_sym, message="Invalid quote price from TrueData")

            prev_close = float(data.get("prev_close") or data.get("close") or price)
            change = float(data.get("change") or (price - prev_close))
            change_pct = float(data.get("change_pct") or data.get("change_percent") or ((change / prev_close) * 100 if prev_close > 0 else 0.0))
            volume = int(data.get("volume") or 0)
            open_p = float(data.get("open") or price)
            high_p = float(data.get("high") or price)
            low_p = float(data.get("low") or price)
            ts = data.get("timestamp") or datetime.now(timezone.utc).isoformat()

            return normalize_market_quote(
                symbol=canonical_sym,
                name=data.get("company_name") or canonical_sym,
                exchange="NSE" if "-EQ" in td_sym or "NIFTY" in td_sym else "BSE",
                asset_type="INDEX" if "NIFTY" in canonical_sym or "SENSEX" in canonical_sym else "STOCK",
                price=price,
                currency="INR",
                change=round(change, 2),
                change_pct=round(change_pct, 2),
                volume=volume,
                open_price=open_p,
                high=high_p,
                low=low_p,
                prev_close=prev_close,
                timestamp=ts,
                freshness=DataFreshness.REALTIME if self.capabilities.realtime else DataFreshness.DELAYED,
                source="TrueData NSE Authorized Feed",
                message="Realtime feed supplied by TrueData"
            )
        except Exception as e:
            logger.warning(f"Error normalizing TrueData quote for {symbol}: {e}")
            return create_unavailable_quote(canonical_sym, message="TrueData payload parsing error")

    def get_candles(self, symbol: str, interval: str = "1d", range_period: str = "1mo") -> Dict[str, Any]:
        if not self.capabilities.is_configured:
            return {
                "symbol": symbol,
                "range": range_period,
                "interval": interval,
                "observations": [],
                "freshness": DataFreshness.UNAVAILABLE.value,
                "message": "TrueData historical feed unconfigured"
            }

        canonical_sym = symbol.upper().strip()
        td_sym = self.resolve_symbol(canonical_sym)

        data = self._make_request(self.HIST_URL, "/getHistorical", {
            "symbol": td_sym,
            "interval": interval,
            "range": range_period
        })

        if not data or not data.get("data") or not isinstance(data["data"], list):
            return {
                "symbol": canonical_sym,
                "range": range_period,
                "interval": interval,
                "observations": [],
                "freshness": DataFreshness.UNAVAILABLE.value,
                "message": "Historical observations unavailable from TrueData"
            }

        try:
            observations = []
            for row in data["data"]:
                obs_date = row.get("date") or row.get("time")
                c_val = float(row.get("close") or 0.0)
                if obs_date and c_val > 0:
                    observations.append({
                        "date": obs_date[:10] if len(obs_date) >= 10 else obs_date,
                        "timestamp": obs_date,
                        "open": float(row.get("open") or c_val),
                        "high": float(row.get("high") or c_val),
                        "low": float(row.get("low") or c_val),
                        "close": c_val,
                        "volume": int(row.get("volume") or 0)
                    })

            return {
                "symbol": canonical_sym,
                "range": range_period,
                "interval": interval,
                "observations": observations,
                "freshness": DataFreshness.HISTORICAL.value,
                "source": "TrueData Historical Feed",
                "message": "Historical candles supplied by TrueData"
            }
        except Exception as e:
            logger.warning(f"Error parsing TrueData candles for {symbol}: {e}")
            return {
                "symbol": canonical_sym,
                "range": range_period,
                "interval": interval,
                "observations": [],
                "freshness": DataFreshness.UNAVAILABLE.value,
                "message": "Error processing TrueData candles"
            }

    def get_fundamentals(self, symbol: str) -> Dict[str, Any]:
        return {}

    def get_instrument_metadata(self, symbol: str) -> Dict[str, Any]:
        return {
            "symbol": symbol,
            "provider": "TrueData",
            "country": "IN",
            "currency": "INR"
        }
