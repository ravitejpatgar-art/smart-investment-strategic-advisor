from typing import Dict, Any, Optional
from datetime import datetime
import yfinance as yf
from app.services.market_data.freshness import DataFreshness
from app.services.market_data.cache import market_cache


def _safe_float(val, scale: float = 1.0, decimals: int = 2) -> Optional[float]:
    """Safely convert a value to float with optional scaling and rounding."""
    try:
        if val is None or val == 0:
            return None
        result = float(val) * scale
        return round(result, decimals)
    except (TypeError, ValueError):
        return None


def _safe_int(val) -> Optional[int]:
    try:
        if val is None:
            return None
        return int(val)
    except (TypeError, ValueError):
        return None


def _format_ts(ts) -> Optional[str]:
    """Convert a UNIX timestamp to YYYY-MM-DD string."""
    try:
        if ts is None:
            return None
        return datetime.fromtimestamp(int(ts)).strftime("%Y-%m-%d")
    except Exception:
        return None


def get_enhanced_fundamentals(symbol: str, asset_type: str = "STOCK") -> Dict[str, Any]:
    """
    Fetches comprehensive research data from Yahoo Finance for any instrument.
    Returns normalized sections. Never invents data — returns None for unavailable fields.

    Sections returned:
      fundamentals  — income statement / balance sheet metrics
      valuation     — P/E, P/B, EV/EBITDA, etc.
      dividends     — yield, payout, ex-date
      risk          — beta, 52w range, avg volume
      etfData       — ETF-specific (AUM, expense ratio, category) [for ETF / MF]
      mfData        — MF-specific alias of etfData [for MUTUAL_FUND]
    """
    s_upper = symbol.upper().strip()
    cache_key = f"research:enhanced:{s_upper}:{asset_type}"

    cached = market_cache.get(cache_key, allow_stale=False)
    if cached:
        return cached

    try:
        ticker = yf.Ticker(symbol)
        info = ticker.info or {}

        # Bail if provider returned no useful data
        if not info or len(info) < 3:
            return {
                "symbol": s_upper,
                "freshness": DataFreshness.UNAVAILABLE.value,
                "message": "Provider returned empty instrument data.",
            }

        # ── FUNDAMENTALS ──
        fundamentals: Dict[str, Any] = {}

        rev = _safe_int(info.get("totalRevenue"))
        if rev: fundamentals["revenue"] = rev

        rev_growth = _safe_float(info.get("revenueGrowth"), scale=100)
        if rev_growth is not None: fundamentals["revenueGrowth"] = rev_growth

        gross = _safe_int(info.get("grossProfits"))
        if gross: fundamentals["grossProfit"] = gross

        ebitda = _safe_int(info.get("ebitda"))
        if ebitda: fundamentals["ebitda"] = ebitda

        ebit = _safe_int(info.get("operatingIncome") or info.get("ebit"))
        if ebit: fundamentals["ebit"] = ebit

        net_income = _safe_int(info.get("netIncomeToCommon"))
        if net_income: fundamentals["netIncome"] = net_income

        eps = _safe_float(info.get("trailingEps"))
        if eps is not None: fundamentals["eps"] = eps

        fwd_eps = _safe_float(info.get("epsCurrentYear") or info.get("epsForward"))
        if fwd_eps is not None: fundamentals["forwardEPS"] = fwd_eps

        op_cf = _safe_int(info.get("operatingCashflow"))
        if op_cf: fundamentals["operatingCashFlow"] = op_cf

        fcf = _safe_int(info.get("freeCashflow"))
        if fcf: fundamentals["freeCashFlow"] = fcf

        profit_m = _safe_float(info.get("profitMargins"), scale=100)
        if profit_m is not None: fundamentals["profitMargin"] = profit_m

        op_m = _safe_float(info.get("operatingMargins"), scale=100)
        if op_m is not None: fundamentals["operatingMargin"] = op_m

        gross_m = _safe_float(info.get("grossMargins"), scale=100)
        if gross_m is not None: fundamentals["grossMargin"] = gross_m

        roe = _safe_float(info.get("returnOnEquity"), scale=100)
        if roe is not None: fundamentals["roe"] = roe

        roa = _safe_float(info.get("returnOnAssets"), scale=100)
        if roa is not None: fundamentals["roa"] = roa

        total_debt = _safe_int(info.get("totalDebt"))
        if total_debt: fundamentals["totalDebt"] = total_debt

        total_cash = _safe_int(info.get("totalCash"))
        if total_cash: fundamentals["totalCash"] = total_cash

        d_e = _safe_float(info.get("debtToEquity"))
        if d_e is not None: fundamentals["debtToEquity"] = d_e

        curr_ratio = _safe_float(info.get("currentRatio"))
        if curr_ratio is not None: fundamentals["currentRatio"] = curr_ratio

        book_val = _safe_float(info.get("bookValue"))
        if book_val is not None: fundamentals["bookValuePerShare"] = book_val

        # ── VALUATION ──
        valuation: Dict[str, Any] = {}

        pe = _safe_float(info.get("trailingPE"))
        if pe is not None: valuation["peRatio"] = pe

        fwd_pe = _safe_float(info.get("forwardPE"))
        if fwd_pe is not None: valuation["forwardPE"] = fwd_pe

        pb = _safe_float(info.get("priceToBook"))
        if pb is not None: valuation["pbRatio"] = pb

        ps = _safe_float(info.get("priceToSalesTrailing12Months"))
        if ps is not None: valuation["psRatio"] = ps

        ev_ebitda = _safe_float(info.get("enterpriseToEbitda"))
        if ev_ebitda is not None: valuation["evEbitda"] = ev_ebitda

        ev_rev = _safe_float(info.get("enterpriseToRevenue"))
        if ev_rev is not None: valuation["evSales"] = ev_rev

        peg = _safe_float(info.get("pegRatio"))
        if peg is not None: valuation["peg"] = peg

        mkt_cap = _safe_int(info.get("marketCap"))
        if mkt_cap: valuation["marketCap"] = mkt_cap

        ev = _safe_int(info.get("enterpriseValue"))
        if ev: valuation["enterpriseValue"] = ev

        # ── DIVIDENDS ──
        dividends: Dict[str, Any] = {}

        div_yield = _safe_float(info.get("dividendYield"), scale=100)
        if div_yield is not None: dividends["yield"] = div_yield

        div_rate = _safe_float(info.get("dividendRate"))
        if div_rate is not None: dividends["annualDividend"] = div_rate

        payout = _safe_float(info.get("payoutRatio"), scale=100)
        if payout is not None: dividends["payoutRatio"] = payout

        ex_div = _format_ts(info.get("exDividendDate"))
        if ex_div: dividends["exDividendDate"] = ex_div

        last_div = _safe_float(info.get("lastDividendValue"))
        if last_div is not None: dividends["lastDividend"] = last_div

        # ── RISK ──
        risk: Dict[str, Any] = {}

        beta = _safe_float(info.get("beta"))
        if beta is not None: risk["beta"] = beta

        wk52_high = _safe_float(info.get("fiftyTwoWeekHigh"))
        if wk52_high is not None: risk["fiftyTwoWeekHigh"] = wk52_high

        wk52_low = _safe_float(info.get("fiftyTwoWeekLow"))
        if wk52_low is not None: risk["fiftyTwoWeekLow"] = wk52_low

        avg_vol = _safe_int(info.get("averageVolume"))
        if avg_vol: risk["averageVolume"] = avg_vol

        avg_vol_10d = _safe_int(info.get("averageVolume10days"))
        if avg_vol_10d: risk["averageVolume10d"] = avg_vol_10d

        # ── ETF / FUND DATA ──
        etf_data = None
        is_fund_type = asset_type in ("ETF", "MUTUAL_FUND") or info.get("quoteType", "").upper() in ("ETF", "MUTUALFUND")
        if is_fund_type:
            etf_raw: Dict[str, Any] = {}

            total_assets = _safe_int(info.get("totalAssets"))
            if total_assets: etf_raw["aum"] = total_assets

            exp_ratio = _safe_float(
                info.get("annualReportExpenseRatio") or info.get("netExpenseRatio"),
                scale=100, decimals=4
            )
            if exp_ratio is not None: etf_raw["expenseRatio"] = exp_ratio

            fund_family = info.get("fundFamily")
            if fund_family: etf_raw["issuer"] = str(fund_family)

            category = info.get("category")
            if category: etf_raw["category"] = str(category)

            inception = _format_ts(info.get("fundInceptionDate"))
            if inception: etf_raw["inceptionDate"] = inception

            nav_price = _safe_float(info.get("navPrice") or info.get("regularMarketPrice"))
            if nav_price is not None: etf_raw["nav"] = nav_price

            ytd = _safe_float(info.get("ytdReturn"), scale=100)
            if ytd is not None: etf_raw["ytdReturn"] = ytd

            three_yr = _safe_float(info.get("threeYearAverageReturn"), scale=100)
            if three_yr is not None: etf_raw["threeYearReturn"] = three_yr

            five_yr = _safe_float(info.get("fiveYearAverageReturn"), scale=100)
            if five_yr is not None: etf_raw["fiveYearReturn"] = five_yr

            if etf_raw:
                etf_data = etf_raw

        # MF data reuses ETF data structure
        mf_data = etf_data if asset_type == "MUTUAL_FUND" else None

        # ── ASSEMBLE ──
        result: Dict[str, Any] = {
            "symbol": s_upper,
            "freshness": DataFreshness.LATEST_AVAILABLE.value,
            "source": "Yahoo Finance",
            "asOf": str(info.get("mostRecentQuarter") or "Latest Available"),
            "fundamentals": fundamentals if fundamentals else None,
            "valuation": valuation if valuation else None,
            "dividends": dividends if dividends else None,
            "risk": risk if risk else None,
            "etfData": etf_data,
            "mfData": mf_data,
        }

        market_cache.set(cache_key, result, ttl_seconds=3600)
        return result

    except Exception:
        return {
            "symbol": s_upper,
            "freshness": DataFreshness.UNAVAILABLE.value,
            "message": "Research data temporarily unavailable from provider.",
        }


