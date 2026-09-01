from pydantic import BaseModel
from typing import List, Dict, Any

class EmergencyFundStatus(BaseModel):
    monthly_expenses: float
    target_months: int # Standard 6
    required_fund: float
    current_fund: float
    gap: float
    runway_months: float
    status: str # "Healthy" | "Moderate" | "Critical"
    status_color: str
    recommendation: str
    recommended_allocation: List[Dict[str, Any]]
    monthly_sip_to_bridge_gap: float # 6-month target
