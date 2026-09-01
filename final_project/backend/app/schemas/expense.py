from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime

class ExpenseCreate(BaseModel):
    category: str = Field(..., pattern="^(Rent|Food|Transportation|Entertainment|Shopping|Bills|Healthcare|Other)$")
    amount: float = Field(..., gt=0)
    date: str
    description: str = Field(..., min_length=2, max_length=150)
    is_recurring: bool = False

class ExpenseResponse(BaseModel):
    id: int
    user_id: int
    category: str
    amount: float
    date: str
    description: str
    is_recurring: bool
    created_at: datetime

    class Config:
        from_attributes = True

class ExpenseAnalytics(BaseModel):
    total_monthly_spending: float
    budget_50_30_20: Dict[str, Any] # Needs (50%), Wants (30%), Savings (20%)
    category_breakdown: List[Dict[str, Any]]
    spending_trends: List[Dict[str, Any]]
    savings_opportunities: List[str]
