import yfinance as yf
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from app.core.config import settings
from app.services.market_data.base import BaseMarketDataProvider, ProviderCapabilities
from app.services.market_data.freshness import DataFreshness
from app.services.market_data.normalizer import normalize_market_quote, create_unavailable_quote
from app.services.market_data.validator import validate_quote_data
from app.services.market_data.market_hours import get_indian_market_status
from app.services.market_data.cache import market_cache
from app.services.market_data.yahoo_client import fetch_yahoo_chart_data, parse_yahoo_chart_candles, parse_yahoo_chart_quote

# Canonical symbol mapping for India
INDIA_SYMBOL_MAP = {
    "NIFTY 50": "^NSEI",
    "NIFTY50": "^NSEI",
    "^NSEI": "^NSEI",
    "SENSEX": "^BSESN",
    "^BSESN": "^BSESN",
    "BANKNIFTY": "^NSEBANK",
    "^NSEBANK": "^NSEBANK",
    "NIFTY IT": "^CNXIT",
    "^CNXIT": "^CNXIT",
    "NIFTY AUTO": "^CNXAUTO",
    "NIFTY MIDCAP": "NIFTY_MIDCAP_100.NS",
    "RELIANCE": "RELIANCE.NS",
    "RELIANCE.NS": "RELIANCE.NS",
    "TCS": "TCS.NS",
    "TCS.NS": "TCS.NS",
    "HDFCBANK": "HDFCBANK.NS",
    "HDFCBANK.NS": "HDFCBANK.NS",
    "INFY": "INFY.NS",
    "INFY.NS": "INFY.NS",
    "TATAMOTORS": "TATAMOTORS.NS",
    "TATAMOTORS.NS": "TATAMOTORS.NS",
    "TATASTEEL": "TATASTEEL.NS",
    "TATASTEEL.NS": "TATASTEEL.NS",
    "WIPRO": "WIPRO.NS",
    "WIPRO.NS": "WIPRO.NS",
    "ICICIBANK": "ICICIBANK.NS",
    "ICICIBANK.NS": "ICICIBANK.NS",
    "SBIN": "SBIN.NS",
    "SBIN.NS": "SBIN.NS"
}

