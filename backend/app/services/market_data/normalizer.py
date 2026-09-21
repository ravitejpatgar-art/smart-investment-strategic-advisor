from datetime import datetime, timezone
from typing import Dict, Any, Optional, Tuple, Union, Set
from zoneinfo import ZoneInfo
import logging
from app.services.market_data.freshness import DataFreshness, sanitize_freshness_state

logger = logging.getLogger(__name__)

IST_ZONE = ZoneInfo("Asia/Kolkata")

def to_ist_datetime(dt_or_str: Optional[Union[datetime, str, int, float]] = None) -> datetime:
    """
    Parses datetime, ISO timestamp, or epoch into a timezone-aware Asia/Kolkata datetime.
    Never adds or subtracts hours manually.
    """
    if dt_or_str is None:
        return datetime.now(timezone.utc).astimezone(IST_ZONE)

    if isinstance(dt_or_str, (int, float)):
        sec = dt_or_str / 1000.0 if dt_or_str > 1e11 else float(dt_or_str)
        return datetime.fromtimestamp(sec, tz=timezone.utc).astimezone(IST_ZONE)

    if isinstance(dt_or_str, str):
        s = dt_or_str.strip()
        if not s:
            return datetime.now(timezone.utc).astimezone(IST_ZONE)
        if s.endswith("Z"):
            s = s[:-1] + "+00:00"
        try:
            dt = datetime.fromisoformat(s)
        except Exception:
            try:
                parsed = datetime.strptime(s, "%d-%b-%Y %H:%M:%S")
                return parsed.replace(tzinfo=IST_ZONE)
            except Exception:
                return datetime.now(timezone.utc).astimezone(IST_ZONE)
    elif isinstance(dt_or_str, datetime):
        dt = dt_or_str
    else:
        return datetime.now(timezone.utc).astimezone(IST_ZONE)

    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)

    return dt.astimezone(IST_ZONE)


def format_ist_timestamp(dt_or_str: Optional[Union[datetime, str, int, float]] = None) -> str:
    """
    Formats a datetime, ISO string, or timestamp into IST format:
    e.g. '18 Sep 2026, 03:58:33 PM IST'.
    Uses ZoneInfo('Asia/Kolkata') strictly.
    """
    ist_dt = to_ist_datetime(dt_or_str)
    return ist_dt.strftime("%d %b %Y, %I:%M:%S %p IST")

# Canonical Symbol Resolution Map
# Expanded Canonical Symbol Resolution Map for Indian Equities & ETFs
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
    "AXISBANK": "AXISBANK.NS",
    "BAJFINANCE": "BAJFINANCE.NS",
    "BAJAJFINSV": "BAJAJFINSV.NS",
    "MARUTI": "MARUTI.NS",
    "TITAN": "TITAN.NS",
    "SUNPHARMA": "SUNPHARMA.NS",
    "ULTRACEMCO": "ULTRACEMCO.NS",
    "ASIANPAINT": "ASIANPAINT.NS",
    "HCLTECH": "HCLTECH.NS",
    "NTPC": "NTPC.NS",
    "ONGC": "ONGC.NS",
    "POWERGRID": "POWERGRID.NS",
    "NESTLEIND": "NESTLEIND.NS",
    "JSWSTEEL": "JSWSTEEL.NS",
    "ADANIENT": "ADANIENT.NS",
    "ADANIPORTS": "ADANIPORTS.NS",
    "COALINDIA": "COALINDIA.NS",
    "BPCL": "BPCL.NS",
    "GRASIM": "GRASIM.NS",
    "CIPLA": "CIPLA.NS",
    "HEROMOTOCO": "HEROMOTOCO.NS",
    "EICHERMOT": "EICHERMOT.NS",
    "APOLLOHOSP": "APOLLOHOSP.NS",
    "DIVISLAB": "DIVISLAB.NS",
    "DRREDDY": "DRREDDY.NS",
    "HINDALCO": "HINDALCO.NS",
    "BRITANNIA": "BRITANNIA.NS",
    "TRENT": "TRENT.NS",
    "BEL": "BEL.NS",
    "HAL": "HAL.NS",
    "VBL": "VBL.NS",
    "ZOMATO": "ZOMATO.NS",
    "JIOFIN": "JIOFIN.NS",
    "NIFTYBEES": "NIFTYBEES.NS",
    "JUNIORBEES": "JUNIORBEES.NS",
    "BANKBEES": "BANKBEES.NS",
    "GOLDBEES": "GOLDBEES.NS",
    "MON100": "MON100.NS",
    "LIQUIDBEES": "LIQUIDBEES.NS",
    "SILVERBEES": "SILVERBEES.NS",
    "CPSEETF": "CPSEETF.NS",
    "MAFANG": "MAFANG.NS",
    "HDFCNIFTY": "HDFCNIFTY.NS",
    "SETFNIF50": "SETFNIF50.NS",
    "AUTOBEES": "AUTOBEES.NS",
    "PHARMABEES": "PHARMABEES.NS",
    "INFRABEES": "INFRABEES.NS"
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
    "DOW": "^DJI",
    "RUSSELL 2000": "^RUT",
    "RUSSELL2000": "^RUT",
    "RUSSELL": "^RUT",
    "^RUT": "^RUT"
}

