import json
import urllib.request
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone, timedelta
from app.services.market_data.base import BaseMarketDataProvider, ProviderCapabilities
from app.services.market_data.freshness import DataFreshness
from app.services.market_data.normalizer import normalize_market_quote, create_unavailable_quote
from app.services.market_data.validator import validate_quote_data
from app.services.market_data.cache import market_cache

# Official AMFI Scheme Codes for Recommended Direct-Growth Funds
MF_SCHEME_MAP = {
    "120716": {"code": "120716", "name": "UTI Nifty 50 Index Fund Direct-Growth", "category": "Index Fund"},
    "122639": {"code": "122639", "name": "Parag Parikh Flexi Cap Fund Direct-Growth", "category": "Flexi Cap Fund"},
    "120586": {"code": "120586", "name": "ICICI Prudential Liquid Fund Direct-Growth", "category": "Liquid Fund"},
    "119062": {"code": "119062", "name": "HDFC Short Duration Debt Fund Direct-Growth", "category": "Short Duration Debt"},
    "125354": {"code": "125354", "name": "Nippon India Small Cap Fund Direct-Growth", "category": "Small Cap Fund"},
    "120616": {"code": "120616", "name": "ICICI Prudential Conservative Hybrid Fund Direct-Growth", "category": "Conservative Hybrid"},
    "NIFTY50_INDEX": {"code": "120716", "name": "UTI Nifty 50 Index Fund Direct-Growth", "category": "Index Fund"},
    "NIFTY50": {"code": "120716", "name": "UTI Nifty 50 Index Fund Direct-Growth", "category": "Index Fund"},
    "FLEXICAP_FUND": {"code": "122639", "name": "Parag Parikh Flexi Cap Fund Direct-Growth", "category": "Flexi Cap Fund"},
    "PPFCF": {"code": "122639", "name": "Parag Parikh Flexi Cap Fund Direct-Growth", "category": "Flexi Cap Fund"},
    "PPFAS": {"code": "122639", "name": "Parag Parikh Flexi Cap Fund Direct-Growth", "category": "Flexi Cap Fund"},
    "LIQUID_FUND": {"code": "120586", "name": "ICICI Prudential Liquid Fund Direct-Growth", "category": "Liquid Fund"},
    "ICICILIQ": {"code": "120586", "name": "ICICI Prudential Liquid Fund Direct-Growth", "category": "Liquid Fund"},
    "SHORT_DEBT_FUND": {"code": "119062", "name": "HDFC Short Duration Debt Fund Direct-Growth", "category": "Short Duration Debt"},
    "HDFCSHORT": {"code": "119062", "name": "HDFC Short Duration Debt Fund Direct-Growth", "category": "Short Duration Debt"},
    "SMALLCAP_FUND": {"code": "125354", "name": "Nippon India Small Cap Fund Direct-Growth", "category": "Small Cap Fund"},
    "NIPPSMALL": {"code": "125354", "name": "Nippon India Small Cap Fund Direct-Growth", "category": "Small Cap Fund"},
    "CONSERVATIVE_HYBRID": {"code": "120616", "name": "ICICI Prudential Conservative Hybrid Fund Direct-Growth", "category": "Conservative Hybrid"},
    "ICICISAVE": {"code": "120616", "name": "ICICI Prudential Conservative Hybrid Fund Direct-Growth", "category": "Conservative Hybrid"},
    "REGULAR_SAVINGS": {"code": "120616", "name": "ICICI Prudential Conservative Hybrid Fund Direct-Growth", "category": "Conservative Hybrid"},
    "UTI_NIFTY_50": {"code": "120716", "name": "UTI Nifty 50 Index Fund Direct-Growth", "category": "Index Fund"},
    "UTI NIFTY 50 INDEX FUND DIRECT": {"code": "120716", "name": "UTI Nifty 50 Index Fund Direct-Growth", "category": "Index Fund"},
    "PARAG_PARIKH_FLEXICAP": {"code": "122639", "name": "Parag Parikh Flexi Cap Fund Direct-Growth", "category": "Flexi Cap Fund"},
    "PARAG PARIKH FLEXI CAP FUND DIRECT": {"code": "122639", "name": "Parag Parikh Flexi Cap Fund Direct-Growth", "category": "Flexi Cap Fund"},
    "ICICI_LIQUID": {"code": "120586", "name": "ICICI Prudential Liquid Fund Direct-Growth", "category": "Liquid Fund"},
    "ICICI PRUDENTIAL LIQUID FUND DIRECT": {"code": "120586", "name": "ICICI Prudential Liquid Fund Direct-Growth", "category": "Liquid Fund"},
    "HDFC_SHORT_DEBT": {"code": "119062", "name": "HDFC Short Duration Debt Fund Direct-Growth", "category": "Short Duration Debt"},
    "HDFC SHORT DURATION DEBT FUND DIRECT": {"code": "119062", "name": "HDFC Short Duration Debt Fund Direct-Growth", "category": "Short Duration Debt"},
    "NIPPON_SMALLCAP": {"code": "125354", "name": "Nippon India Small Cap Fund Direct-Growth", "category": "Small Cap Fund"},
    "NIPPON INDIA SMALL CAP FUND DIRECT": {"code": "125354", "name": "Nippon India Small Cap Fund Direct-Growth", "category": "Small Cap Fund"},
    "ICICI_REGULAR_SAVINGS": {"code": "120616", "name": "ICICI Prudential Conservative Hybrid Fund Direct-Growth", "category": "Conservative Hybrid"},
    "ICICI PRUDENTIAL REGULAR SAVINGS FUND DIRECT": {"code": "120616", "name": "ICICI Prudential Conservative Hybrid Fund Direct-Growth", "category": "Conservative Hybrid"},
    "ICICI PRUDENTIAL CONSERVATIVE HYBRID FUND DIRECT": {"code": "120616", "name": "ICICI Prudential Conservative Hybrid Fund Direct-Growth", "category": "Conservative Hybrid"}
}

