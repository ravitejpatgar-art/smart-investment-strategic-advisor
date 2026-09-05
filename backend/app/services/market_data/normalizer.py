from datetime import datetime, timezone, timedelta
from typing import Dict, Any, Optional, Tuple
from app.services.market_data.freshness import DataFreshness, sanitize_freshness_state

def format_ist_timestamp(dt: Optional[datetime] = None) -> str:
    """Formats current or given datetime into readable IST format (e.g. 26 Aug 2026, 10:31 AM IST)."""
    if not dt:
        dt = datetime.now(timezone.utc)
    ist_dt = dt + timedelta(hours=5, minutes=30)
    return ist_dt.strftime("%d %b %Y, %I:%M:%S %p IST")

# Canonical Symbol Resolution Map
INDIA_STOCK_MAPPINGS = {
    "RELIANCE": "RELIANCE.NS",
    "TCS": "TCS.NS",
    "INFY": "INFY.NS",
    "HDFCBANK": "HDFCBANK.NS",
    "ICICIBANK": "ICICIBANK.NS",
    "SBIN": "SBIN.NS",
    "TATAMOTORS": "TATAMOTORS.NS",
    "TATASTEEL": "TATASTEEL.NS",
    "WIPRO": "WIPRO.NS",
    "BHARTIARTL": "BHARTIARTL.NS",
    "ITC": "ITC.NS",
    "KOTAKBANK": "KOTAKBANK.NS",
    "LT": "LT.NS",
    "NIFTYBEES": "NIFTYBEES.NS",
    "JUNIORBEES": "JUNIORBEES.NS",
    "BANKBEES": "BANKBEES.NS",
    "GOLDBEES": "GOLDBEES.NS",
    "MON100": "MON100.NS"
}

INDEX_MAPPINGS = {
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
    "S&P 500": "^GSPC",
    "S&P500": "^GSPC",
    "SPX": "^GSPC",
    "NASDAQ": "^IXIC",
    "NASDAQ 100": "^NDX",
    "DOW JONES": "^DJI",
    "DOW": "^DJI"
}

def normalize_global_symbol(symbol: str) -> Dict[str, Any]:
    """
    Normalizes any input ticker, scheme code, or symbol string into its canonical representation,
    provider symbol, and recognized asset class.
    """
    s_raw = symbol.strip()
    s_upper = s_raw.upper()

    # 1. Mutual Fund Scheme Resolution (AMFI:122639, MF:122639, or numeric code)
    if s_upper.startswith("AMFI:"):
        code = s_raw[5:].strip()
        return {
            "canonical_symbol": f"AMFI:{code}",
            "provider_symbol": code,
            "asset_type": "MUTUAL_FUND",
            "market": "INDIA",
            "exchange": "AMFI",
            "scheme_code": code
        }
    if s_upper.startswith("MF:"):
        code = s_raw[3:].strip()
        return {
            "canonical_symbol": f"AMFI:{code}",
            "provider_symbol": code,
            "asset_type": "MUTUAL_FUND",
            "market": "INDIA",
            "exchange": "AMFI",
            "scheme_code": code
        }
    if s_raw.isdigit() and len(s_raw) >= 5:
        return {
            "canonical_symbol": f"AMFI:{s_raw}",
            "provider_symbol": s_raw,
            "asset_type": "MUTUAL_FUND",
            "market": "INDIA",
            "exchange": "AMFI",
            "scheme_code": s_raw
        }

    # 2. Indices
    if s_upper in INDEX_MAPPINGS:
        canonical = INDEX_MAPPINGS[s_upper]
        return {
            "canonical_symbol": canonical,
            "provider_symbol": canonical,
            "asset_type": "INDEX",
            "market": "INDIA" if "^NSE" in canonical or "^BSE" in canonical or "^CNX" in canonical else "US",
            "exchange": "NSE" if "^NSE" in canonical or "^CNX" in canonical else ("BSE" if "^BSE" in canonical else "INDEX"),
            "scheme_code": None
        }

    # 3. Indian Equities & ETFs
    if s_upper in INDIA_STOCK_MAPPINGS:
        canonical = INDIA_STOCK_MAPPINGS[s_upper]
        is_etf = "BEES" in canonical or "MON100" in canonical
        return {
            "canonical_symbol": canonical,
            "provider_symbol": canonical,
            "asset_type": "ETF" if is_etf else "STOCK",
            "market": "INDIA",
            "exchange": "NSE",
            "scheme_code": None
        }

    if s_upper.endswith(".NS") or s_upper.endswith(".BO"):
        is_etf = "BEES" in s_upper or "MON100" in s_upper
        exch = "NSE" if s_upper.endswith(".NS") else "BSE"
        return {
            "canonical_symbol": s_upper,
            "provider_symbol": s_upper,
            "asset_type": "ETF" if is_etf else "STOCK",
            "market": "INDIA",
            "exchange": exch,
            "scheme_code": None
        }

    # 4. Standard US / Global Equities & ETFs (e.g. AAPL, MSFT, SPY, QQQ)
    US_KNOWN_ETFS = {"SPY", "VOO", "QQQ", "VTI", "IVV", "IWM", "EEM", "GLD", "SLV"}
    is_us_etf = s_upper in US_KNOWN_ETFS or "ETF" in s_upper

    return {
        "canonical_symbol": s_upper,
        "provider_symbol": s_upper,
        "asset_type": "ETF" if is_us_etf else "STOCK",
        "market": "US",
        "exchange": "NASDAQ" if s_upper in ["AAPL", "MSFT", "GOOGL", "AMZN", "NVDA", "AMD", "TSLA", "META", "QQQ"] else "NYSE",
        "scheme_code": None
    }


