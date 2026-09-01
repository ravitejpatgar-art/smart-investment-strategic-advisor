import json
import logging
import urllib.request
import urllib.parse
from typing import Dict, Any, Optional, List
from datetime import datetime, timezone, timedelta
from app.services.market_data.base import BaseMarketDataProvider, ProviderCapabilities
from app.services.market_data.freshness import DataFreshness
from app.services.market_data.normalizer import normalize_market_quote, create_unavailable_quote
from app.core.config import settings

logger = logging.getLogger(__name__)

class PolygonProvider(BaseMarketDataProvider):
    """
    Polygon.io REST API adapter for real-time US equities, ETFs, and aggregate candles.
    """
    BASE_URL = "https://api.polygon.io"

    def __init__(self, api_key: Optional[str] = None):
        key = api_key or getattr(settings, "POLYGON_API_KEY", "") or getattr(settings, "POLYGON_API_KEY_BACKUP", "") or getattr(settings, "US_MARKET_DATA_API_KEY", "") or getattr(settings, "US_MARKET_DATA_API_KEY_BACKUP", "")
        capabilities = ProviderCapabilities(
            name="Polygon.io",
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
        super().__init__("Polygon.io", capabilities)
        self.api_key = key

    def _make_request(self, endpoint: str, params: Optional[Dict[str, str]] = None, timeout: int = 5) -> Optional[Dict[str, Any]]:
        if not self.api_key:
            return None
        
        qp = params.copy() if params else {}
        qp["apiKey"] = self.api_key
        url = f"{self.BASE_URL}{endpoint}?{urllib.parse.urlencode(qp)}"

        try:
            req = urllib.request.Request(
                url,
                headers={
                    "User-Agent": "SmartVest/1.0",
                    "Accept": "application/json"
                }
            )
            with urllib.request.urlopen(req, timeout=timeout) as resp:
                if resp.status == 200:
                    return json.loads(resp.read().decode("utf-8"))
        except Exception as e:
            logger.warning(f"Polygon API request to {endpoint} failed: {e}")
        return None

    def get_quote(self, symbol: str) -> Dict[str, Any]:
        clean_sym = symbol.upper().replace(".NS", "").replace(".BO", "").strip()
        
        if not self.api_key:
            return create_unavailable_quote(clean_sym, message="Polygon API key not configured.")

        # Try previous day aggregate (works on all tiers)
        res = self._make_request(f"/v2/aggs/ticker/{clean_sym}/prev", {"adjusted": "true"})
        if not res or res.get("status") not in ["OK", "DELAYED"] or not res.get("results"):
            return create_unavailable_quote(clean_sym, message="Instrument quote not found on Polygon.")

        result = res["results"][0]
        c = result.get("c") or 0.0
        o = result.get("o") or c
        h = result.get("h") or c
        l = result.get("l") or c
        v = result.get("v") or 0
        
        # Calculate change from open/prev if available
        change = round(c - o, 2)
        change_pct = round((change / o * 100), 2) if o > 0 else 0.0

        return normalize_market_quote(
            symbol=clean_sym,
            name=clean_sym,
            exchange="NASDAQ/NYSE",
            asset_type="STOCK",
            price=c,
            change=change,
            change_pct=change_pct,
            volume=int(v),
            freshness=DataFreshness.DELAYED if res.get("status") == "DELAYED" else DataFreshness.REALTIME,
            source="Polygon.io",
            currency="USD",
            open_price=o,
            high_price=h,
            low_price=l,
            prev_close=o
        )

    def get_candles(self, symbol: str, interval: str = "1d", range_period: str = "1mo") -> Dict[str, Any]:
        clean_sym = symbol.upper().replace(".NS", "").replace(".BO", "").strip()
        
        if not self.api_key:
            return {
                "symbol": clean_sym,
                "range": range_period,
                "interval": interval,
                "freshness": DataFreshness.UNAVAILABLE.value,
                "observations": [],
                "message": "Polygon API key not configured."
            }

        # Calculate date range
        now = datetime.now(timezone.utc)
        to_date = now.strftime("%Y-%m-%d")
        
        days_map = {
            "1d": 2,
            "5d": 7,
            "1mo": 35,
            "3mo": 95,
            "6mo": 185,
            "1y": 370,
            "3y": 1100,
            "5y": 1830,
            "10y": 3660,
            "max": 5000
        }
        days_back = days_map.get(range_period.lower(), 35)
        from_date = (now - timedelta(days=days_back)).strftime("%Y-%m-%d")

        timespan = "day" if interval in ["1d", "d"] else "hour" if "h" in interval else "minute"
        multiplier = 1

        res = self._make_request(
            f"/v2/aggs/ticker/{clean_sym}/range/{multiplier}/{timespan}/{from_date}/{to_date}",
            {"adjusted": "true", "sort": "asc", "limit": "5000"}
        )

        if not res or not res.get("results"):
            return {
                "symbol": clean_sym,
                "range": range_period,
                "interval": interval,
                "freshness": DataFreshness.UNAVAILABLE.value,
                "observations": [],
                "message": "No candle data returned by Polygon."
            }

        observations = []
        for bar in res["results"]:
            ts_ms = bar.get("t")
            if not ts_ms:
                continue
            dt = datetime.fromtimestamp(ts_ms / 1000.0, tz=timezone.utc)
            c = bar.get("c") or 0.0
            observations.append({
                "date": dt.strftime("%Y-%m-%d"),
                "timestamp": dt.isoformat(),
                "open": round(float(bar.get("o") or c), 2),
                "high": round(float(bar.get("h") or c), 2),
                "low": round(float(bar.get("l") or c), 2),
                "close": round(float(c), 2),
                "volume": int(bar.get("v") or 0)
            })

        return {
            "symbol": clean_sym,
            "range": range_period,
            "interval": interval,
            "source": "Polygon.io",
            "freshness": DataFreshness.HISTORICAL.value,
            "observations": observations
        }

    def get_fundamentals(self, symbol: str) -> Dict[str, Any]:
        clean_sym = symbol.upper().strip()
        if not self.api_key:
            return {"symbol": clean_sym, "freshness": DataFreshness.UNAVAILABLE.value}

        res = self._make_request(f"/v3/reference/tickers/{clean_sym}")
        if not res or not res.get("results"):
            return {"symbol": clean_sym, "freshness": DataFreshness.UNAVAILABLE.value}

        data = res["results"]
        return {
            "symbol": clean_sym,
            "name": data.get("name"),
            "marketCap": data.get("market_cap"),
            "sector": data.get("sic_description"),
            "description": data.get("description"),
            "homepage": data.get("homepage_url"),
            "sharesOutstanding": data.get("weighted_shares_outstanding"),
            "freshness": DataFreshness.LATEST_AVAILABLE.value,
            "source": "Polygon.io"
        }

    def get_instrument_metadata(self, symbol: str) -> Dict[str, Any]:
        return self.get_fundamentals(symbol)