def get_instrument_fundamentals(symbol: str) -> Dict[str, Any]:
    """
    Backward-compatible wrapper. Returns flattened fundamental metrics
    as used by the existing /market/fundamentals endpoint.
    """
    s_upper = symbol.upper().strip()
    cache_key = f"fundamentals:all:{s_upper}"

    cached = market_cache.get(cache_key, allow_stale=False)
    if cached:
        return cached

    # Resolve yfinance ticker symbol for Indian stocks
    yf_sym = s_upper
    if s_upper in ["RELIANCE", "TCS", "HDFCBANK", "INFY", "TATAMOTORS", "TATASTEEL", "WIPRO", "ICICIBANK", "SBIN"]:
        yf_sym = f"{s_upper}.NS"

    try:
        ticker = yf.Ticker(yf_sym)
        info = ticker.info or {}

        if info:
            res = {
                "symbol": s_upper,
                "name": info.get("shortName") or info.get("longName") or s_upper,
                "marketCap": info.get("marketCap"),
                "peRatio": round(float(info.get("trailingPE", 0)), 2) if info.get("trailingPE") else None,
                "forwardPE": round(float(info.get("forwardPE", 0)), 2) if info.get("forwardPE") else None,
                "pbRatio": round(float(info.get("priceToBook", 0)), 2) if info.get("priceToBook") else None,
                "eps": round(float(info.get("trailingEps", 0)), 2) if info.get("trailingEps") else None,
                "dividendYield": round(float(info.get("dividendYield", 0) * 100), 2) if info.get("dividendYield") else None,
                "profitMargins": round(float(info.get("profitMargins", 0) * 100), 2) if info.get("profitMargins") else None,
                "debtToEquity": round(float(info.get("debtToEquity", 0)), 2) if info.get("debtToEquity") else None,
                "revenueGrowth": round(float(info.get("revenueGrowth", 0) * 100), 2) if info.get("revenueGrowth") else None,
                "fiftyTwoWeekHigh": info.get("fiftyTwoWeekHigh"),
                "fiftyTwoWeekLow": info.get("fiftyTwoWeekLow"),
                "source": "Yahoo Finance Fundamentals Feed",
                "freshness": DataFreshness.LATEST_AVAILABLE.value,
                "asOf": info.get("mostRecentQuarter") or "Latest Quarterly Filing"
            }
            market_cache.set(cache_key, res, ttl_seconds=3600)
            return res
    except Exception:
        pass

    return {
        "symbol": s_upper,
        "freshness": DataFreshness.UNAVAILABLE.value,
        "message": "Fundamental metrics unavailable for this instrument."
    }