def normalize_market_quote(
    symbol: str,
    name: str,
    exchange: str,
    asset_type: str,
    price: Optional[float],
    change: Optional[float] = None,
    change_pct: Optional[float] = None,
    volume: Optional[int] = None,
    freshness: Any = DataFreshness.LATEST_AVAILABLE,
    source: Optional[str] = "Market Feed",
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
    Preserves authentic provider fields without fabricating artificial numbers.
    """
    now_utc = datetime.now(timezone.utc)
    ts_iso = raw_timestamp or now_utc.isoformat()
    as_of = format_ist_timestamp(now_utc)
    
    freshness_str = freshness.value if hasattr(freshness, "value") else sanitize_freshness_state(str(freshness))

    p_val = round(float(price), 2) if price is not None else None
    c_val = round(float(change), 2) if change is not None else None
    cp_val = round(float(change_pct), 2) if change_pct is not None else None
    v_val = int(volume) if volume is not None else (0 if p_val is not None else None)
    
    pc_val = round(float(prev_close), 2) if prev_close is not None else None

    # For mutual funds, price IS the NAV
    is_mf = asset_type.upper() == "MUTUAL_FUND"

    return {
        "symbol": symbol,
        "name": name,
        "exchange": exchange,
        "assetType": asset_type,
        "price": p_val,
        "nav": p_val if is_mf else None,
        "currency": currency,
        "change": c_val,
        "changePct": cp_val,
        "volume": v_val,
        "open": round(float(open_price), 2) if open_price is not None else None,
        "high": round(float(high_price), 2) if high_price is not None else None,
        "low": round(float(low_price), 2) if low_price is not None else None,
        "prevClose": pc_val,
        "previousClose": pc_val,
        "timestamp": ts_iso,
        "marketStatus": market_status,
        "freshness": freshness_str,
        "source": source,
        "asOf": as_of,
        "navDate": nav_date
    }

def create_unavailable_quote(
    symbol: str,
    message: str = "Live market data is not configured for this instrument.",
    market_status: str = "UNKNOWN"
) -> Dict[str, Any]:
    """Creates a strictly typed unavailable response with zero fake numbers."""
    now_utc = datetime.now(timezone.utc)
    return {
        "symbol": symbol,
        "name": symbol,
        "exchange": "UNKNOWN",
        "assetType": "UNKNOWN",
        "price": None,
        "nav": None,
        "currency": "INR",
        "change": None,
        "changePct": None,
        "volume": None,
        "open": None,
        "high": None,
        "low": None,
        "prevClose": None,
        "previousClose": None,
        "timestamp": now_utc.isoformat(),
        "marketStatus": market_status,
        "freshness": DataFreshness.UNAVAILABLE.value,
        "source": None,
        "asOf": format_ist_timestamp(now_utc),
        "navDate": None,
        "message": message
    }
