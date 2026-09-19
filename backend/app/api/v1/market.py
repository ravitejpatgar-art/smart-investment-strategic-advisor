from fastapi import APIRouter, Query, Depends, HTTPException, status, Header, Request
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user, get_current_user_optional
from app.models.user import User
from app.models.watchlist import WatchlistItem
from app.services.market_data.registry import market_registry
from app.services.market_data.instrument_master import instrument_master
from app.services.market_data.market_hours import get_indian_market_status, get_us_market_status
from app.services.market_data.fundamentals import get_enhanced_fundamentals
from app.services.market_data.technical_analysis import calculate_technical_indicators, compute_market_research_signal
from app.services.market_data.validator import validate_quote_compatibility, validate_price_sanity
from app.services.market_data.normalizer import create_unavailable_quote
from app.models.instrument import Instrument


from app.services.market_data.providers.universe_sync_engine import universe_sync_engine

router = APIRouter(prefix="/market", tags=["Production Market Data Engine"])

@router.get("/coverage")
@router.get("/instruments/summary")
def get_market_coverage(db: Session = Depends(get_db)):
    """
    Returns authentic database-backed dynamic coverage metrics:
    Total instruments, breakdown by asset type, active exchanges, countries, and last sync timestamp.
    """
    return instrument_master.get_coverage(db=db)

@router.get("/sync/status")
def get_universe_sync_status():
    """Returns the latest telemetry and statistics from the universe sync engine."""
    return universe_sync_engine.get_sync_status()

@router.post("/sync")
def trigger_universe_sync(
    sync_eodhd: bool = Query(True, description="Sync EODHD global universe if configured"),
    sync_nse: bool = Query(True, description="Sync NSE listed equities & ETFs"),
    sync_amfi: bool = Query(True, description="Sync AMFI Indian mutual fund schemes"),
    sync_secret: Optional[str] = Header(None, alias="X-Sync-Secret"),
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """
    Triggers an authenticated or secret-protected synchronization of the global instrument master.
    Protected against unrestricted public scraping.
    """
    from app.core.config import settings
    # Verify authorization: current logged-in user OR valid sync secret OR dev environment
    is_authorized = (
        current_user is not None
        or (sync_secret and (sync_secret == settings.UNIVERSE_SYNC_SECRET or sync_secret == settings.SECRET_KEY))
        or (settings.ENVIRONMENT == "development" and not settings.UNIVERSE_SYNC_SECRET)
    )

    if not is_authorized:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unauthorized. Provide a valid authentication token or X-Sync-Secret header."
        )

    stats = universe_sync_engine.run_full_sync(
        db=db,
        sync_eodhd=sync_eodhd,
        sync_nse=sync_nse,
        sync_amfi=sync_amfi
    )
    return stats

@router.get("/search")
@router.get("/instruments")
def list_market_instruments(
    request: Request,
    q: Optional[str] = Query(None, description="Search query across symbol, name, alias, ISIN"),
    query: Optional[str] = Query(None, description="Alias for q"),
    search: Optional[str] = Query(None, description="Alias for q"),
    asset_type: Optional[str] = Query(None, description="Filter: STOCK, ETF, MUTUAL_FUND, INDEX, COMMODITY, ALL"),
    market: Optional[str] = Query(None, description="Filter: INDIA, US, GLOBAL, ALL"),
    exchange: Optional[str] = Query(None, description="Filter: NSE, BSE, NASDAQ, NYSE, AMFI, LSE, MCX, ALL"),
    country: Optional[str] = Query(None, description="Filter: IN, US, TW, GB, NL, JP, ALL"),
    currency: Optional[str] = Query(None, description="Filter: INR, USD, GBP, EUR, ALL"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(25, ge=1, le=100, description="Items per page (max 100)"),
    db: Session = Depends(get_db)
):
    """
    Broad Marketplace Instrument Directory & Search.
    Supports full provider-backed universe with real live quote snapshots and server-side pagination.
    """
    if limit < 1 or limit > 100:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Pagination limit must be between 1 and 100."
        )

    search_term = (
        query
        or q
        or search
        or request.query_params.get("query")
        or request.query_params.get("q")
        or request.query_params.get("search")
        or ""
    ).strip()

    return instrument_master.search(
        query=search_term if search_term else None,
        asset_type=asset_type,
        market=market,
        exchange=exchange,
        country=country,
        currency=currency,
        page=page,
        limit=limit,
        db=db
    )

