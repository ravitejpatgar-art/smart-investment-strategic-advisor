from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User, FinancialProfile
from app.schemas.emergency import EmergencyFundStatus

router = APIRouter(prefix="/emergency-fund", tags=["Emergency Fund Analyzer"])

@router.get("", response_model=EmergencyFundStatus)
def get_emergency_fund_status(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(FinancialProfile).filter(FinancialProfile.user_id == current_user.id).first()
    
    monthly_expenses = profile.monthly_expenses if (profile and profile.monthly_expenses is not None) else 0.0
    current_savings = profile.existing_savings if (profile and profile.existing_savings is not None) else 0.0
    
    # Standard 6-month formula
    target_months = 6
    required_fund = monthly_expenses * target_months
    gap = max(0.0, required_fund - current_savings)
    runway_months = round(current_savings / monthly_expenses, 1) if monthly_expenses > 0 else 0.0

    if runway_months >= 6.0:
        status = "Healthy"
        status_color = "emerald"
        recommendation = "Your emergency runway exceeds the 6-month safety benchmark. You can deploy any excess liquidity into equity SIPs and sovereign gold bonds."
    elif runway_months >= 3.0:
        status = "Moderate"
        status_color = "amber"
        recommendation = f"You have {runway_months} months of liquidity. Direct surplus savings toward high-yield liquid funds to reach the full 6-month target of ₹{required_fund:,.0f}."
    else:
        status = "Critical"
        status_color = "rose"
        recommendation = "Emergency Warning: Liquid reserves are critically below 3 months. Pause non-essential equity purchases and build your liquid safety buffer immediately."

    # Optimal Liquid Asset Distribution Mix for Emergency Fund
    recommended_allocation = [
        {"instrument": "High-Yield Savings / Sweep-in FD", "percentage": 40, "amount": required_fund * 0.40, "purpose": "Instant ATM / T+0 Access"},
        {"instrument": "Arbitrage / Liquid Mutual Funds", "percentage": 40, "amount": required_fund * 0.40, "purpose": "Tax-efficient 7.2% Yield with T+1 Liquidity"},
        {"instrument": "Short-Term Multi-Bank FDs", "percentage": 20, "amount": required_fund * 0.20, "purpose": "Guaranteed DICGC Insured Capital"}
    ]

    # Required monthly contribution to bridge gap in 6 months
    monthly_sip_to_bridge = gap / 6.0 if gap > 0 else 0.0

    return {
        "monthly_expenses": monthly_expenses,
        "target_months": target_months,
        "required_fund": required_fund,
        "current_fund": current_savings,
        "gap": gap,
        "runway_months": runway_months,
        "status": status,
        "status_color": status_color,
        "recommendation": recommendation,
        "recommended_allocation": recommended_allocation,
        "monthly_sip_to_bridge_gap": monthly_sip_to_bridge
    }
