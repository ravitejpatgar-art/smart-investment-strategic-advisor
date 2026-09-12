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

        # ── PROFITABILITY & FINANCIAL HEALTH ──
        net_debt = None
        if total_debt is not None and total_cash is not None:
            net_debt = total_debt - total_cash

        quick_ratio = _safe_float(info.get("quickRatio"))
        if quick_ratio is not None: fundamentals["quickRatio"] = quick_ratio

        if total_debt is not None: fundamentals["netDebt"] = net_debt

        # Return on Assets & Capital
        roce = _safe_float(info.get("returnOnCapitalEmployed") or info.get("returnOnEquity"), scale=100)
        if roce is not None: fundamentals["roce"] = roce

        roic = _safe_float(info.get("returnOnInvestedCapital"), scale=100)
        if roic is not None: fundamentals["roic"] = roic

        # ── CASH FLOW ──
        cash_flow: Dict[str, Any] = {}
        if op_cf: cash_flow["operatingCashFlow"] = op_cf
        if fcf: cash_flow["freeCashFlow"] = fcf
        capex = _safe_int(info.get("capitalExpenditures"))
        if capex: cash_flow["capitalExpenditure"] = abs(capex)

        # ── EARNINGS & GROWTH ──
        earnings: Dict[str, Any] = {}
        if eps is not None: earnings["actualEPS"] = eps
        if fwd_eps is not None: earnings["estimatedEPS"] = fwd_eps
        eps_growth = _safe_float(info.get("earningsQuarterlyGrowth") or info.get("earningsGrowth"), scale=100)
        if eps_growth is not None: earnings["earningsGrowth"] = eps_growth
        revenue_growth = _safe_float(info.get("revenueGrowth"), scale=100)
        if revenue_growth is not None: earnings["revenueGrowth"] = revenue_growth

        # ── OWNERSHIP & CAPITAL STRUCTURE ──
        ownership: Dict[str, Any] = {}
        inst_held = _safe_float(info.get("heldPercentInstitutions"), scale=100)
        if inst_held is not None: ownership["institutionalOwnership"] = inst_held
        insiders_held = _safe_float(info.get("heldPercentInsiders"), scale=100)
        if insiders_held is not None: ownership["insiderOwnership"] = insiders_held
        shares_out = _safe_int(info.get("sharesOutstanding"))
        if shares_out: ownership["sharesOutstanding"] = shares_out
        float_shares = _safe_int(info.get("floatShares"))
        if float_shares: ownership["floatShares"] = float_shares

        # ── COMPANY PROFILE ──
        profile: Dict[str, Any] = {
            "name": str(info.get("longName") or info.get("shortName") or s_upper),
            "description": str(info.get("longBusinessSummary") or ""),
            "sector": str(info.get("sector") or ""),
            "industry": str(info.get("industry") or ""),
            "country": str(info.get("country") or ""),
            "headquarters": f"{info.get('city', '')}, {info.get('country', '')}".strip(", "),
            "website": str(info.get("website") or ""),
            "exchange": str(info.get("exchange") or ""),
            "currency": str(info.get("currency") or "USD"),
            "fullTimeEmployees": _safe_int(info.get("fullTimeEmployees")),
            "isin": info.get("isin") or None
        }

        # ── ANALYST CONSENSUS ──
        analyst: Dict[str, Any] = {}
        target_mean = _safe_float(info.get("targetMeanPrice"))
        if target_mean is not None: analyst["targetPrice"] = target_mean
        target_high = _safe_float(info.get("targetHighPrice"))
        if target_high is not None: analyst["targetHigh"] = target_high
        target_low = _safe_float(info.get("targetLowPrice"))
        if target_low is not None: analyst["targetLow"] = target_low
        analyst_count = _safe_int(info.get("numberOfAnalystOpinions"))
        if analyst_count: analyst["analystCount"] = analyst_count
        reco_key = info.get("recommendationKey")
        if reco_key: analyst["consensus"] = str(reco_key).upper().replace("_", " ")
        reco_mean = _safe_float(info.get("recommendationMean"))
        if reco_mean is not None: analyst["recommendationScore"] = reco_mean

        current_px = _safe_float(info.get("currentPrice") or info.get("regularMarketPrice") or info.get("previousClose"))
        if target_mean and current_px and current_px > 0:
            analyst["upsidePercent"] = round(((target_mean - current_px) / current_px) * 100, 2)

        # ── NEWS FEED (REAL PROVIDER ONLY) ──
        news_items: List[Dict[str, Any]] = []
        try:
            raw_news = getattr(ticker, "news", None) or []
            if isinstance(raw_news, list):
                for item in raw_news[:6]:
                    news_items.append({
                        "title": item.get("title") or item.get("headline"),
                        "publisher": item.get("publisher") or item.get("source"),
                        "link": item.get("link") or item.get("url"),
                        "publishTime": _format_ts(item.get("providerPublishTime")) or str(item.get("publishedAt") or "")
                    })
        except Exception:
            pass

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
            "source": "Yahoo Finance Institutional Feed",
            "asOf": str(info.get("mostRecentQuarter") or "Latest Available"),
            "fundamentals": fundamentals if fundamentals else None,
            "valuation": valuation if valuation else None,
            "dividends": dividends if dividends else None,
            "risk": risk if risk else None,
            "cashFlow": cash_flow if cash_flow else None,
            "earnings": earnings if earnings else None,
            "ownership": ownership if ownership else None,
            "profile": profile if profile.get("description") or profile.get("sector") else None,
            "analystConsensus": analyst if analyst else None,
            "news": news_items if news_items else None,
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