@router.get("/instruments/{canonicalId:path}")
def get_instrument_detail(canonicalId: str):
    """
    Returns rich metadata, current real quote, and historical availability for an instrument.
    """
    instrument = instrument_master.get_instrument_by_id(canonicalId)
    if not instrument:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Instrument '{canonicalId}' not found in market universe."
        )

    instrument_copy = dict(instrument)
    quote = market_registry.get_quote(instrument["symbol"], asset_type=instrument.get("assetType"))
    is_compat, reason = validate_quote_compatibility(instrument, quote)
    if is_compat:
        instrument_copy["quote"] = quote
    else:
        instrument_copy["quote"] = create_unavailable_quote(instrument["symbol"], reason)

    try:
        fundamentals = market_registry.get_fundamentals(instrument["symbol"])
        instrument_copy["fundamentals"] = fundamentals
    except Exception:
        instrument_copy["fundamentals"] = None

    return instrument_copy


@router.get("/research/{symbol:path}")
def get_instrument_research(
    symbol: str,
    db: Session = Depends(get_db)
):
    """
    Returns a capability-aware, normalized research bundle for any instrument.

    Individual provider failures are isolated — a fundamentals failure does NOT
    cause the endpoint to return HTTP 500. Quote, chart, and metadata remain
    available even when research providers fail.

    The 'capabilities' dict is computed from *actual* available data fields,
    never hardcoded to True.
    """
    clean_symbol = symbol.strip()

    # ── 1. Resolve instrument from master (optional) ──
    instrument_data = None
    try:
        instrument_data = instrument_master.get_instrument_by_id(clean_symbol, db=db)
    except Exception:
        pass

    # Determine the symbol to pass to providers
    actual_symbol = instrument_data["symbol"] if instrument_data else clean_symbol
    asset_type = instrument_data.get("assetType", "STOCK") if instrument_data else "STOCK"

    # ── 2. Get quote (isolated failure with compatibility validation) ──
    quote = None
    has_quote = False
    try:
        q = market_registry.get_quote(actual_symbol, asset_type=asset_type)
        is_compat, _ = validate_quote_compatibility(instrument_data or {"assetType": asset_type, "symbol": actual_symbol}, q)
        if is_compat and q and q.get("price") is not None:
            quote = q
            has_quote = True
    except Exception:
        pass

    # ── 3. Get research data (isolated failure) ──
    research_data: Dict[str, Any] = {}
    try:
        research_data = get_enhanced_fundamentals(actual_symbol, asset_type=asset_type)
    except Exception:
        research_data = {"freshness": "UNAVAILABLE", "message": "Research data provider unavailable."}

    fundamentals = research_data.get("fundamentals")
    valuation    = research_data.get("valuation")
    dividends    = research_data.get("dividends")
    risk         = research_data.get("risk")
    cash_flow    = research_data.get("cashFlow")
    earnings     = research_data.get("earnings")
    ownership    = research_data.get("ownership")
    profile      = research_data.get("profile")
    analyst      = research_data.get("analystConsensus")
    news         = research_data.get("news")
    etf_data     = research_data.get("etfData")
    mf_data      = research_data.get("mfData")

    # ── 4. Get technical indicators from deepest verified candles for long-term engine ──
    technicals = None
    is_mf_quote = (
        (asset_type or "").upper() in ["MUTUAL_FUND", "MF"]
        or actual_symbol.upper().startswith("AMFI:")
        or actual_symbol.upper().startswith("MF:")
        or (actual_symbol.isdigit() and len(actual_symbol) in (5, 6))
    )
    target_range = "max" if is_mf_quote else "5y"
    try:
        candles_res = market_registry.get_candles(actual_symbol, interval="1d", range_period=target_range, asset_type=asset_type)
        if not candles_res or not candles_res.get("observations"):
            candles_res = market_registry.get_candles(actual_symbol, interval="1d", range_period="1y", asset_type=asset_type)
        if candles_res and candles_res.get("observations"):
            technicals = calculate_technical_indicators(candles_res["observations"])
    except Exception:
        technicals = None

    # ── 5. Market Research Signal Computation (Transparent, Rule-Based) ──
    research_signal = compute_market_research_signal(
        technicals=technicals,
        fundamentals=fundamentals,
        valuation=valuation,
        asset_type=asset_type
    )

    # ── 5b. Institutional AI Signal & Research Engine (Multi-Horizon & Targets) ──
    from app.services.market_data.signal_engine import market_signal_engine
    institutional_signal = None
    try:
        institutional_signal = market_signal_engine.get_signal_for_instrument(
            symbol=actual_symbol,
            asset_type=asset_type,
            quote=quote,
            technicals=technicals,
            fundamentals=fundamentals,
            valuation=valuation,
            etf_data=etf_data,
            mf_data=mf_data,
            candles=candles_res.get("observations") if (candles_res and isinstance(candles_res, dict)) else None,
            db=db
        )
    except Exception:
        institutional_signal = None

    # ── 6. Build capabilities from actual data (not hardcoded true) ──
    has_exp_ratio = (
        bool(instrument_data and instrument_data.get("expenseRatio"))
        or bool(etf_data and etf_data.get("expenseRatio"))
        or bool(mf_data and mf_data.get("expenseRatio"))
    )
    capabilities: Dict[str, bool] = {
        "hasQuote":               has_quote,
        "hasHistorical":          instrument_data is not None,
        "hasFundamentals":        bool(fundamentals),
        "hasValuation":           bool(valuation),
        "dividends":              bool(dividends),
        "hasDividends":           bool(dividends),
        "hasRisk":                bool(risk),
        "hasCashFlow":            bool(cash_flow),
        "hasEarnings":            bool(earnings),
        "hasOwnership":           bool(ownership),
        "hasProfile":             bool(profile),
        "hasAnalyst":             bool(analyst),
        "hasNews":                bool(news and len(news) > 0),
        "hasResearchSignal":      bool(research_signal and research_signal.get("signal") != "INSUFFICIENT DATA"),
        "hasInstitutionalSignal": bool(institutional_signal),
        "hasPriceTargets":        bool(institutional_signal and institutional_signal.get("priceTargets")),
        "hasETFData":             bool(etf_data),
        "hasMFData":              bool(mf_data),
        "hasExpenseRatio":        has_exp_ratio,
        "hasAUM":                 bool((etf_data or mf_data or {}).get("aum")),
        "hasBenchmark":           bool(instrument_data and instrument_data.get("benchmark")),
        "hasNAV":                 asset_type == "MUTUAL_FUND",
        "hasFundManager":         False,
        "hasHoldings":            False,
        "hasSectorBreakdown":     False,
        "hasCountryBreakdown":    False,
        "hasTechnicals":          bool(technicals and technicals.get("available")),
        "hasPerformance":         bool(etf_data and (
            etf_data.get("ytdReturn") is not None
            or etf_data.get("threeYearReturn") is not None
        )),
    }

    return {
        "instrument":           instrument_data,
        "quote":                quote,
        "fundamentals":         fundamentals,
        "valuation":            valuation,
        "dividends":            dividends,
        "risk":                 risk,
        "cashFlow":             cash_flow,
        "earnings":             earnings,
        "ownership":            ownership,
        "profile":              profile,
        "analystConsensus":     analyst,
        "news":                 news,
        "researchSignal":       research_signal,
        "institutionalSignal":  institutional_signal,
        "priceTargets":         institutional_signal.get("priceTargets") if institutional_signal else None,
        "technicals":           technicals,
        "etfData":              etf_data,
        "mfData":               mf_data,
        "capabilities":         capabilities,
        "sources": {
            "quote":       quote.get("source")    if quote           else None,
            "research":    research_data.get("source"),
            "freshness":   research_data.get("freshness", "UNAVAILABLE"),
        },
    }


