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

class AlphaVantageProvider(BaseMarketDataProvider):
    """
    Alpha Vantage REST API adapter for US & international equities, commodities, and indicators.
    """
    BASE_URL = "https://www.alphavantage.co/query"

    def __init__(self, api_key: Optional[str] = None):
        key = api_key or getattr(settings, "ALPHAVANTAGE_API_KEY", "") or getattr(settings, "ALPHAVANTAGE_API_KEY_BACKUP", "") or getattr(settings, "MARKET_DATA_API_KEY", "") or getattr(settings, "MARKET_DATA_API_KEY_BACKUP", "")
        capabilities = ProviderCapabilities(
            name="AlphaVantage",
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
        super().__init__("AlphaVantage", capabilities)
        self.api_key = key

    def _make_request(self, params: Dict[str, str], timeout: int = 6) -> Optional[Dict[str, Any]]:
        if not self.api_key:
            return None
        
        qp = params.copy()
        qp["apikey"] = self.api_key
        url = f"{self.BASE_URL}?{urllib.parse.urlencode(qp)}"

        try:
            req = urllib.request.Request(
                url,
                headers={"User-Agent": "SmartVest/1.0", "Accept": "application/json"}
            )
            with urllib.request.urlopen(req, timeout=timeout) as resp:
                if resp.status == 200:
                    data = json.loads(resp.read().decode("utf-8"))
                    if "Note" in data or "Information" in data:
                        logger.warning(f"AlphaVantage rate limit or info notice: {data}")
                        return None
                    return data
        except Exception as e:
            logger.warning(f"AlphaVantage request failed: {e}")
        return None

    def get_quote(self, symbol: str) -> Dict[str, Any]:
        clean_sym = symbol.upper().strip()
        if not self.api_key:
            return create_unavailable_quote(clean_sym, message="Alpha Vantage API key not configured.")

        res = self._make_request({"function": "GLOBAL_QUOTE", "symbol": clean_sym})
        if not res or "Global Quote" not in res:
            return create_unavailable_quote(clean_sym, message="Quote not found on Alpha Vantage.")

        gq = res["Global Quote"]
        if not gq.get("05. price"):
            return create_unavailable_quote(clean_sym, message="Empty quote on Alpha Vantage.")

        try:
            c = float(gq.get("05. price") or 0.0)
            o = float(gq.get("02. open") or c)
            h = float(gq.get("03. high") or c)
            l = float(gq.get("04. low") or c)
            pc = float(gq.get("08. previous close") or o)
            ch = float(gq.get("09. change") or (c - pc))
            raw_pct = str(gq.get("10. change percent", "0%")).replace("%", "")
            ch_pct = float(raw_pct) if raw_pct else 0.0
            vol = int(gq.get("06. volume") or 0)

            return normalize_market_quote(
                symbol=clean_sym,
                name=clean_sym,
                exchange="GLOBAL",
                asset_type="STOCK",
                price=c,
                change=ch,
                change_pct=ch_pct,
                volume=vol,
                freshness=DataFreshness.LATEST_AVAILABLE,
                source="Alpha Vantage",
                currency="USD",
                open_price=o,
                high_price=h,
                low_price=l,
                prev_close=pc
            )
        except Exception as e:
            logger.warning(f"Error parsing AlphaVantage quote: {e}")
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
                "message": "Alpha Vantage API key not configured."
            }

        res = self._make_request({
            "function": "TIME_SERIES_DAILY",
            "symbol": clean_sym,
            "outputsize": "full" if range_period in ["1y", "3y", "5y", "max"] else "compact"
        })

        if not res or "Time Series (Daily)" not in res:
            return {
                "symbol": clean_sym,
                "range": range_period,
                "interval": interval,
                "freshness": DataFreshness.UNAVAILABLE.value,
                "observations": [],
                "message": "No historical data from Alpha Vantage."
            }

        ts_data = res["Time Series (Daily)"]
        sorted_dates = sorted(ts_data.keys())

        observations = []
        for d in sorted_dates:
            bar = ts_data[d]
            try:
                c = float(bar.get("4. close") or 0.0)
                observations.append({
                    "date": d,
                    "timestamp": d,
                    "open": round(float(bar.get("1. open") or c), 2),
                    "high": round(float(bar.get("2. high") or c), 2),
                    "low": round(float(bar.get("3. low") or c), 2),
                    "close": round(c, 2),
                    "volume": int(bar.get("5. volume") or 0)
                })
            except Exception:
                continue

        return {
            "symbol": clean_sym,
            "range": range_period,
            "interval": interval,
            "source": "Alpha Vantage",
            "freshness": DataFreshness.HISTORICAL.value,
            "observations": observations
        }

    def get_fundamentals(self, symbol: str) -> Dict[str, Any]:
        clean_sym = symbol.upper().strip()
        if not self.api_key:
            return {"symbol": clean_sym, "freshness": DataFreshness.UNAVAILABLE.value}

        res = self._make_request({"function": "OVERVIEW", "symbol": clean_sym})
        if not res or "Symbol" not in res:
            return {"symbol": clean_sym, "freshness": DataFreshness.UNAVAILABLE.value}

        return {
            "symbol": clean_sym,
            "name": res.get("Name"),
            "description": res.get("Description"),
            "exchange": res.get("Exchange"),
            "currency": res.get("Currency"),
            "sector": res.get("Sector"),
            "industry": res.get("Industry"),
            "marketCap": float(res.get("MarketCapitalization") or 0) or None,
            "peRatio": float(res.get("PERatio") or 0) or None,
            "pegRatio": float(res.get("PEGRatio") or 0) or None,
            "bookValue": float(res.get("BookValue") or 0) or None,
            "dividendYield": float(res.get("DividendYield") or 0) or None,
            "eps": float(res.get("EPS") or 0) or None,
            "beta": float(res.get("Beta") or 0) or None,
            "52WeekHigh": float(res.get("52WeekHigh") or 0) or None,
            "52WeekLow": float(res.get("52WeekLow") or 0) or None,
            "freshness": DataFreshness.LATEST_AVAILABLE.value,
            "source": "Alpha Vantage"
        }

    def get_instrument_metadata(self, symbol: str) -> Dict[str, Any]:
        return self.get_fundamentals(symbol)
