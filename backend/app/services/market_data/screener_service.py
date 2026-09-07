import logging
from typing import Dict, Any, List, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import or_
from concurrent.futures import ThreadPoolExecutor

from app.models.instrument import Instrument
from app.core.database import SessionLocal
from app.services.market_data.cache import market_cache
from app.services.market_data.registry import market_registry
from app.services.market_data.fundamentals import get_enhanced_fundamentals
from app.services.market_data.technical_analysis import calculate_technical_indicators
from app.services.market_data.freshness import DataFreshness
from app.schemas.market_screener import ScreenerFilterParams, ScreenerResultItem, ScreenerResponse

logger = logging.getLogger(__name__)


# List of canonical tracking fields used for data coverage % computation
EVALUATED_METRICS = [
    "price", "change_pct", "market_cap", "pe_ratio", "forward_pe",
    "pb_ratio", "ps_ratio", "ev_ebitda", "peg", "revenue_growth",
    "eps_growth", "roe", "roa", "roce", "gross_margin",
    "operating_margin", "net_margin", "debt_equity", "current_ratio",
    "quick_ratio", "free_cash_flow", "operating_cash_flow",
    "dividend_yield", "fifty_two_week_high", "rsi"
]


class StockScreenerService:
    """
    Institutional Stock Screener Engine for SmartVest.
    Executes multi-factor filtering, ranking, data-completeness scoring,
    and server-side pagination over genuine normalized market data.
    """

    @classmethod
    def apply_preset(cls, params: ScreenerFilterParams) -> ScreenerFilterParams:
        """Translates neutral preset names into concrete filter criteria."""
        if not params.preset:
            return params

        preset = params.preset.strip().lower()
        # Make a copy of params to avoid mutating input directly
        p_dict = params.model_dump(by_alias=True)

        if preset == "large_cap":
            p_dict["marketCapMin"] = 10_000_000_000.0  # 10B+
        elif preset == "high_growth":
            p_dict["revenueGrowthMin"] = 10.0
            p_dict["epsGrowthMin"] = 10.0
        elif preset == "high_roe":
            p_dict["roeMin"] = 15.0
        elif preset == "low_pe":
            p_dict["peMin"] = 0.01
            p_dict["peMax"] = 20.0
        elif preset == "low_debt":
            p_dict["debtEquityMax"] = 0.5
        elif preset == "strong_fcf":
            p_dict["freeCashFlowMin"] = 0.01
        elif preset == "dividend_stocks":
            p_dict["dividendYieldMin"] = 2.0
        elif preset == "momentum":
            p_dict["priceAboveSma200"] = True
            p_dict["rsiMin"] = 50.0
        elif preset == "oversold":
            p_dict["rsiMax"] = 35.0
        elif preset == "near_52w_high":
            p_dict["distFrom52wHighMin"] = -5.0  # within 5% of high
        elif preset == "near_52w_low":
            p_dict["distFrom52wLowMax"] = 5.0   # within 5% of low

        return ScreenerFilterParams.model_validate(p_dict)

    @classmethod
    def execute_screen(
        cls,
        params: ScreenerFilterParams,
        db: Optional[Session] = None
    ) -> ScreenerResponse:
        """
        Executes screener query across supported stock instruments.
        """
        # 1. Apply Preset Filters if present
        effective_params = cls.apply_preset(params)

        close_db = False
        if db is None:
            db = SessionLocal()
            close_db = True

        try:
            # 2. Database level candidate selection
            query_builder = db.query(Instrument).filter(Instrument.is_active == True)

            # Restrict to STOCK asset type
            raw_asset = (effective_params.asset_type or "STOCK").strip().upper()
            if raw_asset in ["STOCK", "STOCKS", "EQUITY"]:
                query_builder = query_builder.filter(Instrument.asset_type.in_(["STOCK", "EQUITY"]))
            elif raw_asset != "ALL":
                query_builder = query_builder.filter(Instrument.asset_type == raw_asset)

            # Metadata Filters in SQL
            if effective_params.country and effective_params.country.upper() != "ALL":
                query_builder = query_builder.filter(Instrument.country == effective_params.country.upper())

            if effective_params.exchange and effective_params.exchange.upper() != "ALL":
                query_builder = query_builder.filter(Instrument.exchange == effective_params.exchange.upper())

            if effective_params.currency and effective_params.currency.upper() != "ALL":
                query_builder = query_builder.filter(Instrument.currency == effective_params.currency.upper())

            if effective_params.sector and effective_params.sector.upper() != "ALL":
                query_builder = query_builder.filter(Instrument.sector.ilike(f"%{effective_params.sector}%"))

            if effective_params.industry and effective_params.industry.upper() != "ALL":
                query_builder = query_builder.filter(Instrument.industry.ilike(f"%{effective_params.industry}%"))

            if effective_params.q:
                q_clean = effective_params.q.strip()
                query_builder = query_builder.filter(
                    or_(
                        Instrument.symbol.ilike(f"%{q_clean}%"),
                        Instrument.name.ilike(f"%{q_clean}%"),
                        Instrument.ticker.ilike(f"%{q_clean}%")
                    )
                )

            # Check if any numerical/technical filter is active
            filter_checks = [
                effective_params.market_cap_min, effective_params.market_cap_max,
                effective_params.pe_min, effective_params.pe_max,
                effective_params.forward_pe_min, effective_params.forward_pe_max,
                effective_params.pb_min, effective_params.pb_max,
                effective_params.ps_min, effective_params.ps_max,
                effective_params.ev_ebitda_min, effective_params.ev_ebitda_max,
                effective_params.ev_revenue_min, effective_params.ev_revenue_max,
                effective_params.peg_min, effective_params.peg_max,
                effective_params.revenue_growth_min, effective_params.revenue_growth_max,
                effective_params.eps_growth_min, effective_params.eps_growth_max,
                effective_params.roe_min, effective_params.roe_max,
                effective_params.roa_min, effective_params.roa_max,
                effective_params.roce_min, effective_params.roce_max,
                effective_params.roic_min, effective_params.roic_max,
                effective_params.gross_margin_min, effective_params.gross_margin_max,
                effective_params.operating_margin_min, effective_params.operating_margin_max,
                effective_params.net_margin_min, effective_params.net_margin_max,
                effective_params.debt_equity_min, effective_params.debt_equity_max,
                effective_params.current_ratio_min, effective_params.current_ratio_max,
                effective_params.quick_ratio_min, effective_params.quick_ratio_max,
                effective_params.net_debt_min, effective_params.net_debt_max,
                effective_params.free_cash_flow_min, effective_params.free_cash_flow_max,
                effective_params.operating_cash_flow_min, effective_params.operating_cash_flow_max,
                effective_params.capex_min, effective_params.capex_max,
                effective_params.dividend_yield_min, effective_params.dividend_yield_max,
                effective_params.annual_dividend_min, effective_params.annual_dividend_max,
                effective_params.payout_ratio_min, effective_params.payout_ratio_max,
                effective_params.price_min, effective_params.price_max,
                effective_params.change_pct_min, effective_params.change_pct_max,
                effective_params.fifty_two_week_high_min, effective_params.fifty_two_week_high_max,
                effective_params.fifty_two_week_low_min, effective_params.fifty_two_week_low_max,
                effective_params.dist_from_52w_high_min, effective_params.dist_from_52w_high_max,
                effective_params.dist_from_52w_low_min, effective_params.dist_from_52w_low_max,
                effective_params.volume_min, effective_params.volume_max,
                effective_params.rsi_min, effective_params.rsi_max,
                effective_params.trend, effective_params.price_above_sma200,
                effective_params.sma50_above_sma200, effective_params.freshness
            ]
            active_filters_count = sum(1 for f in filter_checks if f is not None)

            # Cap maximum candidate scans to prevent N+1 provider flooding
            safe_page = max(1, effective_params.page)
            safe_limit = max(1, min(effective_params.limit, 100))

            # Database-backed sort columns
            db_sort_columns = {
                "name": Instrument.name,
                "symbol": Instrument.symbol,
                "exchange": Instrument.exchange,
                "country": Instrument.country,
                "sector": Instrument.sector,
                "industry": Instrument.industry,
                "currency": Instrument.currency,
                "id": Instrument.id
            }

            def resolve_item(inst: Instrument) -> Optional[ScreenerResultItem]:
                try:
                    return cls._build_screener_item(inst)
                except Exception as exc:
                    logger.warning(f"[Screener] Failed to resolve {inst.symbol}: {exc}")
                    return None

            # Fast direct database pagination when no financial/technical range filters are active
            if active_filters_count == 0:
                total_sql_count = query_builder.count()
                total_pages = max(1, (total_sql_count + safe_limit - 1) // safe_limit)

                if effective_params.sort in db_sort_columns:
                    order_col = db_sort_columns[effective_params.sort]
                    if effective_params.order.lower() == "desc":
                        query_builder = query_builder.order_by(order_col.desc())
                    else:
                        query_builder = query_builder.order_by(order_col.asc())
                else:
                    query_builder = query_builder.order_by(Instrument.id.asc())

                page_candidates = query_builder.offset((safe_page - 1) * safe_limit).limit(safe_limit).all()

                page_items: List[ScreenerResultItem] = []
                if page_candidates:
                    with ThreadPoolExecutor(max_workers=min(3, len(page_candidates))) as executor:
                        hydrated = list(executor.map(resolve_item, page_candidates))
                        page_items = [it for it in hydrated if it is not None]

                # If non-db sort was requested (e.g. marketCap, peRatio), sort the page items
                if effective_params.sort not in db_sort_columns:
                    page_items = cls._sort_items(
                        page_items,
                        sort_field=effective_params.sort,
                        order=effective_params.order
                    )

                return ScreenerResponse(
                    items=page_items,
                    total=total_sql_count,
                    page=safe_page,
                    limit=safe_limit,
                    total_pages=total_pages,
                    has_next=((safe_page * safe_limit) < total_sql_count),
                    has_prev=(safe_page > 1),
                    applied_preset=effective_params.preset,
                    active_filters_count=0
                )

            # Batched candidate retrieval and multi-factor evaluation
            BATCH_SIZE = 25
            filtered_items: List[ScreenerResultItem] = []

            # Apply DB-level sorting to candidate query if requested
            if effective_params.sort in db_sort_columns:
                order_col = db_sort_columns[effective_params.sort]
                if effective_params.order.lower() == "desc":
                    candidate_query = query_builder.order_by(order_col.desc())
                else:
                    candidate_query = query_builder.order_by(order_col.asc())
            else:
                candidate_query = query_builder.order_by(Instrument.id.asc())

            offset = 0
            while True:
                batch_candidates = candidate_query.offset(offset).limit(BATCH_SIZE).all()
                if not batch_candidates:
                    break

                with ThreadPoolExecutor(max_workers=min(3, len(batch_candidates))) as executor:
                    hydrated_items = list(executor.map(resolve_item, batch_candidates))

                for it in hydrated_items:
                    if it is not None and cls._matches_filters(it, effective_params):
                        filtered_items.append(it)

                offset += len(batch_candidates)
                if len(batch_candidates) < BATCH_SIZE:
                    break

            # 5. Server-Side Sorting (Null values at the bottom for both asc and desc)
            sorted_items = cls._sort_items(
                filtered_items,
                sort_field=effective_params.sort,
                order=effective_params.order
            )

            # 6. Bounded Server-Side Pagination
            total_count = len(sorted_items)
            total_pages = max(1, (total_count + safe_limit - 1) // safe_limit)

            start_idx = (safe_page - 1) * safe_limit
            end_idx = start_idx + safe_limit
            page_items = sorted_items[start_idx:end_idx]

            return ScreenerResponse(
                items=page_items,
                total=total_count,
                page=safe_page,
                limit=safe_limit,
                total_pages=total_pages,
                has_next=end_idx < total_count,
                has_prev=safe_page > 1,
                applied_preset=effective_params.preset,
                active_filters_count=active_filters_count
            )

        finally:
            if close_db:
                db.close()

    @classmethod
    def _build_screener_item(cls, inst: Instrument) -> ScreenerResultItem:
        """Extracts genuine market, fundamental, valuation, and technical data for an instrument."""
        sym = inst.symbol.upper().strip()

        # 0. Check Screener Item Cache
        item_cache_key = f"screener:item:{sym}"
        cached_item = market_cache.get(item_cache_key, allow_stale=True)
        if cached_item:
            try:
                return ScreenerResultItem(**cached_item)
            except Exception:
                pass

        # 1. Fetch research bundle and quote
        research_bundle: Dict[str, Any] = {}
        cache_key = f"research:bundle:p75:{sym}"
        cached_bundle = market_cache.get(cache_key, allow_stale=True)
        if cached_bundle:
            research_bundle = cached_bundle
        else:
            try:
                research_bundle = get_enhanced_fundamentals(sym, asset_type=inst.asset_type)
            except Exception:
                research_bundle = {}

        quote = research_bundle.get("quote") or market_registry.get_quote(sym) or {}
        price = quote.get("price")
        change = quote.get("change")
        change_pct = quote.get("changePct")
        freshness = quote.get("freshness") or "UNAVAILABLE"
        source = quote.get("source") or "Market Feed"

        val = research_bundle.get("valuation") or {}
        fin = research_bundle.get("financials") or research_bundle.get("fundamentals") or {}
        bs = research_bundle.get("balanceSheet") or {}
        cf = research_bundle.get("cashFlow") or {}
        prof = research_bundle.get("profitability") or {}
        divs = research_bundle.get("dividends") or {}
        risk = research_bundle.get("risk") or {}
        technicals = research_bundle.get("technicals") or {}

        # Market Cap
        market_cap = val.get("marketCap") or (price * risk.get("sharesOutstanding") if (price and risk.get("sharesOutstanding")) else None)

        # 52W High / Low
        w52_h = risk.get("fiftyTwoWeekHigh") or quote.get("fiftyTwoWeekHigh")
        w52_l = risk.get("fiftyTwoWeekLow") or quote.get("fiftyTwoWeekLow")

        # Distance from 52W High / Low (%)
        dist_h = None
        if price and w52_h and w52_h > 0:
            dist_h = round(((price - w52_h) / w52_h) * 100, 2)

        dist_l = None
        if price and w52_l and w52_l > 0:
            dist_l = round(((price - w52_l) / w52_l) * 100, 2)

        # Technical Indicators
        rsi = technicals.get("rsi")
        ma_dict = technicals.get("movingAverages") or {}
        sma50 = ma_dict.get("sma50") or risk.get("fiftyDayAverage")
        sma200 = ma_dict.get("sma200") or risk.get("twoHundredDayAverage")
        trend = technicals.get("trend")
        if not trend and sma50 and sma200:
            trend = "BULLISH" if sma50 > sma200 else ("BEARISH" if sma50 < sma200 else "NEUTRAL")

        price_above_sma200 = (price > sma200) if (price is not None and sma200 is not None) else None
        sma50_above_sma200 = (sma50 > sma200) if (sma50 is not None and sma200 is not None) else None

        # Build raw candidate dictionary
        raw_dict = {
            "symbol": inst.symbol,
            "canonical_id": inst.canonical_id,
            "name": inst.name,
            "ticker": inst.ticker,
            "exchange": inst.exchange,
            "country": inst.country,
            "currency": inst.currency,
            "sector": inst.sector or (research_bundle.get("companyProfile") or {}).get("sector"),
            "industry": inst.industry or (research_bundle.get("companyProfile") or {}).get("industry"),
            "asset_type": inst.asset_type,
            "price": price,
            "change": change,
            "change_pct": change_pct,
            "market_cap": market_cap,
            "pe_ratio": val.get("peRatio") or val.get("trailingPE"),
            "forward_pe": val.get("forwardPE"),
            "pb_ratio": val.get("pbRatio") or val.get("priceToBook"),
            "ps_ratio": val.get("psRatio") or val.get("priceToSales"),
            "ev_ebitda": val.get("evEbitda") or val.get("evToEBITDA"),
            "ev_revenue": val.get("evRevenue") or val.get("enterpriseToRevenue"),
            "peg": val.get("peg") or val.get("pegRatio"),
            "revenue_growth": fin.get("revenueGrowth"),
            "eps_growth": fin.get("epsGrowth") or fin.get("earningsGrowth"),
            "roe": prof.get("roe"),
            "roa": prof.get("roa"),
            "roce": prof.get("roce"),
            "roic": prof.get("roic"),
            "gross_margin": prof.get("grossMargin") or fin.get("grossMargin"),
            "operating_margin": prof.get("operatingMargin") or fin.get("operatingMargin"),
            "net_margin": prof.get("netMargin") or fin.get("netMargin"),
            "debt_equity": bs.get("debtToEquity"),
            "current_ratio": bs.get("currentRatio"),
            "quick_ratio": bs.get("quickRatio"),
            "net_debt": bs.get("netDebt"),
            "operating_cash_flow": cf.get("operatingCashFlow"),
            "free_cash_flow": cf.get("freeCashFlow"),
            "capex": cf.get("capitalExpenditure"),
            "dividend_yield": divs.get("dividendYield") or divs.get("yield") or val.get("dividendYield"),
            "annual_dividend": divs.get("annualDividend") or val.get("annualDividend"),
            "payout_ratio": divs.get("payoutRatio"),
            "fifty_two_week_high": w52_h,
            "fifty_two_week_low": w52_l,
            "dist_from_52w_high": dist_h,
            "dist_from_52w_low": dist_l,
            "volume": quote.get("volume"),
            "rsi": rsi,
            "trend": trend,
            "sma50": sma50,
            "sma200": sma200,
            "price_above_sma200": price_above_sma200,
            "sma50_above_sma200": sma50_above_sma200,
            "freshness": freshness,
            "source": source
        }

        # Calculate Data Completeness Coverage %
        present_count = sum(1 for m in EVALUATED_METRICS if raw_dict.get(m) is not None)
        total_eval = len(EVALUATED_METRICS)
        coverage_pct = round((present_count / total_eval) * 100, 1)

        raw_dict["research_coverage"] = coverage_pct
        raw_dict["available_fields_count"] = present_count
        raw_dict["total_fields_count"] = total_eval

        result_item = ScreenerResultItem(**raw_dict)
        market_cache.set(item_cache_key, result_item.model_dump(), ttl_seconds=120)
        return result_item

    @classmethod
    def _matches_filters(cls, item: ScreenerResultItem, p: ScreenerFilterParams) -> bool:
        """
        Evaluates an item against all filter rules.
        Strict Null Safety: Any range check on a missing (None) value evaluates to False.
        """
        def check_range(val: Optional[float], min_val: Optional[float], max_val: Optional[float]) -> bool:
            if min_val is not None:
                if val is None or val < min_val:
                    return False
            if max_val is not None:
                if val is None or val > max_val:
                    return False
            return True

        # Market Cap
        if not check_range(item.market_cap, p.market_cap_min, p.market_cap_max):
            return False

        # Valuation
        if not check_range(item.pe_ratio, p.pe_min, p.pe_max):
            return False
        if not check_range(item.forward_pe, p.forward_pe_min, p.forward_pe_max):
            return False
        if not check_range(item.pb_ratio, p.pb_min, p.pb_max):
            return False
        if not check_range(item.ps_ratio, p.ps_min, p.ps_max):
            return False
        if not check_range(item.ev_ebitda, p.ev_ebitda_min, p.ev_ebitda_max):
            return False
        if not check_range(item.ev_revenue, p.ev_revenue_min, p.ev_revenue_max):
            return False
        if not check_range(item.peg, p.peg_min, p.peg_max):
            return False

        # Growth
        if not check_range(item.revenue_growth, p.revenue_growth_min, p.revenue_growth_max):
            return False
        if not check_range(item.eps_growth, p.eps_growth_min, p.eps_growth_max):
            return False

        # Profitability
        if not check_range(item.roe, p.roe_min, p.roe_max):
            return False
        if not check_range(item.roa, p.roa_min, p.roa_max):
            return False
        if not check_range(item.roce, p.roce_min, p.roce_max):
            return False
        if not check_range(item.roic, p.roic_min, p.roic_max):
            return False
        if not check_range(item.gross_margin, p.gross_margin_min, p.gross_margin_max):
            return False
        if not check_range(item.operating_margin, p.operating_margin_min, p.operating_margin_max):
            return False
        if not check_range(item.net_margin, p.net_margin_min, p.net_margin_max):
            return False

        # Balance Sheet
        if not check_range(item.debt_equity, p.debt_equity_min, p.debt_equity_max):
            return False
        if not check_range(item.current_ratio, p.current_ratio_min, p.current_ratio_max):
            return False
        if not check_range(item.quick_ratio, p.quick_ratio_min, p.quick_ratio_max):
            return False
        if not check_range(item.net_debt, p.net_debt_min, p.net_debt_max):
            return False

        # Cash Flow
        if not check_range(item.free_cash_flow, p.free_cash_flow_min, p.free_cash_flow_max):
            return False
        if not check_range(item.operating_cash_flow, p.operating_cash_flow_min, p.operating_cash_flow_max):
            return False
        if not check_range(item.capex, p.capex_min, p.capex_max):
            return False

        # Dividends
        if not check_range(item.dividend_yield, p.dividend_yield_min, p.dividend_yield_max):
            return False
        if not check_range(item.annual_dividend, p.annual_dividend_min, p.annual_dividend_max):
            return False
        if not check_range(item.payout_ratio, p.payout_ratio_min, p.payout_ratio_max):
            return False

        # Price / 52W / Volume
        if not check_range(item.price, p.price_min, p.price_max):
            return False
        if not check_range(item.change_pct, p.change_pct_min, p.change_pct_max):
            return False
        if not check_range(item.fifty_two_week_high, p.fifty_two_week_high_min, p.fifty_two_week_high_max):
            return False
        if not check_range(item.fifty_two_week_low, p.fifty_two_week_low_min, p.fifty_two_week_low_max):
            return False
        if not check_range(item.dist_from_52w_high, p.dist_from_52w_high_min, p.dist_from_52w_high_max):
            return False
        if not check_range(item.dist_from_52w_low, p.dist_from_52w_low_min, p.dist_from_52w_low_max):
            return False
        if not check_range(item.volume, p.volume_min, p.volume_max):
            return False

        # Technicals
        if not check_range(item.rsi, p.rsi_min, p.rsi_max):
            return False
        if p.trend and p.trend.upper() != "ALL":
            if not item.trend or item.trend.upper() != p.trend.upper():
                return False
        if p.price_above_sma200 is not None:
            if item.price_above_sma200 is None or item.price_above_sma200 != p.price_above_sma200:
                return False
        if p.sma50_above_sma200 is not None:
            if item.sma50_above_sma200 is None or item.sma50_above_sma200 != p.sma50_above_sma200:
                return False

        # Freshness Tier Filter
        if p.freshness and p.freshness.upper() != "ALL":
            if item.freshness.upper() != p.freshness.upper():
                return False

        return True

    @classmethod
    def _sort_items(
        cls,
        items: List[ScreenerResultItem],
        sort_field: str,
        order: str
    ) -> List[ScreenerResultItem]:
        """
        Sorts items by specified field with proper handling of None values.
        None values are always placed at the bottom.
        """
        is_desc = (order.lower() == "desc")

        # Map API field name to model attribute
        field_map = {
            "marketCap": "market_cap",
            "market_cap": "market_cap",
            "price": "price",
            "changePct": "change_pct",
            "change_pct": "change_pct",
            "peRatio": "pe_ratio",
            "pe_ratio": "pe_ratio",
            "pbRatio": "pb_ratio",
            "pb_ratio": "pb_ratio",
            "roe": "roe",
            "revenueGrowth": "revenue_growth",
            "revenue_growth": "revenue_growth",
            "epsGrowth": "eps_growth",
            "eps_growth": "eps_growth",
            "dividendYield": "dividend_yield",
            "dividend_yield": "dividend_yield",
            "debtEquity": "debt_equity",
            "debt_equity": "debt_equity",
            "freeCashFlow": "free_cash_flow",
            "free_cash_flow": "free_cash_flow",
            "rsi": "rsi",
            "researchCoverage": "research_coverage",
            "research_coverage": "research_coverage",
            "name": "name",
            "symbol": "symbol"
        }

        attr = field_map.get(sort_field, "market_cap")

        def sort_key(item: ScreenerResultItem) -> Tuple[int, Any]:
            val = getattr(item, attr, None)
            if val is None:
                # 1 = has no value (goes to bottom)
                return (1, 0)
            # 0 = has valid value
            if isinstance(val, str):
                return (0, val.lower())
            return (0, -val if is_desc else val)

        return sorted(items, key=sort_key, reverse=False)
