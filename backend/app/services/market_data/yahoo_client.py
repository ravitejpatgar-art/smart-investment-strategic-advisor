import urllib.request
import json
import logging
from typing import Dict, Any, Optional, List, Tuple
from datetime import datetime, timezone

logger = logging.getLogger(__name__)

USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"

def fetch_yahoo_chart_data(symbol: str, range_period: str = "1mo", interval: str = "1d", timeout: int = 6) -> Optional[Dict[str, Any]]:
    """
    Directly queries Yahoo Finance Chart API (v8) with resilient fallbacks across query1 and query2 hosts.
    Returns the parsed JSON response dict or None.
    """
    hosts = ["query1.finance.yahoo.com", "query2.finance.yahoo.com"]
    
    # Clean range and interval
    r = range_period.lower().strip()
    if r in ["1m", "30d"]:
        r = "1mo"
    elif r in ["3m", "90d"]:
        r = "3mo"
    elif r in ["6m", "180d"]:
        r = "6mo"
    elif r in ["12m", "365d"]:
        r = "1y"
        
    i = interval.lower().strip()
    if i in ["d", "daily"]:
        i = "1d"
    elif i in ["w", "weekly"]:
        i = "1wk"
    elif i in ["m", "monthly"]:
        i = "1mo"

    for host in hosts:
        url = f"https://{host}/v8/finance/chart/{symbol}?range={r}&interval={i}&includePrePost=false"
        try:
            req = urllib.request.Request(
                url,
                headers={
                    "User-Agent": USER_AGENT,
                    "Accept": "application/json",
                    "Accept-Language": "en-US,en;q=0.9"
                }
            )
            with urllib.request.urlopen(req, timeout=timeout) as response:
                if response.status == 200:
                    data = json.loads(response.read().decode("utf-8"))
                    chart = data.get("chart", {})
                    results = chart.get("result", [])
                    if results and len(results) > 0:
                        return results[0]
        except Exception as e:
            logger.warning(f"Yahoo chart fetch attempt failed on {host} for {symbol}: {e}")
            continue

    return None

def parse_yahoo_chart_candles(chart_result: Dict[str, Any], canonical_symbol: str, range_period: str, interval: str, source_label: str = "NSE / Yahoo Finance") -> Dict[str, Any]:
    """
    Parses Yahoo chart result into SmartVest canonical candles schema.
    Strict validation: ascending timestamps, non-null numeric prices, deduplication.
    """
    from app.services.market_data.freshness import DataFreshness

    timestamps = chart_result.get("timestamp", [])
    indicators = chart_result.get("indicators", {}).get("quote", [{}])[0]
    
    opens = indicators.get("open", [])
    highs = indicators.get("high", [])
    lows = indicators.get("low", [])
    closes = indicators.get("close", [])
    volumes = indicators.get("volume", [])

    observations = []
    seen_dates = set()

    for idx, ts in enumerate(timestamps):
        if idx >= len(closes):
            break
        c = closes[idx]
        if c is None:
            continue
        try:
            c_val = round(float(c), 2)
            if c_val <= 0:
                continue
            
            # Format date ISO YYYY-MM-DD
            dt = datetime.fromtimestamp(ts, tz=timezone.utc)
            date_str = dt.strftime("%Y-%m-%d")
            
            if date_str in seen_dates:
                continue
            seen_dates.add(date_str)

            o_val = round(float(opens[idx]), 2) if idx < len(opens) and opens[idx] is not None else c_val
            h_val = round(float(highs[idx]), 2) if idx < len(highs) and highs[idx] is not None else c_val
            l_val = round(float(lows[idx]), 2) if idx < len(lows) and lows[idx] is not None else c_val
            v_val = int(volumes[idx]) if idx < len(volumes) and volumes[idx] is not None else 0

            observations.append({
                "date": date_str,
                "timestamp": date_str,
                "open": o_val,
                "high": h_val,
                "low": l_val,
                "close": c_val,
                "nav": c_val,
                "volume": v_val
            })
        except Exception:
            continue

    if len(observations) < 2:
        return {
            "symbol": canonical_symbol,
            "range": range_period,
            "interval": interval,
            "freshness": DataFreshness.UNAVAILABLE.value,
            "source": source_label,
            "observations": [],
            "message": "Historical series contains insufficient observations."
        }

    return {
        "symbol": canonical_symbol,
        "range": range_period,
        "interval": interval,
        "source": source_label,
        "freshness": DataFreshness.HISTORICAL.value,
        "disclaimer": "Past performance does not guarantee future results.",
        "observations": observations
    }

def parse_yahoo_chart_quote(chart_result: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """
    Extracts latest OHLCV quote snapshot from chart result.
    """
    meta = chart_result.get("meta", {})
    timestamps = chart_result.get("timestamp", [])
    indicators = chart_result.get("indicators", {}).get("quote", [{}])[0]

    current_price = meta.get("regularMarketPrice")
    prev_close = meta.get("chartPreviousClose") or meta.get("previousClose")
    
    closes = [c for c in indicators.get("close", []) if c is not None]
    opens = [o for o in indicators.get("open", []) if o is not None]
    highs = [h for h in indicators.get("high", []) if h is not None]
    lows = [l for l in indicators.get("low", []) if l is not None]
    volumes = [v for v in indicators.get("volume", []) if v is not None]

    if current_price is None and closes:
        current_price = closes[-1]
    if prev_close is None and len(closes) > 1:
        prev_close = closes[-2]
    elif prev_close is None:
        prev_close = current_price

    if current_price is None:
        return None

    change = current_price - prev_close if prev_close else 0.0
    change_pct = (change / prev_close * 100.0) if prev_close and prev_close > 0 else 0.0

    return {
        "price": float(current_price),
        "prev_close": float(prev_close) if prev_close else float(current_price),
        "change": float(change),
        "change_pct": float(change_pct),
        "open": float(opens[-1]) if opens else float(current_price),
        "high": float(highs[-1]) if highs else float(current_price),
        "low": float(lows[-1]) if lows else float(current_price),
        "volume": int(volumes[-1]) if volumes else int(meta.get("regularMarketVolume", 0)),
        "currency": meta.get("currency", "INR"),
        "name": meta.get("shortName") or meta.get("longName") or meta.get("symbol", "")
    }
