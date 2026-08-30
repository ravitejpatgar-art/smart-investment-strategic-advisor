from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class OnboardingPayload(BaseModel):
    # Step 1: Personal Info
    full_name: Optional[str] = None
    age: int = Field(..., ge=18, le=100)
    occupation: str = Field(..., min_length=2)
    
    # Step 2: Financial Snapshot
    monthly_income: float = Field(..., ge=0)
    monthly_expenses: float = Field(..., ge=0)
    existing_savings: float = Field(..., ge=0)
    existing_investments: Optional[float] = Field(default=0.0, ge=0)
    
    # Step 3: Goals & Horizon
    financial_goal: Optional[str] = "Wealth Creation & Early Independence"
    investment_horizon: Optional[str] = "5-10 Years"
    
    # Step 4: Investment Experience & Risk Tolerance
    investment_experience: str = Field("Beginner", pattern="^(Beginner|Intermediate|Advanced)$")
    risk_tolerance: str = Field("Moderate", pattern="^(Conservative|Moderate|Aggressive)$")
    risk_score: Optional[int] = Field(default=75, ge=0, le=100)
    
    # Step 5: Goals List
    primary_goals: List[str] = Field(default_factory=list)

class ProfileUpdatePayload(BaseModel):
    full_name: Optional[str] = None
    age: Optional[int] = None
    occupation: Optional[str] = None
    monthly_income: Optional[float] = None
    monthly_expenses: Optional[float] = None
    existing_savings: Optional[float] = None
    existing_investments: Optional[float] = None
    financial_goal: Optional[str] = None
    investment_horizon: Optional[str] = None
    investment_experience: Optional[str] = None
    risk_tolerance: Optional[str] = None
    risk_score: Optional[int] = None
    primary_goals: Optional[List[str]] = None

class FinancialProfileResponse(BaseModel):
    id: int
    user_id: int
    full_name: Optional[str] = None
    age: Optional[int]
    occupation: Optional[str]
    monthly_income: float
    monthly_expenses: float
    existing_savings: float
    existing_investments: Optional[float] = 0.0
    financial_goal: Optional[str] = None
    investment_horizon: Optional[str] = None
    investment_experience: str
    risk_tolerance: str
    risk_score: Optional[int] = 75
    primary_goals: List[str]
    onboarding_completed: bool
    baseline_health_score: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
