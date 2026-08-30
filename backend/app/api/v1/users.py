from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User, FinancialProfile
from app.schemas.auth import UserResponse
from app.schemas.profile import FinancialProfileResponse, ProfileUpdatePayload

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.get("/me/profile", response_model=FinancialProfileResponse)
def get_my_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(FinancialProfile).filter(FinancialProfile.user_id == current_user.id).first()
    if not profile:
        profile = FinancialProfile(user_id=current_user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    
    # Attach full_name dynamically
    resp = FinancialProfileResponse.model_validate(profile)
    resp.full_name = current_user.full_name
    return resp

@router.put("/me/profile", response_model=FinancialProfileResponse)
@router.patch("/me/profile", response_model=FinancialProfileResponse)
def update_my_profile(
    payload: ProfileUpdatePayload,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # 1. Update user full_name if provided
    if payload.full_name is not None and payload.full_name.strip():
        current_user.full_name = payload.full_name.strip()
        current_user.updated_at = datetime.utcnow()
        db.add(current_user)

    # 2. Get or create financial profile
    profile = db.query(FinancialProfile).filter(FinancialProfile.user_id == current_user.id).first()
    if not profile:
        profile = FinancialProfile(user_id=current_user.id)
        db.add(profile)

    # 3. Update fields if provided
    if payload.age is not None:
        profile.age = payload.age
    if payload.occupation is not None:
        profile.occupation = payload.occupation
    if payload.monthly_income is not None:
        profile.monthly_income = payload.monthly_income
    if payload.monthly_expenses is not None:
        profile.monthly_expenses = payload.monthly_expenses
    if payload.existing_savings is not None:
        profile.existing_savings = payload.existing_savings
    if payload.existing_investments is not None:
        profile.existing_investments = payload.existing_investments
    if payload.financial_goal is not None:
        profile.financial_goal = payload.financial_goal
    if payload.investment_horizon is not None:
        profile.investment_horizon = payload.investment_horizon
    if payload.investment_experience is not None:
        profile.investment_experience = payload.investment_experience
    if payload.risk_tolerance is not None:
        profile.risk_tolerance = payload.risk_tolerance
    if payload.risk_score is not None:
        profile.risk_score = payload.risk_score
    if payload.primary_goals is not None:
        profile.primary_goals = payload.primary_goals

    profile.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(profile)
    db.refresh(current_user)

    resp = FinancialProfileResponse.model_validate(profile)
    resp.full_name = current_user.full_name
    return resp
