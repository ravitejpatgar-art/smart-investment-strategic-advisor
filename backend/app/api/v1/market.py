from fastapi import APIRouter, Query, Depends, HTTPException, status, Header
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
from app.services.market_data.technical_analysis import calculate_technical_indicators

from app.services.market_data.providers.universe_sync_engine import universe_sync_engine

router = APIRouter(prefix="/market", tags=["Production Market Data Engine"])

@router.get("/coverage")
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

@router.get("/instruments")
def list_market_instruments(
    q: Optional[str] = Query(None, description="Search query across symbol, name, alias, ISIN"),
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

    return instrument_master.search(
        query=q,
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
    quote = market_registry.get_quote(instrument["symbol"])
    instrument_copy["quote"] = quote

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

    # ── 2. Get quote (isolated failure) ──
    quote = None
    has_quote = False
    try:
        q = market_registry.get_quote(actual_symbol)
        quote = q
        has_quote = bool(q and q.get("price") is not None)
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
    etf_data     = research_data.get("etfData")
    mf_data      = research_data.get("mfData")

    # ── 4. Get technical indicators from 1Y candles ──
    technicals = None
    try:
        candles_res = market_registry.get_candles(actual_symbol, interval="1d", range_period="1y")
        if candles_res and candles_res.get("observations"):
            technicals = calculate_technical_indicators(candles_res["observations"])
    except Exception:
        technicals = None

    # ── 5. Build capabilities from actual data (not hardcoded true) ──
    has_exp_ratio = (
        bool(instrument_data and instrument_data.get("expenseRatio"))
        or bool(etf_data and etf_data.get("expenseRatio"))
        or bool(mf_data and mf_data.get("expenseRatio"))
    )
    capabilities: Dict[str, bool] = {
        "hasQuote":           has_quote,
        "hasHistorical":      instrument_data is not None,
        "hasFundamentals":    bool(fundamentals),
        "hasValuation":       bool(valuation),
        "hasDividends":       bool(dividends),
        "hasRisk":            bool(risk),
        "hasETFData":         bool(etf_data),
        "hasMFData":          bool(mf_data),
        "hasExpenseRatio":    has_exp_ratio,
        "hasAUM":             bool((etf_data or mf_data or {}).get("aum")),
        "hasBenchmark":       bool(instrument_data and instrument_data.get("benchmark")),
        "hasNAV":             asset_type == "MUTUAL_FUND",
        "hasFundManager":     False,
        "hasHoldings":        False,
        "hasSectorBreakdown": False,
        "hasCountryBreakdown":False,
        "hasTechnicals":      bool(technicals and technicals.get("available")),
        "hasPerformance":     bool(etf_data and (
            etf_data.get("ytdReturn") is not None
            or etf_data.get("threeYearReturn") is not None
        )),
    }

    return {
        "instrument":  instrument_data,
        "quote":       quote,
        "fundamentals":fundamentals,
        "valuation":   valuation,
        "dividends":   dividends,
        "risk":        risk,
        "technicals":  technicals,
        "etfData":     etf_data,
        "mfData":      mf_data,
        "capabilities":capabilities,
        "sources": {
            "quote":       quote.get("source")    if quote           else None,
            "research":    research_data.get("source"),
            "freshness":   research_data.get("freshness", "UNAVAILABLE"),
        },
    }


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

@router.get("/quote/{symbol:path}")
def get_single_quote(symbol: str):
    """Returns normalized quote for a single symbol."""
    return market_registry.get_quote(symbol)

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