def parse_amfi_date(date_str: str) -> str:
    """Convert AMFI DD-MM-YYYY to standard ISO YYYY-MM-DD."""
    try:
        dt = datetime.strptime(date_str.strip(), "%d-%m-%Y")
        return dt.strftime("%Y-%m-%d")
    except Exception:
        return date_str

class MutualFundsProvider(BaseMarketDataProvider):
    """
    Provider adapter for Indian Mutual Funds using official AMFI daily NAV published feeds.
    Strictly classified as LATEST_AVAILABLE with explicit NAV date. Never claimed as 'LIVE'.
    """
    def __init__(self):
        super().__init__(
            name="AMFI / Official Mutual Fund Feed",
            capabilities=ProviderCapabilities(
                name="Mutual Fund NAV Provider",
                realtime=False,
                delayed=False,
                historical=True,
                mutual_funds_nav=True,
                fundamentals=True,
                commercial_display=True,
                api_key_required=False,
                is_configured=True,
                entitlement_verified=True
            )
        )

    def resolve_scheme(self, symbol: str) -> Optional[Dict[str, str]]:
        s_clean = symbol.upper().strip().replace("-", "_").replace(" ", "_")
        
        # Direct scheme code match
        if symbol.strip() in MF_SCHEME_MAP:
            return MF_SCHEME_MAP[symbol.strip()]
            
        for k, v in MF_SCHEME_MAP.items():
            if k.replace(" ", "_").upper() in s_clean or s_clean in k.replace(" ", "_").upper():
                return v
                
        # Keyword matching
        if "UTI" in s_clean or ("NIFTY" in s_clean and "BEES" not in s_clean and "^" not in s_clean):
            return MF_SCHEME_MAP["UTI_NIFTY_50"]
        if "PARAG" in s_clean or "FLEXI" in s_clean or "PPFCF" in s_clean:
            return MF_SCHEME_MAP["PARAG_PARIKH_FLEXICAP"]
        if "LIQUID" in s_clean or "ICICILIQ" in s_clean:
            return MF_SCHEME_MAP["ICICI_LIQUID"]
        if "SHORT" in s_clean or "DEBT" in s_clean or "HDFCSHORT" in s_clean:
            return MF_SCHEME_MAP["HDFC_SHORT_DEBT"]
        if "SMALL" in s_clean or "NIPPSMALL" in s_clean:
            return MF_SCHEME_MAP["NIPPON_SMALLCAP"]
        if "HYBRID" in s_clean or "CONSERVATIVE" in s_clean or "SAVE" in s_clean or "ICICISAVE" in s_clean or "REGULAR_SAVINGS" in s_clean:
            return MF_SCHEME_MAP["CONSERVATIVE_HYBRID"]
            
        return None

    def get_quote(self, symbol: str) -> Dict[str, Any]:
        canonical_sym = symbol.strip()
        scheme_info = self.resolve_scheme(canonical_sym)
        
        if not scheme_info:
            return create_unavailable_quote(canonical_sym, "Mutual fund scheme code not found in AMFI directory.")

        scheme_code = scheme_info["code"]
        cache_key = f"quote:mf:{scheme_code}"

        cached = market_cache.get(cache_key, allow_stale=False)
        if cached:
            cached_copy = dict(cached)
            cached_copy["symbol"] = canonical_sym
            return cached_copy

        # Fetch from AMFI API
        try:
            url = f"https://api.mfapi.in/mf/{scheme_code}"
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) SmartVest/1.0"})
            with urllib.request.urlopen(req, timeout=5) as response:
                data = json.loads(response.read().decode("utf-8"))
                meta = data.get("meta", {})
                nav_data = data.get("data", [])

                if nav_data:
                    latest_nav_item = nav_data[0]
                    prev_nav_item = nav_data[1] if len(nav_data) > 1 else latest_nav_item
                    
                    nav = float(latest_nav_item.get("nav", 0.0))
                    prev_nav = float(prev_nav_item.get("nav", nav))
                    nav_date = latest_nav_item.get("date", "")
                    
                    change = nav - prev_nav
                    change_pct = (change / prev_nav * 100.0) if prev_nav > 0 else 0.0

                    quote = normalize_market_quote(
                        symbol=canonical_sym,
                        name=meta.get("scheme_name", scheme_info["name"]),
                        exchange="AMFI",
                        asset_type="MUTUAL_FUND",
                        price=nav,
                        change=change,
                        change_pct=change_pct,
                        volume=0,
                        open_price=nav,
                        high_price=nav,
                        low_price=nav,
                        prev_close=prev_nav,
                        currency="INR",
                        freshness=DataFreshness.LATEST_AVAILABLE,
                        source="AMFI Published Daily NAV",
                        market_status="PUBLISHED",
                        nav_date=nav_date
                    )

                    valid, _ = validate_quote_data(quote)
                    if valid:
                        market_cache.set(cache_key, quote, ttl_seconds=3600)
                        return quote
        except Exception:
            pass

        stale = market_cache.get(cache_key, allow_stale=True)
        if stale:
            stale["freshness"] = DataFreshness.STALE.value
            return stale

        return create_unavailable_quote(canonical_sym, "Latest AMFI NAV temporarily unavailable.")

    def fetch_raw_scheme_data(self, scheme_code: str) -> Optional[Dict[str, Any]]:
        """
        Fetches and caches the complete raw AMFI NAV historical series for a given scheme code.
        Caches at the raw scheme level (raw:mf:{scheme_code}) to eliminate redundant API requests.
        """
        cache_key = f"raw:mf:{scheme_code}"
        cached = market_cache.get(cache_key, allow_stale=True)
        if cached and cached.get("data"):
            return cached

        url = f"https://api.mfapi.in/mf/{scheme_code}"
        headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) SmartVest/1.0"}
        
        # Retry with exponential backoff (max 2 attempts)
        for attempt in range(2):
            try:
                req = urllib.request.Request(url, headers=headers)
                with urllib.request.urlopen(req, timeout=10) as response:
                    if response.status == 200:
                        raw_bytes = response.read()
                        data = json.loads(raw_bytes.decode("utf-8"))
                        if data and data.get("data"):
                            market_cache.set(cache_key, data, ttl_seconds=14400) # 4 hours TTL
                            return data
            except Exception:
                if attempt == 1:
                    break
        
        # Fallback to stale if available
        stale = market_cache.get(cache_key, allow_stale=True)
        if stale and stale.get("data"):
            return stale

        return None

    def get_quote(self, symbol: str) -> Dict[str, Any]:
        canonical_sym = symbol.strip()
        scheme_info = self.resolve_scheme(canonical_sym)
        
        if not scheme_info:
            return create_unavailable_quote(canonical_sym, "Mutual fund scheme code not found in AMFI directory.")

        scheme_code = scheme_info["code"]
        cache_key = f"quote:mf:{scheme_code}"

        cached = market_cache.get(cache_key, allow_stale=False)
        if cached:
            cached_copy = dict(cached)
            cached_copy["symbol"] = canonical_sym
            return cached_copy

        # Fetch using raw scheme data
        raw_data = self.fetch_raw_scheme_data(scheme_code)
        if raw_data:
            meta = raw_data.get("meta", {})
            nav_data = raw_data.get("data", [])

            if nav_data:
                latest_nav_item = nav_data[0]
                prev_nav_item = nav_data[1] if len(nav_data) > 1 else latest_nav_item
                
                nav = float(latest_nav_item.get("nav", 0.0))
                prev_nav = float(prev_nav_item.get("nav", nav))
                nav_date = latest_nav_item.get("date", "")
                
                change = round(nav - prev_nav, 4)
                change_pct = round((change / prev_nav * 100.0), 2) if prev_nav > 0 else 0.0

                quote = normalize_market_quote(
                    symbol=canonical_sym,
                    name=meta.get("scheme_name", scheme_info["name"]),
                    exchange="AMFI",
                    asset_type="MUTUAL_FUND",
                    price=nav,
                    change=change,
                    change_pct=change_pct,
                    volume=0,
                    open_price=nav,
                    high_price=nav,
                    low_price=nav,
                    prev_close=prev_nav,
                    currency="INR",
                    freshness=DataFreshness.LATEST_AVAILABLE,
                    source="AMFI Published Daily NAV",
                    market_status="PUBLISHED",
                    nav_date=nav_date
                )

                valid, _ = validate_quote_data(quote)
                if valid:
                    market_cache.set(cache_key, quote, ttl_seconds=3600)
                    return quote

        stale = market_cache.get(cache_key, allow_stale=True)
        if stale:
            stale["freshness"] = DataFreshness.STALE.value
            return stale

        return create_unavailable_quote(canonical_sym, "Latest AMFI NAV temporarily unavailable.")

    def get_candles(self, symbol: str, interval: str = "1d", range_period: str = "1mo") -> Dict[str, Any]:
        canonical_sym = symbol.strip()
        scheme_info = self.resolve_scheme(canonical_sym)
        if not scheme_info:
            return {
                "symbol": canonical_sym,
                "range": range_period,
                "interval": interval,
                "source": "AMFI Historical NAV Feed",
                "freshness": DataFreshness.UNAVAILABLE.value,
                "observations": [],
                "message": "Scheme code not found."
            }

        scheme_code = scheme_info["code"]
        r_clean = range_period.lower().strip()
        if r_clean in ["1m", "30d"]:
            r_clean = "1mo"
        elif r_clean in ["3m", "90d"]:
            r_clean = "3mo"
        elif r_clean in ["6m", "180d"]:
            r_clean = "6mo"
        elif r_clean in ["12m", "365d"]:
            r_clean = "1y"

        cache_key = f"candles:mf:{scheme_code}:{r_clean}"

        cached = market_cache.get(cache_key, allow_stale=False)
        if cached:
            cached_copy = dict(cached)
            cached_copy["symbol"] = canonical_sym
            return cached_copy

        raw_data = self.fetch_raw_scheme_data(scheme_code)
        if not raw_data:
            return {
                "symbol": canonical_sym,
                "range": range_period,
                "interval": interval,
                "source": "AMFI Historical NAV Feed",
                "freshness": DataFreshness.UNAVAILABLE.value,
                "observations": [],
                "message": "Historical NAV series unavailable from AMFI feed."
            }

        meta = raw_data.get("meta", {})
        nav_data = raw_data.get("data", [])

        if not nav_data:
            return {
                "symbol": canonical_sym,
                "range": range_period,
                "interval": interval,
                "source": "AMFI Historical NAV Feed",
                "freshness": DataFreshness.UNAVAILABLE.value,
                "observations": [],
                "message": "No historical NAV points returned by AMFI."
            }

        # Determine total days required by range
        if r_clean in ["1mo", "30d"]:
            total_days = 30
        elif r_clean in ["3mo", "90d"]:
            total_days = 90
        elif r_clean in ["6mo", "180d"]:
            total_days = 180
        elif r_clean in ["1y", "12m", "365d"]:
            total_days = 365
        elif r_clean in ["3y", "36m", "1095d"]:
            total_days = 1095
        elif r_clean in ["5y", "60m", "1825d"]:
            total_days = 1825
        else:
            total_days = 365

        # Filter nav_data (sorted newest first in raw feed)
        parsed_items = []
        for item in nav_data:
            raw_d = item.get("date", "")
            try:
                dt = datetime.strptime(raw_d.strip(), "%d-%m-%Y")
                iso_d = dt.strftime("%Y-%m-%d")
                n_val = float(item.get("nav", 0.0))
                if n_val > 0:
                    parsed_items.append((dt, iso_d, n_val))
            except Exception:
                continue

        if not parsed_items:
            return {
                "symbol": canonical_sym,
                "range": range_period,
                "interval": interval,
                "source": "AMFI Historical NAV Feed",
                "freshness": DataFreshness.UNAVAILABLE.value,
                "observations": [],
                "message": "Failed to parse NAV observations."
            }

        latest_date = parsed_items[0][0]
        cutoff_date = latest_date - timedelta(days=total_days)

        in_range = [p for p in parsed_items if p[0] >= cutoff_date]
        if len(in_range) < 2:
            in_range = parsed_items[:max(2, min(len(parsed_items), 30))]

        # Sort ascending (oldest to newest)
        in_range.sort(key=lambda x: x[0])

        # Construct observations list with deduplication
        observations = []
        seen_dates = set()
        for dt, iso_d, n_val in in_range:
            if iso_d in seen_dates:
                continue
            seen_dates.add(iso_d)
            observations.append({
                "date": iso_d,
                "timestamp": iso_d,
                "nav": round(n_val, 4),
                "close": round(n_val, 4),
                "open": round(n_val, 4),
                "high": round(n_val, 4),
                "low": round(n_val, 4),
                "volume": 0
            })

        res = {
            "symbol": canonical_sym,
            "name": meta.get("scheme_name", scheme_info["name"]),
            "range": range_period,
            "interval": "1d",
            "source": "AMFI Historical NAV Feed",
            "freshness": DataFreshness.HISTORICAL.value,
            "disclaimer": "Past performance does not guarantee future results.",
            "observations": observations
        }
        market_cache.set(cache_key, res, ttl_seconds=3600)
        return res

    def get_fundamentals(self, symbol: str) -> Dict[str, Any]:
        canonical_sym = symbol.strip()
        scheme_info = self.resolve_scheme(canonical_sym)
        if not scheme_info:
            return {"symbol": canonical_sym, "freshness": DataFreshness.UNAVAILABLE.value, "message": "Fund not found"}

        return {
            "symbol": canonical_sym,
            "name": scheme_info["name"],
            "category": scheme_info["category"],
            "planType": "Direct Plan - Growth Option",
            "source": "AMFI Mutual Fund Directory",
            "freshness": DataFreshness.LATEST_AVAILABLE.value
        }

    def get_instrument_metadata(self, symbol: str) -> Dict[str, Any]:
        canonical_sym = symbol.strip()
        scheme_info = self.resolve_scheme(canonical_sym)
        return {
            "symbol": canonical_sym,
            "name": scheme_info["name"] if scheme_info else canonical_sym,
            "exchange": "AMFI",
            "country": "IN",
            "currency": "INR",
            "assetType": "MUTUAL_FUND"
        }
