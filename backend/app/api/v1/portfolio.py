from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from typing import List, Optional
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.portfolio import PortfolioHolding
from app.services.stock_engine import get_stock_data

router = APIRouter(prefix="/portfolio", tags=["Portfolio Tracker"])

class HoldingCreate(BaseModel):
    symbol: str
    name: str
    asset_class: str = "Indian Stocks"
    shares: float = Field(..., gt=0)
    avg_buy_price: float = Field(..., gt=0)
    notes: Optional[str] = None

@router.get("")
def get_portfolio(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    holdings = db.query(PortfolioHolding).filter(PortfolioHolding.user_id == current_user.id).all()

    # Calculate real-time holding values
    holdings_data = []
    total_value = 0.0
    total_invested = 0.0

    for h in holdings:
        stock_info = get_stock_data(h.symbol)
        curr_p = stock_info.get("currentPrice", h.avg_buy_price * 1.1)
        inv_val = h.shares * h.avg_buy_price
        curr_val = h.shares * curr_p
        pnl = curr_val - inv_val
        pnl_pct = (pnl / inv_val * 100.0) if inv_val > 0 else 0.0

        total_value += curr_val
        total_invested += inv_val

        holdings_data.append({
            "id": h.id,
            "symbol": h.symbol,
            "name": h.name,
            "assetClass": h.asset_class,
            "shares": h.shares,
            "avgBuyPrice": h.avg_buy_price,
            "currentPrice": curr_p,
            "investedValue": inv_val,
            "currentValue": curr_val,
            "pnl": pnl,
            "pnlPercentage": round(pnl_pct, 2),
            "allocationPercentage": 0.0 # Will compute below
        })

    # Compute allocation weights
    for item in holdings_data:
        item["allocationPercentage"] = round((item["currentValue"] / total_value * 100.0), 1) if total_value > 0 else 0.0

    total_pnl = total_value - total_invested
    total_pnl_pct = (total_pnl / total_invested * 100.0) if total_invested > 0 else 0.0

    # Sector Diversification score (0 - 100)
    asset_counts = len(set(h["assetClass"] for h in holdings_data))
    diversification_score = min(100, asset_counts * 22)

    return {
        "summary": {
            "total_portfolio_value": total_value,
            "total_invested": total_invested,
            "total_pnl": total_pnl,
            "total_pnl_percentage": round(total_pnl_pct, 2),
            "holdings_count": len(holdings_data),
            "diversification_score": diversification_score
        },
        "holdings": holdings_data
    }

@router.post("/holdings", status_code=status.HTTP_201_CREATED)
def add_holding(
    payload: HoldingCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    holding = PortfolioHolding(
        user_id=current_user.id,
        symbol=payload.symbol.upper(),
        name=payload.name,
        asset_class=payload.asset_class,
        shares=payload.shares,
        avg_buy_price=payload.avg_buy_price,
        notes=payload.notes
    )
    db.add(holding)
    db.commit()
    db.refresh(holding)
    return holding

@router.delete("/holdings/{holding_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_holding(
    holding_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    holding = db.query(PortfolioHolding).filter(PortfolioHolding.id == holding_id, PortfolioHolding.user_id == current_user.id).first()
    if not holding:
        raise HTTPException(status_code=404, detail="Holding not found")
    db.delete(holding)
    db.commit()
    return None