@router.get("/signals/{symbol:path}")
def get_instrument_signals(
    symbol: str,
    db: Session = Depends(get_db)
):
    """
    Dedicated Institutional AI Signal & Price Targets endpoint.
    Returns multi-horizon signals (Short-Term, Swing, Long-Term), confidence scores,
    VestIQ institutional research panels, and price targets.
    """
    clean_symbol = symbol.strip()
    instrument_data = None
    try:
        instrument_data = instrument_master.get_instrument_by_id(clean_symbol, db=db)
    except Exception:
        pass

    actual_symbol = instrument_data["symbol"] if instrument_data else clean_symbol
    asset_type = instrument_data.get("assetType", "STOCK") if instrument_data else "STOCK"

    if not instrument_data:
        from app.services.market_data.mutual_funds import MutualFundsProvider
        mf_info = MutualFundsProvider().resolve_scheme(clean_symbol)
        if mf_info:
            actual_symbol = mf_info["code"]
            asset_type = "MUTUAL_FUND"

    quote = None
    try:
        q = market_registry.get_quote(actual_symbol, asset_type=asset_type)
        is_compat, _ = validate_quote_compatibility(instrument_data or {"assetType": asset_type, "symbol": actual_symbol}, q)
        if is_compat and q and q.get("price") is not None:
            quote = q
    except Exception:
        pass

    research_data = {}
    try:
        research_data = get_enhanced_fundamentals(actual_symbol, asset_type=asset_type)
    except Exception:
        pass

    technicals = None
    candles_obs = None
    is_mf_signal = (
        (asset_type or "").upper() in ["MUTUAL_FUND", "MF"]
        or actual_symbol.upper().startswith("AMFI:")
        or actual_symbol.upper().startswith("MF:")
        or (actual_symbol.isdigit() and len(actual_symbol) in (5, 6))
    )
    target_range = "max" if is_mf_signal else "5y"
    try:
        candles_res = market_registry.get_candles(actual_symbol, interval="1d", range_period=target_range, asset_type=asset_type)
        if not candles_res or not candles_res.get("observations"):
            candles_res = market_registry.get_candles(actual_symbol, interval="1d", range_period="1y", asset_type=asset_type)
        if candles_res and candles_res.get("observations"):
            candles_obs = candles_res["observations"]
            technicals = calculate_technical_indicators(candles_obs)
    except Exception:
        pass

    from app.services.market_data.signal_engine import market_signal_engine
    return market_signal_engine.get_signal_for_instrument(
        symbol=actual_symbol,
        asset_type=asset_type,
        quote=quote,
        technicals=technicals,
        fundamentals=research_data.get("fundamentals"),
        valuation=research_data.get("valuation"),
        etf_data=research_data.get("etfData"),
        mf_data=research_data.get("mfData"),
        candles=candles_obs,
        db=db
    )



