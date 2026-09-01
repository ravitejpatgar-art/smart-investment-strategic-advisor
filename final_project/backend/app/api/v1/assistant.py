from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User, FinancialProfile
from app.api.deps import oauth2_scheme
from jose import jwt, JWTError
from app.core.config import settings
from app.services.ai_assistant import generate_ai_assistant_response

router = APIRouter(prefix="/assistant", tags=["AI Financial Assistant"])

class ChatPayload(BaseModel):
    query: Optional[str] = None
    question: Optional[str] = None
    message: Optional[str] = None
    requestId: Optional[str] = None
    request_id: Optional[str] = None
    userContext: Optional[Dict[str, Any]] = None
    user_context: Optional[Dict[str, Any]] = None
    history: Optional[List[Dict[str, Any]]] = None

@router.post("/chat")
def chat_with_assistant(
    payload: ChatPayload,
    db: Session = Depends(get_db),
    token: Optional[str] = Depends(oauth2_scheme)
):
    ctx = dict(payload.userContext or payload.user_context or {})
    if token and not ctx.get("monthly_surplus") and not ctx.get("investableSurplus"):
        try:
            payload_jwt = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
            user_id = payload_jwt.get("sub")
            if user_id:
                profile = db.query(FinancialProfile).filter(FinancialProfile.user_id == int(user_id)).first()
                if profile:
                    surplus = max(0.0, (profile.monthly_income or 0.0) - (profile.monthly_expenses or 0.0))
                    ctx["monthly_surplus"] = surplus
                    ctx["monthly_income"] = profile.monthly_income or 0.0
                    ctx["monthly_expenses"] = profile.monthly_expenses or 0.0
                    ctx["risk_profile"] = profile.risk_tolerance or "Moderate"
                    ctx["risk_score"] = profile.risk_score or 70
                    ctx["emergency_fund"] = profile.existing_savings or 0.0
        except Exception:
            pass

    query_text = (payload.question or payload.message or "").strip()
    if not query_text:
        query_text = "What is an ETF?"

    from app.services.ai import process_conversational_query
    res = process_conversational_query(
        query=query_text,
        user_context=ctx,
        history=payload.history,
        request_id=payload.requestId
    )
    ans = res.get("answer") or res.get("response") or ""
    res["answer"] = ans
    res["response"] = ans
    if res.get("contextMode") == "PERSONALIZED":
        res["user_context"] = ctx
    return res

@router.get("/suggestions")
def get_prompt_suggestions():
    return [
        {"prompt": "Where should I invest my monthly surplus?", "category": "Investment"},
        {"prompt": "Why did you choose these investments?", "category": "Explainability"},
        {"prompt": "Can I afford a ₹10 lakh car?", "category": "Affordability"},
        {"prompt": "How can I reach ₹1 crore?", "category": "Goal Roadmap"}
    ]
