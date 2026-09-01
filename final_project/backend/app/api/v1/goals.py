from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from typing import List, Optional
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.goal import Goal
from app.services.goal_engine import calculate_goal_projection

router = APIRouter(prefix="/goals", tags=["Goal Planner"])

class GoalCreate(BaseModel):
    title: str
    category: str = "Wealth Creation"
    target_amount: float = Field(..., gt=0)
    current_amount: float = Field(0.0, ge=0)
    target_date: str
    risk_profile: str = "Moderate"

class GoalCalculatePayload(BaseModel):
    target_amount: float
    current_amount: Optional[float] = 0.0
    time_horizon_years: Optional[int] = 10
    risk_profile: Optional[str] = "Moderate"
    annual_inflation_rate: Optional[float] = 6.0

@router.get("")
def get_user_goals(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    goals = db.query(Goal).filter(Goal.user_id == current_user.id).all()
    return goals

@router.post("", status_code=status.HTTP_201_CREATED)
def create_goal(
    payload: GoalCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Calculate initial SIP requirements
    projection = calculate_goal_projection(
        target_amount=payload.target_amount,
        current_amount=payload.current_amount,
        time_horizon_years=5,
        risk_profile=payload.risk_profile
    )

    goal = Goal(
        user_id=current_user.id,
        title=payload.title,
        category=payload.category,
        target_amount=payload.target_amount,
        current_amount=payload.current_amount,
        target_date=payload.target_date,
        risk_profile=payload.risk_profile,
        monthly_sip_required=projection["required_monthly_sip"],
        probability=projection["probability"]
    )
    db.add(goal)
    db.commit()
    db.refresh(goal)
    return goal

@router.delete("/{goal_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_goal(
    goal_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    goal = db.query(Goal).filter(Goal.id == goal_id, Goal.user_id == current_user.id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    db.delete(goal)
    db.commit()
    return None

@router.post("/calculate")
def calculate_goal_simulator(payload: GoalCalculatePayload):
    return calculate_goal_projection(
        target_amount=payload.target_amount,
        current_amount=payload.current_amount or 0.0,
        time_horizon_years=payload.time_horizon_years or 10,
        risk_profile=payload.risk_profile or "Moderate",
        annual_inflation_rate=payload.annual_inflation_rate or 6.0
    )