# Known US Stocks that must NEVER receive or retain .NS or .BO suffix
US_KNOWN_STOCKS: Set[str] = {
    "META", "AAPL", "MSFT", "NVDA", "GOOGL", "GOOG", "AMZN", "TSLA", "NFLX", "AMD",
    "INTC", "CSCO", "ADBE", "CRM", "ORCL", "IBM", "QCOM", "TXN", "AVGO", "PYPL",
    "UBER", "ABNB", "PLTR", "SNOW", "COIN", "DIS", "NKE", "SBUX", "MCD", "WMT",
    "TGT", "COST", "HD", "LOW", "PG", "KO", "PEP", "JNJ", "PFE", "MRK", "ABBV",
    "UNH", "LLY", "V", "MA", "JPM", "BAC", "WFC", "C", "GS", "MS", "BRK.A", "BRK.B",
    "XOM", "CVX", "COP", "SLB", "EOG", "BA", "CAT", "GE", "HON", "UPS", "FDX"
}

# Known US ETFs that must NEVER receive or retain .NS or .BO suffix
US_KNOWN_ETFS: Set[str] = {
    "SPY", "QQQ", "VOO", "VTI", "IVV", "IWM", "EEM", "GLD", "SLV",
    "DIA", "XLF", "XLK", "XLE", "XLV", "XLI", "XLP", "XLU", "XLB", "XLRE", "XLC",
    "VUG", "VTV", "SCHD", "ARKK", "SMH", "SOXX", "TLT", "IEF", "SHY", "BND", "AGG"
}

ALL_US_SYMBOLS: Set[str] = US_KNOWN_STOCKS | US_KNOWN_ETFS


