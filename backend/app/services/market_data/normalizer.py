from datetime import datetime, timezone, timedelta
from typing import Dict, Any, Optional
from app.services.market_data.freshness import DataFreshness

def format_ist_timestamp(dt: Optional[datetime] = None) -> str:
    """Formats current or given datetime into readable IST format (e.g. 26 Aug 2026, 10:31 AM IST)."""
    if not dt:
        dt = datetime.now(timezone.utc)
    ist_dt = dt + timedelta(hours=5, minutes=30)
    return ist_dt.strftime("%d %b %Y, %I:%M:%S %p IST")

def normalize_market_quote(
    symbol: str,
    name: str,
    exchange: str,
    asset_type: str,
    price: float,
    change: float,
    change_pct: float,
    volume: int,
    freshness: DataFreshness,
    source: str,
    currency: str = "INR",
    open_price: Optional[float] = None,
    high_price: Optional[float] = None,
    low_price: Optional[float] = None,
    prev_close: Optional[float] = None,
    market_status: str = "OPEN",
    nav_date: Optional[str] = None,
    raw_timestamp: Optional[str] = None
) -> Dict[str, Any]:
    """
    Standard canonical internal schema for all SmartVest market quotes.
    """
    now_utc = datetime.now(timezone.utc)
    ts_iso = raw_timestamp or now_utc.isoformat()
    as_of = format_ist_timestamp(now_utc)
    
    return {
        "symbol": symbol,
        "name": name,
        "exchange": exchange,
        "assetType": asset_type,
        "price": round(float(price), 2),
        "currency": currency,
        "change": round(float(change), 2),
        "changePct": round(float(change_pct), 2),
        "volume": int(volume),
        "open": round(float(open_price), 2) if open_price is not None else None,
        "high": round(float(high_price), 2) if high_price is not None else None,
        "low": round(float(low_price), 2) if low_price is not None else None,
        "prevClose": round(float(prev_close), 2) if prev_close is not None else None,
        "timestamp": ts_iso,
        "marketStatus": market_status,
        "freshness": freshness.value,
        "source": source,
        "asOf": as_of,
        "navDate": nav_date
    }

def create_unavailable_quote(symbol: str, message: str = "Live market data is not configured for this instrument.") -> Dict[str, Any]:
    """Creates a strictly typed unavailable response with zero fake numbers."""
    now_utc = datetime.now(timezone.utc)
    return {
        "symbol": symbol,
        "name": symbol,
        "exchange": "UNKNOWN",
        "assetType": "UNKNOWN",
        "price": None,
        "currency": "INR",
        "change": None,
        "changePct": None,
        "volume": None,
        "timestamp": now_utc.isoformat(),
        "marketStatus": "UNKNOWN",
        "freshness": DataFreshness.UNAVAILABLE.value,
        "source": None,
        "asOf": format_ist_timestamp(now_utc),
        "message": message
    }