@router.get("/watchlist")
def get_user_watchlist(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns the authenticated user's isolated watchlist with live quotes.
    """
    items = db.query(WatchlistItem).filter(WatchlistItem.user_id == current_user.id).order_by(WatchlistItem.created_at.desc()).all()
    results = []
    for item in items:
        instrument = instrument_master.get_instrument_by_id(item.instrument_id)
        if instrument:
            inst_copy = dict(instrument)
            try:
                inst_copy["quote"] = market_registry.get_quote(instrument["symbol"])
            except Exception:
                inst_copy["quote"] = None
            inst_copy["watchlistedAt"] = item.created_at.isoformat()
            results.append(inst_copy)
    return results

@router.post("/watchlist/{canonicalId:path}")
def add_to_watchlist(
    canonicalId: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Adds an instrument to the authenticated user's watchlist.
    """
    instrument = instrument_master.get_instrument_by_id(canonicalId)
    if not instrument:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Instrument '{canonicalId}' not found."
        )

    c_id = instrument["canonicalId"]
    existing = db.query(WatchlistItem).filter(
        WatchlistItem.user_id == current_user.id,
        WatchlistItem.instrument_id == c_id
    ).first()

    if not existing:
        new_item = WatchlistItem(user_id=current_user.id, instrument_id=c_id)
        db.add(new_item)
        db.commit()
        db.refresh(new_item)

    return {"status": "SUCCESS", "message": f"Added {instrument['name']} to watchlist.", "canonicalId": c_id}

