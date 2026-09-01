from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User, FinancialProfile
from app.services.risk_engine import compute_risk_profile

router = APIRouter(prefix="/risk", tags=["Risk Assessment Engine"])

class RiskRecalibratePayload(BaseModel):
    age: Optional[int] = 30
    horizon_years: Optional[int] = 10
    market_drop_reaction: Optional[str] = "Buy More"
    experience: Optional[str] = "Intermediate"

@router.get("/profile")
def get_user_risk_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(FinancialProfile).filter(FinancialProfile.user_id == current_user.id).first()
    
    age = profile.age if (profile and profile.age is not None) else 30
    income = profile.monthly_income if (profile and profile.monthly_income is not None) else 0.0
    expenses = profile.monthly_expenses if (profile and profile.monthly_expenses is not None) else 0.0
    savings = profile.existing_savings if (profile and profile.existing_savings is not None) else 0.0
    exp = profile.investment_experience if (profile and profile.investment_experience) else "Intermediate"

    return compute_risk_profile(
        age=age,
        monthly_income=income,
        monthly_expenses=expenses,
        existing_savings=savings,
        horizon_years=10,
        market_drop_reaction="Buy More",
        experience=exp
    )

@router.post("/evaluate")
def evaluate_risk_profile(
    payload: RiskRecalibratePayload,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(FinancialProfile).filter(FinancialProfile.user_id == current_user.id).first()
    income = profile.monthly_income if (profile and profile.monthly_income is not None) else 0.0
    expenses = profile.monthly_expenses if (profile and profile.monthly_expenses is not None) else 0.0
    savings = profile.existing_savings if (profile and profile.existing_savings is not None) else 0.0

    result = compute_risk_profile(
        age=payload.age or (profile.age if profile and profile.age else 30),
        monthly_income=income,
        monthly_expenses=expenses,
        existing_savings=savings,
        horizon_years=payload.horizon_years or 10,
        market_drop_reaction=payload.market_drop_reaction or "Buy More",
        experience=payload.experience or "Intermediate"
    )

    # Persist updated risk tolerance back to profile
    if profile:
        profile.risk_tolerance = result["category"]
        db.commit()

    return result
