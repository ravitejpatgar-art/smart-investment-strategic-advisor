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

class FinnhubProvider(BaseMarketDataProvider):
    """
    Finnhub REST API adapter for US Equities and Global Market Data.
    Provides real-time quotes, basic financials, and candle data with automated fallback.
    """
    BASE_URL = "https://finnhub.io/api/v1"

    def __init__(self, api_key: Optional[str] = None):
        key = api_key or getattr(settings, "FINNHUB_API_KEY", "") or getattr(settings, "FINNHUB_API_KEY_BACKUP", "") or getattr(settings, "US_MARKET_DATA_API_KEY", "") or getattr(settings, "US_MARKET_DATA_API_KEY_BACKUP", "")
        capabilities = ProviderCapabilities(
            name="Finnhub",
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
        super().__init__("Finnhub", capabilities)
        self.api_key = key

    def _make_request(self, endpoint: str, params: Optional[Dict[str, str]] = None, timeout: int = 5) -> Optional[Dict[str, Any]]:
        if not self.api_key:
            logger.debug("[API_KEY_ISSUE] Finnhub API key not configured; skipping provider.")
            return None
        
        qp = params.copy() if params else {}
        qp["token"] = self.api_key
        url = f"{self.BASE_URL}{endpoint}?{urllib.parse.urlencode(qp)}"

        try:
            req = urllib.request.Request(
                url,
                headers={"User-Agent": "SmartVest/1.0", "Accept": "application/json"}
            )
            with urllib.request.urlopen(req, timeout=timeout) as resp:
                if resp.status == 200:
                    data = json.loads(resp.read().decode("utf-8"))
                    if isinstance(data, dict) and "error" in data:
                        logger.warning(f"[RATE_LIMIT/API_ERROR] Finnhub returned error: {data.get('error')}")
                        return None
                    return data
                elif resp.status == 429:
                    logger.warning("[RATE_LIMIT] Finnhub API rate limit reached (HTTP 429).")
                    return None
        except urllib.error.HTTPError as he:
            if he.code == 429:
                logger.warning("[RATE_LIMIT] Finnhub rate limited (HTTP 429).")
            elif he.code in (401, 403):
                logger.warning(f"[API_KEY_ISSUE] Finnhub authentication failed (HTTP {he.code}). Check API key.")
            elif he.code == 404:
                logger.warning(f"[INVALID_SYMBOL] Finnhub endpoint/symbol not found (HTTP 404): {endpoint}")
            else:
                logger.warning(f"[NETWORK_FAILURE] Finnhub HTTP error {he.code} for {endpoint}: {he.reason}")
        except Exception as e:
            logger.warning(f"[NETWORK_FAILURE] Finnhub connection failed for {endpoint}: {e}")
        return None

    def get_quote(self, symbol: str) -> Dict[str, Any]:
        s_clean = symbol.upper().strip()
        data = self._make_request("/quote", {"symbol": s_clean})
        if not data or data.get("c") is None or data.get("c") == 0:
            logger.info(f"[INVALID_SYMBOL] No valid quote data from Finnhub for symbol {s_clean}")
            return create_unavailable_quote(s_clean, message="Finnhub quote unavailable")

        c = float(data["c"])
        d = float(data.get("d", 0.0) or 0.0)
        dp = float(data.get("dp", 0.0) or 0.0)
        o = float(data.get("o", c) or c)
        h = float(data.get("h", c) or c)
        l = float(data.get("l", c) or c)
        pc = float(data.get("pc", c) or c)

        return normalize_market_quote(
            symbol=s_clean,
            name=s_clean,
            exchange="US_EXCHANGES",
            asset_type="STOCK",
            price=c,
            currency="USD",
            change=d,
            change_pct=dp,
            volume=0,
            open_price=o,
            high_price=h,
            low_price=l,
            prev_close=pc,
            freshness=DataFreshness.REALTIME if self.capabilities.realtime else DataFreshness.DELAYED,
            source="Finnhub Real-Time Feed"
        )

    def get_candles(self, symbol: str, interval: str = "1d", range_period: str = "1mo") -> Dict[str, Any]:
        s_clean = symbol.upper().strip()
        # Finnhub resolution mapping
        res_map = {"1d": "D", "1wk": "W", "1mo": "M", "1m": "1", "5m": "5", "15m": "15", "60m": "60"}
        resolution = res_map.get(interval, "D")

        now_ts = int(datetime.now(timezone.utc).timestamp())
        days_back = 30
        if "3mo" in range_period: days_back = 90
        elif "1y" in range_period: days_back = 365
        elif "3y" in range_period: days_back = 365 * 3
        elif "5y" in range_period: days_back = 365 * 5
        elif "10y" in range_period or "max" in range_period: days_back = 365 * 10

        from_ts = now_ts - (days_back * 86400)
        data = self._make_request("/stock/candle", {
            "symbol": s_clean,
            "resolution": resolution,
            "from": str(from_ts),
            "to": str(now_ts)
        })

        if not data or data.get("s") != "ok" or not data.get("t"):
            logger.info(f"[INVALID_SYMBOL] No candle observations from Finnhub for {s_clean}")
            return {
                "symbol": s_clean,
                "range": range_period,
                "interval": interval,
                "observations": [],
                "message": "Finnhub candle data unavailable"
            }

        timestamps = data.get("t", [])
        opens = data.get("o", [])
        highs = data.get("h", [])
        lows = data.get("l", [])
        closes = data.get("c", [])
        volumes = data.get("v", [])

        observations = []
        for i in range(len(timestamps)):
            d_iso = datetime.fromtimestamp(timestamps[i], timezone.utc).strftime("%Y-%m-%d")
            observations.append({
                "date": d_iso,
                "timestamp": d_iso,
                "open": round(float(opens[i]), 2) if i < len(opens) else 0.0,
                "high": round(float(highs[i]), 2) if i < len(highs) else 0.0,
                "low": round(float(lows[i]), 2) if i < len(lows) else 0.0,
                "close": round(float(closes[i]), 2) if i < len(closes) else 0.0,
                "volume": int(volumes[i]) if i < len(volumes) else 0
            })

        return {
            "symbol": s_clean,
            "range": range_period,
            "interval": interval,
            "source": "Finnhub Historical Feed",
            "freshness": DataFreshness.HISTORICAL,
            "observations": observations
        }

    def get_fundamentals(self, symbol: str) -> Dict[str, Any]:
        s_clean = symbol.upper().strip()
        data = self._make_request("/stock/metric", {"symbol": s_clean, "metric": "all"})
        if not data or "metric" not in data:
            return {
                "symbol": s_clean,
                "freshness": DataFreshness.LATEST_AVAILABLE,
                "source": "Finnhub"
            }
        metric = data.get("metric", {})
        return {
            "symbol": s_clean,
            "marketCap": metric.get("marketCapitalization"),
            "peRatio": metric.get("peNormalizedAnnual"),
            "pbRatio": metric.get("pbAnnual"),
            "eps": metric.get("epsNormalizedAnnual"),
            "dividendYield": metric.get("dividendYieldIndicatedAnnual"),
            "fiftyTwoWeekHigh": metric.get("52WeekHigh"),
            "fiftyTwoWeekLow": metric.get("52WeekLow"),
            "source": "Finnhub Metrics",
            "freshness": DataFreshness.LATEST_AVAILABLE,
            "asOf": datetime.now(timezone.utc).isoformat()
        }

    def get_instrument_metadata(self, symbol: str) -> Dict[str, Any]:
        s_clean = symbol.upper().strip()
        profile = self._make_request("/stock/profile2", {"symbol": s_clean})
        if not profile:
            return {
                "symbol": s_clean,
                "name": s_clean,
                "exchange": "US_EXCHANGES",
                "assetType": "STOCK",
                "currency": "USD"
            }
        return {
            "symbol": s_clean,
            "name": profile.get("name", s_clean),
            "exchange": profile.get("exchange", "US_EXCHANGES"),
            "assetType": "STOCK",
            "currency": profile.get("currency", "USD"),
            "isin": profile.get("isin"),
            "industry": profile.get("finnhubIndustry")
        }
