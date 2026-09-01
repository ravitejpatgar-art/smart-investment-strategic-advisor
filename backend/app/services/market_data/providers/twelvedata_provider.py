import json
import logging
import urllib.request
import urllib.parse
from typing import Dict, Any, Optional
from datetime import datetime, timezone
from app.services.market_data.base import BaseMarketDataProvider, ProviderCapabilities
from app.services.market_data.freshness import DataFreshness
from app.services.market_data.normalizer import normalize_market_quote, create_unavailable_quote
from app.core.config import settings

logger = logging.getLogger(__name__)

class TwelveDataProvider(BaseMarketDataProvider):
    """
    TwelveData REST API adapter for global equities, ETFs, Forex, and indices.
    """
    BASE_URL = "https://api.twelvedata.com"

    def __init__(self, api_key: Optional[str] = None):
        key = api_key or getattr(settings, "TWELVEDATA_API_KEY", "") or getattr(settings, "TWELVEDATA_API_KEY_BACKUP", "") or getattr(settings, "MARKET_DATA_API_KEY", "") or getattr(settings, "MARKET_DATA_API_KEY_BACKUP", "")
        capabilities = ProviderCapabilities(
            name="TwelveData",
            realtime=bool(key),
            delayed=True,
            historical=True,
            mutual_funds_nav=False,
            fundamentals=True,
            commercial_display=True,
            api_key_required=True,
            is_configured=bool(key),
            entitlement_verified=bool(key)
        )
        super().__init__("TwelveData", capabilities)
        self.api_key = key

    def _make_request(self, endpoint: str, params: Optional[Dict[str, str]] = None, timeout: int = 6) -> Optional[Dict[str, Any]]:
        if not self.api_key:
            return None
        
        qp = params.copy() if params else {}
        qp["apikey"] = self.api_key
        url = f"{self.BASE_URL}{endpoint}?{urllib.parse.urlencode(qp)}"

        try:
            req = urllib.request.Request(
                url,
                headers={"User-Agent": "SmartVest/1.0", "Accept": "application/json"}
            )
            with urllib.request.urlopen(req, timeout=timeout) as resp:
                if resp.status == 200:
                    data = json.loads(resp.read().decode("utf-8"))
                    if data.get("status") == "error" or "code" in data:
                        logger.warning(f"TwelveData returned error: {data.get('message')}")
                        return None
                    return data
        except Exception as e:
            logger.warning(f"TwelveData request to {endpoint} failed: {e}")
        return None

    def get_quote(self, symbol: str) -> Dict[str, Any]:
        clean_sym = symbol.upper().strip()
        if not self.api_key:
            return create_unavailable_quote(clean_sym, message="TwelveData API key not configured.")

        res = self._make_request("/quote", {"symbol": clean_sym})
        if not res or "close" not in res:
            return create_unavailable_quote(clean_sym, message="Instrument quote not found on TwelveData.")

        try:
            c = float(res.get("close") or 0.0)
            o = float(res.get("open") or c)
            h = float(res.get("high") or c)
            l = float(res.get("low") or c)
            pc = float(res.get("previous_close") or o)
            ch = float(res.get("change") or (c - pc))
            ch_pct = float(res.get("percent_change") or ((ch / pc * 100) if pc > 0 else 0.0))
            vol = int(res.get("volume") or 0)
            currency = res.get("currency") or "USD"
            exchange = res.get("exchange") or "GLOBAL"

            return normalize_market_quote(
                symbol=clean_sym,
                name=res.get("name") or clean_sym,
                exchange=exchange,
                asset_type="STOCK",
                price=c,
                change=ch,
                change_pct=ch_pct,
                volume=vol,
                freshness=DataFreshness.REALTIME if res.get("is_market_open") else DataFreshness.LATEST_AVAILABLE,
                source="TwelveData",
                currency=currency,
                open_price=o,
                high_price=h,
                low_price=l,
                prev_close=pc,
                market_status="OPEN" if res.get("is_market_open") else "CLOSED"
            )
        except Exception as e:
            logger.warning(f"Error parsing TwelveData quote for {symbol}: {e}")
            return create_unavailable_quote(clean_sym, message=str(e))

    def get_candles(self, symbol: str, interval: str = "1d", range_period: str = "1mo") -> Dict[str, Any]:
        clean_sym = symbol.upper().strip()
        if not self.api_key:
            return {
                "symbol": clean_sym,
                "range": range_period,
                "interval": interval,
                "freshness": DataFreshness.UNAVAILABLE.value,
                "observations": [],
                "message": "TwelveData API key not configured."
            }

        td_interval = "1day" if interval in ["1d", "d", "daily"] else "1h" if "h" in interval else "5min"
        
        outputsize_map = {
            "1d": 50,
            "5d": 100,
            "1mo": 30,
            "3mo": 90,
            "6mo": 180,
            "1y": 365,
            "3y": 1000,
            "5y": 1800,
            "10y": 3600,
            "max": 5000
        }
        size = outputsize_map.get(range_period.lower(), 30)

        res = self._make_request("/time_series", {
            "symbol": clean_sym,
            "interval": td_interval,
            "outputsize": str(size)
        })

        if not res or "values" not in res:
            return {
                "symbol": clean_sym,
                "range": range_period,
                "interval": interval,
                "freshness": DataFreshness.UNAVAILABLE.value,
                "observations": [],
                "message": "No historical data from TwelveData."
            }

        values = res.get("values", [])
        # TwelveData returns newest first -> reverse for chronological
        values.reverse()

        observations = []
        for val in values:
            try:
                dt_str = val.get("datetime")
                c = float(val.get("close") or 0.0)
                observations.append({
                    "date": dt_str.split(" ")[0] if " " in dt_str else dt_str,
                    "timestamp": dt_str,
                    "open": round(float(val.get("open") or c), 2),
                    "high": round(float(val.get("high") or c), 2),
                    "low": round(float(val.get("low") or c), 2),
                    "close": round(c, 2),
                    "volume": int(val.get("volume") or 0)
                })
            except Exception:
                continue

        return {
            "symbol": clean_sym,
            "range": range_period,
            "interval": interval,
            "source": "TwelveData",
            "freshness": DataFreshness.HISTORICAL.value,
            "observations": observations
        }

    def get_fundamentals(self, symbol: str) -> Dict[str, Any]:
        clean_sym = symbol.upper().strip()
        if not self.api_key:
            return {"symbol": clean_sym, "freshness": DataFreshness.UNAVAILABLE.value}

        res = self._make_request("/profile", {"symbol": clean_sym})
        if not res or "name" not in res:
            return {"symbol": clean_sym, "freshness": DataFreshness.UNAVAILABLE.value}

        return {
            "symbol": clean_sym,
            "name": res.get("name"),
            "sector": res.get("sector"),
            "industry": res.get("industry"),
            "country": res.get("country"),
            "employees": res.get("employees"),
            "description": res.get("description"),
            "website": res.get("website"),
            "freshness": DataFreshness.LATEST_AVAILABLE.value,
            "source": "TwelveData"
        }

    def get_instrument_metadata(self, symbol: str) -> Dict[str, Any]:
        return self.get_fundamentals(symbol)
