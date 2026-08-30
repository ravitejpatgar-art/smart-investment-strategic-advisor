from fastapi import APIRouter, HTTPException, Query
from app.services.stock_engine import get_stock_data, POPULAR_STOCKS

router = APIRouter(prefix="/stocks", tags=["Stock Research Platform"])

@router.get("/search")
def search_stocks(q: str = Query("", description="Ticker or company name")):
    if not q:
        return POPULAR_STOCKS
    q_lower = q.lower().strip()
    results = [
        s for s in POPULAR_STOCKS 
        if q_lower in s["symbol"].lower() or q_lower in s["name"].lower()
    ]
    if not results and len(q) >= 2:
        # Dynamically create lookup placeholder for unlisted search query
        results.append({
            "symbol": q.upper(),
            "name": f"{q.upper()} Global Asset",
            "exchange": "NSE" if q.upper().endswith(".NS") else "NASDAQ",
            "assetClass": "Indian Stocks" if q.upper().endswith(".NS") else "US Stocks"
        })
    return results

@router.get("/{symbol}")
def get_stock_analysis(symbol: str):
    data = get_stock_data(symbol)
    if not data:
        raise HTTPException(status_code=404, detail="Stock data not available")
    return data