def normalize_symbol(symbol: str) -> str:
    """
    Returns the canonical ticker string for any given input symbol.
    Guarantees:
      - US stocks (META, AAPL, MSFT, NVDA, GOOGL, AMZN, TSLA, NFLX, AMD) NEVER become .NS
      - US ETFs (SPY, QQQ, VOO, VTI, IVV, IWM, EEM, GLD, SLV) NEVER become .NS
      - Indian stocks (RELIANCE, TCS, INFY, HDFCBANK, ICICIBANK) resolve to .NS
      - Any inadvertent .NS on US symbols (e.g. META.NS, SPY.NS) is stripped immediately.
    """
    if not symbol or not isinstance(symbol, str):
        return ""
    s_clean = symbol.strip().upper()

    # 1. Mutual Funds
    if s_clean.startswith("AMFI:"):
        return s_clean
    if s_clean.startswith("MF:"):
        return f"AMFI:{s_clean[3:].strip()}"
    if s_clean.isdigit() and len(s_clean) in (5, 6):
        return f"AMFI:{s_clean}"

    # 2. Indices
    if s_clean in INDEX_MAPPINGS:
        return INDEX_MAPPINGS[s_clean]

    # 3. Strip trailing exchange suffix to check base symbol
    base = s_clean[:-3] if s_clean.endswith((".NS", ".BO")) else s_clean

    # 4. Strict US Stock & ETF Protection
    if base in US_KNOWN_STOCKS or base in US_KNOWN_ETFS or base in ALL_US_SYMBOLS:
        return base

    # 5. Indian Equities & ETFs mappings
    if s_clean in INDIA_STOCK_MAPPINGS:
        return INDIA_STOCK_MAPPINGS[s_clean]
    if base in INDIA_STOCK_MAPPINGS:
        return INDIA_STOCK_MAPPINGS[base]

    # 6. Preserved Indian exchange suffix
    if s_clean.endswith((".NS", ".BO")):
        return s_clean

    # 7. Fallback: Check if recognized Indian database instrument
    try:
        from app.models.instrument import Instrument
        from app.core.database import SessionLocal
        with SessionLocal() as db:
            inst = db.query(Instrument).filter(
                (Instrument.symbol.ilike(s_clean)) |
                (Instrument.ticker.ilike(s_clean))
            ).first()
            if inst and inst.market == "INDIA":
                return inst.symbol or f"{s_clean}.NS"
            if inst and inst.market == "US":
                return inst.ticker or base
    except Exception:
        pass

    # 8. Unmapped symbols:
    # Standard 1-5 letter symbols without .NS are treated as US / Global symbols, NEVER appending .NS
    return s_clean


