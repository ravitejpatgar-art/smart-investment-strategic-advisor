from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User, FinancialProfile
from app.schemas.profile import OnboardingPayload, FinancialProfileResponse

router = APIRouter(prefix="/onboarding", tags=["Onboarding"])

def calculate_initial_health_score(income: float, expenses: float, savings: float, risk: str) -> int:
    score = 50 # Base
    
    # Savings Rate Factor (Max +20)
    if income > 0:
        savings_rate = (income - expenses) / income
        if savings_rate >= 0.4:
            score += 20
        elif savings_rate >= 0.2:
            score += 12
        elif savings_rate > 0:
            score += 5
        else:
            score -= 15

    # Emergency Buffer Factor (Max +20)
    if expenses > 0:
        emergency_months = savings / expenses
        if emergency_months >= 6:
            score += 20
        elif emergency_months >= 3:
            score += 12
        elif emergency_months >= 1:
            score += 5
        else:
            score -= 10
            
    # Risk calibration factor (+10)
    if risk in ["Moderate", "Aggressive"]:
        score += 10
    else:
        score += 5

    return max(10, min(100, score))

@router.post("/submit", response_model=FinancialProfileResponse)
def submit_onboarding(
    payload: OnboardingPayload,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(FinancialProfile).filter(FinancialProfile.user_id == current_user.id).first()
    if not profile:
        profile = FinancialProfile(user_id=current_user.id)
        db.add(profile)
    
    # Update full name on user if supplied
    if payload.full_name:
        current_user.full_name = payload.full_name
        db.add(current_user)

    # Calculate baseline health score
    baseline_score = calculate_initial_health_score(
        payload.monthly_income,
        payload.monthly_expenses,
        payload.existing_savings,
        payload.risk_tolerance
    )

    profile.age = payload.age
    profile.occupation = payload.occupation
    profile.monthly_income = payload.monthly_income
    profile.monthly_expenses = payload.monthly_expenses
    profile.existing_savings = payload.existing_savings
    profile.existing_investments = payload.existing_investments or 0.0
    profile.financial_goal = payload.financial_goal or "Wealth Creation & Early Independence"
    profile.investment_horizon = payload.investment_horizon or "5-10 Years"
    profile.investment_experience = payload.investment_experience
    profile.risk_tolerance = payload.risk_tolerance
    profile.risk_score = payload.risk_score or 75
    profile.primary_goals = payload.primary_goals
    profile.onboarding_completed = True
    profile.baseline_health_score = baseline_score

    db.commit()
    db.refresh(profile)
    return profile