class IndianEquitiesProvider(BaseMarketDataProvider):
    """
    Provider adapter for Indian Equities and Market Indices (NSE / BSE).
    Enforces strict role separation:
    - If authorized NSE real-time provider with valid API key is present -> REALTIME
    - Default/Fallback Yahoo/NSE feed -> Strictly DELAYED (15m delayed), never REALTIME.
    """
    def __init__(self):
        provider_name = settings.INDIA_MARKET_DATA_PROVIDER.lower() if settings.INDIA_MARKET_DATA_PROVIDER else "yfinance"
        has_api_key = bool(settings.INDIA_MARKET_DATA_API_KEY and len(settings.INDIA_MARKET_DATA_API_KEY.strip()) > 0)
        
        is_authorized_rt = provider_name in ["truedata", "globaldatafeeds", "nse_direct", "authorized_feed"] and has_api_key

        super().__init__(
            name=f"NSE Authorized Feed ({provider_name})" if is_authorized_rt else "Yahoo Finance / NSE Delayed Feed",
            capabilities=ProviderCapabilities(
                name="Indian Equities Provider",
                realtime=is_authorized_rt,
                delayed=True,
                historical=True,
                mutual_funds_nav=False,
                fundamentals=True,
                commercial_display=True,
                api_key_required=is_authorized_rt,
                is_configured=True,
                entitlement_verified=is_authorized_rt
            )
        )

    def resolve_symbol(self, symbol: str) -> str:
        s_upper = symbol.upper().strip()
        return INDIA_SYMBOL_MAP.get(s_upper, s_upper if "." in s_upper or "^" in s_upper else f"{s_upper}.NS")

    def get_quote(self, symbol: str) -> Dict[str, Any]:
        canonical_sym = symbol.upper().strip()
        yf_sym = self.resolve_symbol(canonical_sym)
        cache_key = f"quote:india:{yf_sym}"

        # 1. Check Cache
        cached = market_cache.get(cache_key, allow_stale=False)
        if cached:
            return cached

        m_status = get_indian_market_status()

        # 2. Try Direct Fast Yahoo Chart Snapshot
        try:
            chart_raw = fetch_yahoo_chart_data(yf_sym, range_period="5d", interval="1d", timeout=4)
            if chart_raw:
                q_snap = parse_yahoo_chart_quote(chart_raw)
                if q_snap and q_snap.get("price") is not None:
                    # Strict freshness classification based on verified runtime entitlement
                    if self.capabilities.entitlement_verified and self.capabilities.realtime and m_status.get("status") == "OPEN":
                        freshness = DataFreshness.REALTIME
                        source_label = self.name
                    else:
                        freshness = DataFreshness.DELAYED
                        source_label = "NSE / Yahoo Finance Fallback (15m Delayed)"

                    quote = normalize_market_quote(
                        symbol=canonical_sym,
                        name=q_snap.get("name") or canonical_sym,
                        exchange="NSE",
                        asset_type="INDEX" if yf_sym.startswith("^") else "EQUITY",
                        price=q_snap["price"],
                        change=q_snap["change"],
                        change_pct=q_snap["change_pct"],
                        volume=q_snap["volume"],
                        open_price=q_snap["open"],
                        high_price=q_snap["high"],
                        low_price=q_snap["low"],
                        prev_close=q_snap["prev_close"],
                        currency="INR",
                        freshness=freshness,
                        source=source_label,
                        market_status=m_status.get("status", "OPEN")
                    )
                    valid, _ = validate_quote_data(quote)
                    if valid:
                        market_cache.set(cache_key, quote, ttl_seconds=30)
                        return quote
        except Exception:
            pass

        # 3. Fallback to yfinance ticker
        try:
            ticker = yf.Ticker(yf_sym)
            hist = ticker.history(period="5d", interval="1d")
            
            if not hist.empty and len(hist) >= 1:
                close_prices = hist['Close'].tolist()
                volumes = hist['Volume'].tolist()
                opens = hist['Open'].tolist()
                highs = hist['High'].tolist()
                lows = hist['Low'].tolist()

                current_price = float(close_prices[-1])
                prev_close = float(close_prices[-2]) if len(close_prices) > 1 else current_price
                change = current_price - prev_close
                change_pct = (change / prev_close * 100.0) if prev_close > 0 else 0.0
                volume = int(volumes[-1]) if volumes else 0
                open_p = float(opens[-1]) if opens else current_price
                high_p = float(highs[-1]) if highs else current_price
                low_p = float(lows[-1]) if lows else current_price

                info = ticker.info or {}
                name = info.get("shortName") or info.get("longName") or canonical_sym

                if self.capabilities.entitlement_verified and self.capabilities.realtime and m_status.get("status") == "OPEN":
                    freshness = DataFreshness.REALTIME
                    source_label = self.name
                else:
                    freshness = DataFreshness.DELAYED
                    source_label = "NSE / Yahoo Finance Fallback (15m Delayed)"

                quote = normalize_market_quote(
                    symbol=canonical_sym,
                    name=name,
                    exchange="NSE",
                    asset_type="INDEX" if yf_sym.startswith("^") else "EQUITY",
                    price=current_price,
                    change=change,
                    change_pct=change_pct,
                    volume=volume,
                    open_price=open_p,
                    high_price=high_p,
                    low_price=low_p,
                    prev_close=prev_close,
                    currency="INR",
                    freshness=freshness,
                    source=source_label,
                    market_status=m_status.get("status", "OPEN")
                )

                valid, _ = validate_quote_data(quote)
                if valid:
                    market_cache.set(cache_key, quote, ttl_seconds=30)
                    return quote
        except Exception:
            pass

        # 4. Check Stale Cache Fallback
        stale = market_cache.get(cache_key, allow_stale=True)
        if stale:
            stale["freshness"] = DataFreshness.STALE.value
            return stale

        # 5. Return explicit unavailable
        return create_unavailable_quote(canonical_sym, "Live NSE quote temporarily unavailable from data feed.")

    def get_candles(self, symbol: str, interval: str = "1d", range_period: str = "1mo") -> Dict[str, Any]:
        canonical_sym = symbol.upper().strip()
        yf_sym = self.resolve_symbol(canonical_sym)
        r_clean = range_period.lower().strip()
        if r_clean in ["1m", "30d"]:
            r_clean = "1mo"
        elif r_clean in ["3m", "90d"]:
            r_clean = "3mo"
        elif r_clean in ["6m", "180d"]:
            r_clean = "6mo"
        elif r_clean in ["12m", "365d"]:
            r_clean = "1y"
            
        cache_key = f"candles:india:{yf_sym}:{interval}:{r_clean}"

        cached = market_cache.get(cache_key, allow_stale=False)
        if cached:
            return cached

        # 1. Try Direct Fast Yahoo Chart Fetch
        try:
            chart_raw = fetch_yahoo_chart_data(yf_sym, range_period=r_clean, interval=interval, timeout=6)
            if chart_raw:
                res = parse_yahoo_chart_candles(
                    chart_raw, 
                    canonical_symbol=canonical_sym, 
                    range_period=range_period, 
                    interval=interval, 
                    source_label="NSE Historical Feed"
                )
                if res.get("observations") and len(res["observations"]) >= 2:
                    market_cache.set(cache_key, res, ttl_seconds=300)
                    return res
        except Exception:
            pass

        # 2. Fallback to yfinance ticker
        try:
            int_clean = "1wk" if r_clean in ["3y", "5y", "max"] and interval == "1d" else interval
            ticker = yf.Ticker(yf_sym)
            hist = ticker.history(period=r_clean, interval=int_clean)
            
            if not hist.empty and len(hist) >= 2:
                observations = []
                for idx, row in hist.iterrows():
                    dt_str = idx.strftime("%Y-%m-%d") if hasattr(idx, 'strftime') else str(idx)[:10]
                    c = round(float(row['Close']), 2)
                    observations.append({
                        "date": dt_str,
                        "timestamp": dt_str,
                        "open": round(float(row['Open']), 2),
                        "high": round(float(row['High']), 2),
                        "low": round(float(row['Low']), 2),
                        "close": c,
                        "nav": c,
                        "volume": int(row['Volume'])
                    })

                res = {
                    "symbol": canonical_sym,
                    "range": range_period,
                    "interval": interval,
                    "source": "NSE Historical Feed",
                    "freshness": DataFreshness.HISTORICAL.value,
                    "disclaimer": "Past performance does not guarantee future results.",
                    "observations": observations
                }
                market_cache.set(cache_key, res, ttl_seconds=300)
                return res
        except Exception:
            pass

        # 3. Check Stale Cache
        stale = market_cache.get(cache_key, allow_stale=True)
        if stale and stale.get("observations"):
            stale["freshness"] = DataFreshness.STALE.value
            return stale

        return {
            "symbol": canonical_sym,
            "range": range_period,
            "interval": interval,
            "source": "NSE Historical Feed",
            "freshness": DataFreshness.UNAVAILABLE.value,
            "observations": [],
            "message": "Historical series unavailable."
        }

    def get_fundamentals(self, symbol: str) -> Dict[str, Any]:
        canonical_sym = symbol.upper().strip()
        yf_sym = self.resolve_symbol(canonical_sym)
        cache_key = f"fund:india:{yf_sym}"

        cached = market_cache.get(cache_key, allow_stale=False)
        if cached:
            return cached

        try:
            ticker = yf.Ticker(yf_sym)
            info = ticker.info or {}
            res = {
                "symbol": canonical_sym,
                "name": info.get("shortName") or canonical_sym,
                "exchange": "NSE",
                "marketCap": info.get("marketCap"),
                "peRatio": round(float(info.get("trailingPE", 0)), 2) if info.get("trailingPE") else None,
                "pbRatio": round(float(info.get("priceToBook", 0)), 2) if info.get("priceToBook") else None,
                "eps": round(float(info.get("trailingEps", 0)), 2) if info.get("trailingEps") else None,
                "dividendYield": round(float(info.get("dividendYield", 0) * 100), 2) if info.get("dividendYield") else None,
                "fiftyTwoWeekHigh": info.get("fiftyTwoWeekHigh"),
                "fiftyTwoWeekLow": info.get("fiftyTwoWeekLow"),
                "source": "Fundamentals Feed",
                "freshness": DataFreshness.LATEST_AVAILABLE.value
            }
            market_cache.set(cache_key, res, ttl_seconds=3600)
            return res
        except Exception:
            return {"symbol": canonical_sym, "freshness": DataFreshness.UNAVAILABLE.value, "message": "Fundamentals unavailable"}

    def get_instrument_metadata(self, symbol: str) -> Dict[str, Any]:
        canonical_sym = symbol.upper().strip()
        return {
            "symbol": canonical_sym,
            "exchange": "NSE",
            "country": "IN",
            "currency": "INR",
            "assetType": "INDEX" if canonical_sym.startswith("NIFTY") or canonical_sym == "SENSEX" else "EQUITY"
        }
