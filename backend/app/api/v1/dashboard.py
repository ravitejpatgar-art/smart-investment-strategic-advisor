from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User, FinancialProfile
from app.models.expense import Expense
from app.models.portfolio import PortfolioHolding
from app.models.goal import Goal
from app.services.health_engine import compute_financial_health_score
from app.services.stock_engine import get_stock_data

router = APIRouter(prefix="/dashboard", tags=["Dashboard Summary"])

@router.get("/summary")
def get_dashboard_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(FinancialProfile).filter(FinancialProfile.user_id == current_user.id).first()
    expenses_records = db.query(Expense).filter(Expense.user_id == current_user.id).all()
    holdings_records = db.query(PortfolioHolding).filter(PortfolioHolding.user_id == current_user.id).all()
    goals_records = db.query(Goal).filter(Goal.user_id == current_user.id).all()

    income = profile.monthly_income if (profile and profile.monthly_income is not None) else 0.0
    
    # Authoritative expenses: use logged expenses sum if available, else profile value
    logged_expenses_sum = sum(e.amount for e in expenses_records)
    if logged_expenses_sum > 0:
        expenses = logged_expenses_sum
    else:
        expenses = profile.monthly_expenses if (profile and profile.monthly_expenses is not None) else 0.0

    savings = profile.existing_savings if (profile and profile.existing_savings is not None) else 0.0
    
    # Calculate real portfolio values
    total_portfolio_value = 0.0
    total_invested = 0.0
    for h in holdings_records:
        stock_info = get_stock_data(h.symbol)
        curr_p = stock_info.get("currentPrice", h.avg_buy_price)
        inv_val = h.shares * h.avg_buy_price
        curr_val = h.shares * curr_p
        total_invested += inv_val
        total_portfolio_value += curr_val

    total_pnl = total_portfolio_value - total_invested
    total_pnl_percentage = (total_pnl / total_invested * 100.0) if total_invested > 0 else 0.0

    # Calculate health score
    health_data = compute_financial_health_score(
        monthly_income=income,
        monthly_expenses=expenses,
        existing_savings=savings,
        total_investments=total_portfolio_value,
        active_goals_count=len(goals_records)
    )

    monthly_surplus = income - expenses
    savings_rate = (monthly_surplus / income * 100.0) if income > 0 and monthly_surplus > 0 else 0.0
    emergency_runway_months = round(savings / expenses, 1) if expenses > 0 else 0.0

    return {
        "user": {
            "name": current_user.full_name,
            "email": current_user.email,
            "role": current_user.role,
            "age": profile.age if profile else None,
            "occupation": profile.occupation if profile else None,
            "risk_tolerance": profile.risk_tolerance if profile else "Moderate",
            "investment_experience": profile.investment_experience if profile else "Intermediate",
            "onboarding_completed": profile.onboarding_completed if profile else False
        },
        "financials": {
            "net_worth": savings + total_portfolio_value,
            "liquid_savings": savings,
            "monthly_income": income,
            "monthly_expenses": expenses,
            "monthly_surplus": monthly_surplus,
            "monthly_savings": max(0.0, monthly_surplus),
            "savings_rate": round(savings_rate, 1),
            "emergency_runway_months": emergency_runway_months,
            "total_portfolio_value": round(total_portfolio_value, 2),
            "total_invested": round(total_invested, 2),
            "total_pnl": round(total_pnl, 2),
            "total_pnl_percentage": round(total_pnl_percentage, 2)
        },
        "health_score": health_data,
        "market_indices": [
            {"symbol": "NIFTY 50", "name": "NSE NIFTY 50", "price": 24830.40, "change": 142.60, "changePercent": 0.58, "exchange": "NSE"},
            {"symbol": "SENSEX", "name": "BSE SENSEX", "price": 81380.20, "change": 465.10, "changePercent": 0.57, "exchange": "BSE"},
            {"symbol": "NASDAQ", "name": "NASDAQ Composite", "price": 18240.10, "change": 195.40, "changePercent": 1.08, "exchange": "US"},
            {"symbol": "GOLD", "name": "Gold 24K (10g)", "price": 74850.00, "change": 320.00, "changePercent": 0.43, "exchange": "MCX"}
        ]
    }