def normalize_global_symbol(symbol: str) -> Dict[str, Any]:
    """
    Normalizes any input ticker, scheme code, or symbol string into its canonical representation,
    provider symbol, recognized asset class, and market region.
    """
    s_raw = (symbol or "").strip()
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
    if s_raw.isdigit() and len(s_raw) in (5, 6):
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
        is_india_idx = "^NSE" in canonical or "^BSE" in canonical or "^CNX" in canonical
        return {
            "canonical_symbol": canonical,
            "provider_symbol": canonical,
            "asset_type": "INDEX",
            "market": "INDIA" if is_india_idx else "US",
            "exchange": "NSE" if "^NSE" in canonical or "^CNX" in canonical else ("BSE" if "^BSE" in canonical else "INDEX"),
            "scheme_code": None
        }

    # Strip exchange suffix for base identity check
    base = s_upper[:-3] if s_upper.endswith((".NS", ".BO")) else s_upper

    # 3. US Stocks Validation - Must NEVER receive or retain .NS or .BO suffix
    if base in US_KNOWN_STOCKS:
        return {
            "canonical_symbol": base,
            "provider_symbol": base,
            "asset_type": "STOCK",
            "market": "US",
            "exchange": "NASDAQ" if base in ["AAPL", "MSFT", "GOOGL", "GOOG", "AMZN", "NVDA", "AMD", "TSLA", "META", "NFLX", "INTC", "CSCO", "ADBE", "CRM", "PYPL", "ABNB"] else "NYSE",
            "scheme_code": None
        }

    # 4. US ETFs Validation - Must NEVER receive or retain .NS or .BO suffix
    if base in US_KNOWN_ETFS:
        return {
            "canonical_symbol": base,
            "provider_symbol": base,
            "asset_type": "ETF",
            "market": "US",
            "exchange": "NASDAQ" if base in ["QQQ"] else "NYSE",
            "scheme_code": None
        }

    # 5. Indian Equities & ETFs (from canonical mapping dictionary)
    if s_upper in INDIA_STOCK_MAPPINGS or base in INDIA_STOCK_MAPPINGS:
        canonical = INDIA_STOCK_MAPPINGS.get(s_upper) or INDIA_STOCK_MAPPINGS.get(base)
        is_etf = "BEES" in canonical or "MON100" in canonical or "ETF" in canonical
        return {
            "canonical_symbol": canonical,
            "provider_symbol": canonical,
            "asset_type": "ETF" if is_etf else "STOCK",
            "market": "INDIA",
            "exchange": "NSE",
            "scheme_code": None
        }

    # 6. Explicit .NS or .BO suffix where base is not a US asset
    if s_upper.endswith(".NS") or s_upper.endswith(".BO"):
        is_etf = "BEES" in s_upper or "MON100" in s_upper or "ETF" in s_upper
        exch = "NSE" if s_upper.endswith(".NS") else "BSE"
        return {
            "canonical_symbol": s_upper,
            "provider_symbol": s_upper,
            "asset_type": "ETF" if is_etf else "STOCK",
            "market": "INDIA",
            "exchange": exch,
            "scheme_code": None
        }

    # 7. Check database instrument master for India market listing before defaulting to US
    try:
        from app.models.instrument import Instrument
        from app.core.database import SessionLocal
        with SessionLocal() as db:
            inst = db.query(Instrument).filter(
                (Instrument.symbol.ilike(s_upper)) |
                (Instrument.ticker.ilike(s_upper))
            ).first()
            if inst and inst.market == "INDIA":
                is_etf = inst.asset_type == "ETF"
                return {
                    "canonical_symbol": inst.symbol,
                    "provider_symbol": inst.provider_symbol or inst.symbol,
                    "asset_type": inst.asset_type,
                    "market": "INDIA",
                    "exchange": inst.exchange or "NSE",
                    "scheme_code": inst.scheme_code
                }
            if inst and inst.market == "US":
                is_etf = inst.asset_type == "ETF"
                return {
                    "canonical_symbol": inst.ticker or base,
                    "provider_symbol": inst.provider_symbol or inst.ticker or base,
                    "asset_type": inst.asset_type,
                    "market": "US",
                    "exchange": inst.exchange or "NASDAQ",
                    "scheme_code": None
                }
    except Exception:
        pass

    # 8. Standard US / Global Equities & ETFs fallback (never append .NS)
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
    raw_timestamp: Optional[str] = None,
    is_live: Optional[bool] = None,
    is_stale: bool = False,
    data_date: Optional[str] = None,
    provider_timestamp: Optional[int] = None,
    change_percent: Optional[float] = None,
    instrument_type: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Standard canonical internal schema for all SmartVest market quotes.
    Preserves authentic provider fields without fabricating artificial numbers.
    Enforces strict metadata:
      - isLive is True ONLY if instrument is STOCK or ETF, market is OPEN, provider tick is active, not stale.
      - Mutual funds are NEVER live; price is NAV with navDate.
      - Trade timestamp is strictly the provider-supplied timestamp (NEVER datetime.now()).
    """
    now_utc = datetime.now(timezone.utc)
    as_of = format_ist_timestamp(now_utc)
    
    freshness_str = freshness.value if hasattr(freshness, "value") else sanitize_freshness_state(str(freshness))

    p_val = round(float(price), 2) if price is not None else None
    c_val = round(float(change), 2) if change is not None else None
    
    # Unify changePct and changePercent
    cp_in = change_percent if change_percent is not None else change_pct
    cp_val = round(float(cp_in), 2) if cp_in is not None else None
    
    v_val = int(volume) if volume is not None else (0 if p_val is not None else None)
    pc_val = round(float(prev_close), 2) if prev_close is not None else None

    # Determine instrument type
    inst_type = (instrument_type or asset_type or "STOCK").upper()
    is_mf = inst_type == "MUTUAL_FUND" or asset_type.upper() == "MUTUAL_FUND"

    # Mutual fund invariant: NEVER live, always PUBLISHED / NAV
    if is_mf:
        is_live_flag = False
        inst_type = "MUTUAL_FUND"
        asset_type = "MUTUAL_FUND"
        if market_status in ["OPEN", "CLOSED"]:
            market_status = "PUBLISHED"
    else:
        # Stock or ETF: strictly check session state
        if market_status in ["CLOSED", "WEEKEND", "HOLIDAY", "PRE_OPEN", "UNKNOWN"]:
            is_live_flag = False
        elif is_live is not None:
            is_live_flag = bool(is_live and (not is_stale) and (market_status == "OPEN"))
        elif freshness_str in ["REALTIME", "LIVE"]:
            is_live_flag = (not is_stale) and (market_status == "OPEN") and (inst_type in ["STOCK", "ETF", "INDEX"])
        else:
            is_live_flag = False

    # Timestamp rule: NEVER use datetime.now() as the trade timestamp
    # If raw_timestamp is missing, we preserve None or the provider timestamp
    ts_iso = raw_timestamp
    if not ts_iso and provider_timestamp:
        try:
            # Handle milliseconds or seconds
            pts = provider_timestamp / 1000.0 if provider_timestamp > 1e11 else provider_timestamp
            dt = datetime.fromtimestamp(pts, tz=timezone.utc)
            ts_iso = dt.isoformat()
            if not data_date:
                data_date = dt.strftime("%Y-%m-%d")
        except Exception:
            pass

    display_ts_ist = format_ist_timestamp(ts_iso) if ts_iso else as_of

    return {
        "symbol": symbol,
        "name": name,
        "exchange": exchange,
        "assetType": asset_type,
        "instrumentType": inst_type,
        "price": p_val,
        "nav": p_val if is_mf else None,
        "currency": currency,
        "change": c_val,
        "changePct": cp_val,
        "changePercent": cp_val,
        "volume": v_val,
        "open": round(float(open_price), 2) if open_price is not None else None,
        "high": round(float(high_price), 2) if high_price is not None else None,
        "low": round(float(low_price), 2) if low_price is not None else None,
        "prevClose": pc_val,
        "previousClose": pc_val,
        "timestamp": ts_iso,
        "exchangeTimestamp": ts_iso,
        "exchangeTimestampUtc": ts_iso,
        "displayTimestampIst": display_ts_ist,
        "dataDate": data_date or nav_date,
        "providerTimestamp": provider_timestamp,
        "marketStatus": market_status,
        "freshness": freshness_str,
        "source": source,
        "isLive": is_live_flag,
        "isStale": is_stale,
        "asOf": display_ts_ist,
        "navDate": nav_date
    }

def create_unavailable_quote(
    symbol: str,
    message: str = "Live market data is not configured for this instrument.",
    market_status: str = "UNKNOWN"
) -> Dict[str, Any]:
    """Creates a strictly typed unavailable response with zero fake numbers."""
    now_utc = datetime.now(timezone.utc)
    display_ist = format_ist_timestamp(now_utc)
    return {
        "symbol": symbol,
        "name": symbol,
        "exchange": "UNKNOWN",
        "assetType": "UNKNOWN",
        "instrumentType": "UNKNOWN",
        "price": None,
        "nav": None,
        "currency": "INR",
        "change": None,
        "changePct": None,
        "changePercent": None,
        "volume": None,
        "open": None,
        "high": None,
        "low": None,
        "prevClose": None,
        "previousClose": None,
        "timestamp": None,
        "exchangeTimestamp": None,
        "exchangeTimestampUtc": None,
        "displayTimestampIst": display_ist,
        "dataDate": None,
        "providerTimestamp": None,
        "marketStatus": market_status,
        "freshness": DataFreshness.UNAVAILABLE.value,
        "source": None,
        "isLive": False,
        "isStale": True,
        "asOf": display_ist,
        "navDate": None,
        "message": message
    }