@router.delete("/watchlist/{canonicalId:path}")
def remove_from_watchlist(
    canonicalId: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Removes an instrument from the authenticated user's watchlist.
    """
    instrument = instrument_master.get_instrument_by_id(canonicalId)
    target_id = instrument["canonicalId"] if instrument else canonicalId

    item = db.query(WatchlistItem).filter(
        WatchlistItem.user_id == current_user.id,
        WatchlistItem.instrument_id == target_id
    ).first()

    if item:
        db.delete(item)
        db.commit()

    return {"status": "SUCCESS", "message": f"Removed {target_id} from watchlist."}

@router.get("/quote")
@router.get("/quote/{symbol:path}")
def get_single_quote(
    request: Request,
    symbol: Optional[str] = "",
    ticker: Optional[str] = Query(None, description="Alias for symbol"),
    query: Optional[str] = Query(None, description="Alias for symbol"),
    instrument: Optional[str] = Query(None, description="Alias for symbol")
):
    """Returns normalized quote for a single symbol (via path parameter or query parameter)."""
    target = (symbol or "").strip()
    if not target:
        target = (
            request.query_params.get("symbol")
            or ticker
            or query
            or instrument
            or ""
        ).strip()
    return market_registry.get_quote(target)

@router.get("/quotes")
def get_multiple_quotes(symbols: str = Query(..., description="Comma separated list of symbols")):
    """Returns batch normalized quotes for multiple symbols."""
    sym_list = [s.strip() for s in symbols.split(",") if s.strip()]
    return market_registry.get_quotes(sym_list)

@router.get("/candles/{symbol:path}")
def get_instrument_candles(
    symbol: str,
    interval: str = Query("1d", description="Interval: 1d, 1wk, 1mo"),
    range: str = Query("1mo", description="Range: 5d, 1mo, 3mo, 6mo, 1y, 3y, 5y")
):
    """Returns authentic historical observations / NAV series."""
    return market_registry.get_candles(symbol, interval=interval, range_period=range)

@router.get("/status/{market}")
def get_market_trading_status(market: str):
    """Returns market trading status (NSE, BSE, NASDAQ, NYSE)."""
    m = market.upper().strip()
    if m in ["IN", "NSE", "BSE", "INDIA"]:
        return get_indian_market_status()
    return get_us_market_status()

@router.get("/fundamentals/{symbol:path}")
def get_fundamentals(symbol: str):
    """Returns fundamental ratios and balance sheet metrics."""
    return market_registry.get_fundamentals(symbol)

@router.get("/overview")
def get_market_overview():
    """Returns real market index quotes, movers, and status."""
    return market_registry.get_market_overview()

@router.get("/movers")
def get_market_movers():
    """Returns top gainers, losers, and active assets."""
    data = market_registry.get_market_overview()
    return {
        "gainers": data.get("top_gainers", []),
        "losers": data.get("top_losers", []),
        "trending": data.get("top_gainers", [])
    }

@router.get("/heatmap")
def get_sector_heatmap():
    """Returns sector performance."""
    data = market_registry.get_market_overview()
    return data.get("sector_heatmap", [])

@router.get("/capabilities")
def get_provider_capabilities():
    """Returns provider capability and entitlement matrix."""
    return market_registry.get_capability_matrix()

@router.get("/angel/status")
def get_angel_provider_status():
    """
    Returns authentic, safe observability metrics for Angel One SmartAPI in production:
    - Variable presence (SET / NOT_SET, never secrets)
    - Authentication status
    - Session active status
    - Scrip master loaded status
    - Provider readiness
    - Telemetry counts (totalRequests, successCount, errorCount, fallbackCount)
    """
    from app.services.market_data.providers.angel_provider import angel_provider
    from app.services.market_data.providers.angel_scrip_master import angel_scrip_master
    from app.services.market_data.router import provider_router

    tracker = provider_router.health_trackers.get("Angel One SmartAPI")

    return {
        "provider": "Angel One SmartAPI",
        "configured": angel_provider.is_configured,
        "variables": angel_provider.get_credentials_status(),
        "authentication": {
            "status": angel_provider.connection_status,
            "sessionActive": bool(angel_provider.jwt_token and angel_provider.feed_token),
            "websocketConnected": angel_provider.is_connected,
            "reconnectCount": angel_provider.reconnect_count
        },
        "scripMaster": {
            "totalLoaded": angel_scrip_master.total_loaded,
            "lastLoadedAt": angel_scrip_master.last_loaded_at,
            "status": "READY" if angel_scrip_master.total_loaded > 0 else "EMPTY"
        },
        "providerReady": bool(angel_provider.is_configured and angel_provider.jwt_token and angel_scrip_master.total_loaded > 0),
        "telemetry": {
            "routerTracker": tracker.to_dict() if tracker else {},
            "providerInternal": {
                "totalRequests": angel_provider.total_requests,
                "successCount": angel_provider.success_count,
                "errorCount": angel_provider.error_count,
                "fallbackCount": angel_provider.fallback_count
            }
        }
    }

@router.get("/data-integrity/india")
def get_india_data_integrity(
    sample_size: int = Query(25, ge=5, le=100, description="Number of Indian instruments to sample for live quote testing"),
    db: Session = Depends(get_db)
):
    """
    Diagnostic endpoint that audits Indian market coverage and quotes:
    - totalIndianInstruments, totalStocks, totalETFs, totalMutualFunds
    - validQuotes, invalidQuotes, realtimeQuotes, delayedQuotes, staleQuotes, unavailableQuotes
    - mutualFundsUsingAngel (must be 0)
    - etfsUsingAngel
    - stocksUsingAngel
    - providerMismatches
    - timestampIssues
    - sample failures / suspect quotes with reasons
    - sample successes with resolved token and actual provider-returned price
    """
    total_in = db.query(Instrument).filter((Instrument.country == "IN") | (Instrument.market == "INDIA") | (Instrument.currency == "INR")).count()
    total_stocks = db.query(Instrument).filter(((Instrument.country == "IN") | (Instrument.market == "INDIA")) & (Instrument.asset_type == "STOCK")).count()
    total_etfs = db.query(Instrument).filter(((Instrument.country == "IN") | (Instrument.market == "INDIA")) & (Instrument.asset_type == "ETF")).count()
    total_mfs = db.query(Instrument).filter(Instrument.asset_type == "MUTUAL_FUND").count()

    # Priority instruments to always verify
    core_test_symbols = [
        ("RELIANCE", "STOCK", "NSE"),
        ("TCS", "STOCK", "NSE"),
        ("INFY", "STOCK", "NSE"),
        ("HDFCBANK", "STOCK", "NSE"),
        ("ICICIBANK", "STOCK", "NSE"),
        ("SBIN", "STOCK", "NSE"),
        ("ITC", "STOCK", "NSE"),
        ("LT", "STOCK", "NSE"),
        ("BHARTIARTL", "STOCK", "NSE"),
        ("ADANIENT", "STOCK", "NSE"),
        ("MON100", "ETF", "NSE"),
        ("NIFTYBEES", "ETF", "NSE"),
        ("GOLDBEES", "ETF", "NSE"),
        ("BANKBEES", "ETF", "NSE"),
        ("JUNIORBEES", "ETF", "NSE"),
        ("AMFI:135001", "MUTUAL_FUND", "AMFI"),
        ("AMFI:118955", "MUTUAL_FUND", "AMFI"),
    ]

    instruments_to_test = []
    seen_symbols = set()

    for sym, atype, exch in core_test_symbols:
        inst = db.query(Instrument).filter(
            (Instrument.symbol == sym) |
            (Instrument.symbol == f"{sym}.NS") |
            (Instrument.ticker == sym) |
            (Instrument.canonical_id == sym) |
            (Instrument.scheme_code == sym.replace("AMFI:", ""))
        ).first()
        if inst:
            instruments_to_test.append(inst)
            seen_symbols.add(inst.symbol)
        else:
            # Instrument representation for testing
            instruments_to_test.append(Instrument(
                symbol=sym,
                canonical_id=f"{exch}:{sym}",
                asset_type=atype,
                exchange=exch,
                currency="INR",
                name=sym
            ))
            seen_symbols.add(sym)

    # Sample additional instruments if sample_size > len(instruments_to_test)
    needed = max(0, sample_size - len(instruments_to_test))
    if needed > 0:
        extra_stocks = db.query(Instrument).filter(
            ((Instrument.country == "IN") | (Instrument.market == "INDIA")) &
            (Instrument.asset_type == "STOCK") &
            (Instrument.is_active == True) &
            (~Instrument.symbol.in_(seen_symbols))
        ).limit(needed // 3 + 1).all()

        extra_etfs = db.query(Instrument).filter(
            ((Instrument.country == "IN") | (Instrument.market == "INDIA")) &
            (Instrument.asset_type == "ETF") &
            (Instrument.is_active == True) &
            (~Instrument.symbol.in_(seen_symbols))
        ).limit(needed // 3 + 1).all()

        extra_mfs = db.query(Instrument).filter(
            (Instrument.asset_type == "MUTUAL_FUND") &
            (Instrument.is_active == True) &
            (~Instrument.symbol.in_(seen_symbols))
        ).limit(needed // 3 + 1).all()

        for it in (extra_stocks + extra_etfs + extra_mfs):
            if len(instruments_to_test) >= sample_size:
                break
            if it.symbol not in seen_symbols:
                instruments_to_test.append(it)
                seen_symbols.add(it.symbol)

    valid_quotes = 0
    invalid_quotes = 0
    realtime_quotes = 0
    delayed_quotes = 0
    stale_quotes = 0
    unavailable_quotes = 0
    mutual_funds_using_angel = 0
    etfs_using_angel = 0
    stocks_using_angel = 0
    provider_mismatches = 0
    timestamp_issues = 0
    sample_failures = []
    sample_successes = []

    for inst in instruments_to_test:
        inst_dict = {
            "symbol": inst.symbol,
            "assetType": inst.asset_type,
            "exchange": inst.exchange,
            "currency": inst.currency or "INR",
            "name": inst.name
        }
        q = market_registry.get_quote(inst.symbol, asset_type=inst.asset_type)
        is_compat, compat_reason = validate_quote_compatibility(inst_dict, q)
        quality, suspect_reason = validate_price_sanity(q, inst_dict)

        src = (q.get("provider") or q.get("source") or "").upper()
        q_exch = (q.get("exchange") or "").upper()
        fr = (q.get("freshness") or "").upper()

        if inst.asset_type == "MUTUAL_FUND":
            if "ANGEL" in src or q_exch in ["NSE", "BSE"]:
                mutual_funds_using_angel += 1
                provider_mismatches += 1
        elif inst.asset_type == "ETF":
            if "ANGEL" in src:
                etfs_using_angel += 1
            if "AMFI" in src or q_exch == "AMFI":
                provider_mismatches += 1
        elif inst.asset_type == "STOCK":
            if "ANGEL" in src:
                stocks_using_angel += 1
            if "AMFI" in src or q_exch == "AMFI":
                provider_mismatches += 1

        # Freshness counters
        if fr in ("REALTIME", "LIVE"):
            realtime_quotes += 1
        elif fr in ("DELAYED",):
            delayed_quotes += 1
        elif fr in ("UNAVAILABLE",):
            unavailable_quotes += 1

        if q.get("isStale"):
            stale_quotes += 1

        # Timestamp checks
        has_pts = q.get("providerTimestamp") is not None
        has_ets = q.get("exchangeTimestamp") is not None
        has_ts = q.get("timestamp") is not None
        if not (has_pts or has_ets or has_ts):
            timestamp_issues += 1

        # Determine quote validity
        p_val = q.get("price")
        is_valid = (
            is_compat and
            quality != "INVALID" and
            p_val is not None and
            float(p_val) > 0 and
            fr != "UNAVAILABLE"
        )

        if is_valid:
            valid_quotes += 1
            sample_successes.append({
                "symbol": inst.symbol,
                "assetType": inst.asset_type,
                "exchange": q.get("exchange"),
                "tradingSymbol": q.get("tradingsymbol"),
                "token": q.get("token"),
                "provider": q.get("provider") or q.get("source"),
                "ltp": q.get("price"),
                "providerTimestamp": q.get("providerTimestamp"),
                "exchangeTimestamp": q.get("exchangeTimestamp"),
                "freshness": q.get("freshness"),
                "identityCheck": "PASS",
                "dataQuality": q.get("dataQuality") or quality
            })
        else:
            invalid_quotes += 1
            sample_failures.append({
                "symbol": inst.symbol,
                "assetType": inst.asset_type,
                "exchange": inst.exchange,
                "price": p_val,
                "reason": compat_reason if not is_compat else (suspect_reason or f"Freshness: {fr}"),
                "provider": q.get("provider") or q.get("source")
            })

    return {
        "status": "PASS" if invalid_quotes == 0 and mutual_funds_using_angel == 0 and provider_mismatches == 0 else "WARNING",
        "totalIndianInstruments": total_in,
        "totalStocks": total_stocks,
        "totalETFs": total_etfs,
        "totalMutualFunds": total_mfs,
        "sampleSizeChecked": len(instruments_to_test),
        "validQuotes": valid_quotes,
        "invalidQuotes": invalid_quotes,
        "realtimeQuotes": realtime_quotes,
        "delayedQuotes": delayed_quotes,
        "staleQuotes": stale_quotes,
        "unavailableQuotes": unavailable_quotes,
        "mutualFundsUsingAngel": mutual_funds_using_angel,
        "etfsUsingAngel": etfs_using_angel,
        "stocksUsingAngel": stocks_using_angel,
        "providerMismatches": provider_mismatches,
        "timestampIssues": timestamp_issues,
        "sampleFailures": sample_failures,
        "sampleSuccesses": sample_successes
    }



@router.get("/health")
def get_market_health():
    """Returns market data engine health status."""
    return market_registry.get_health_status()

@router.get("/providers/health")
def get_provider_health():
    """Returns granular health metrics across all configured quote providers."""
    health_data = market_registry.get_health_status()
    return {
        "status": health_data.get("status", "HEALTHY"),
        "providers": health_data.get("providers", []),
        "cache": health_data.get("cache", {})
    }

@router.get("/telemetry")
def get_market_telemetry(db: Session = Depends(get_db)):
    """
    Returns unified production market data telemetry:
    Catalog coverage counts, provider health metrics, cache statistics, sync status, and market hours.
    """
    coverage = instrument_master.get_coverage(db=db)
    sync_status = universe_sync_engine.get_sync_status(db=db)
    health_data = market_registry.get_health_status()

    return {
        "catalog": coverage,
        "sync": sync_status,
        "health": health_data,
        "market_hours": health_data.get("market_hours", {}),
        "cache": health_data.get("cache", {})
    }


@router.get("/websocket/coverage")
@router.get("/angel/websocket/coverage")
def get_websocket_coverage():
    """
    Returns granular, audit-grade live WebSocket coverage metrics for Indian Stocks & ETFs.
    Strictly verifies genuine SmartWebSocketV2 ticks, connection pools, and session-aware freshness.
    """
    from app.services.market_data.providers.angel_provider import angel_provider
    return angel_provider.get_websocket_coverage_report()


@router.post("/websocket/subscribe-universe")
def subscribe_websocket_universe(mode: int = Query(1, description="Subscription mode (1=LTP, 2=Quote)")):
    """
    Subscribes the full Indian stock + ETF universe across Angel One SmartWebSocketV2 connections in LTP mode.
    """
    from app.services.market_data.providers.angel_provider import angel_provider
    return angel_provider.subscribe_universe(mode=mode)

