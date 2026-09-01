from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from app.services.ai import process_conversational_query

router = APIRouter(prefix="/ai", tags=["SmartVest AI Assistant"])

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
def chat_with_ai(payload: ChatPayload):
    """
    Primary SmartVest AI Advisory Chat Endpoint:
    POST /api/v1/ai/chat
    Payload: { query / question / message, history, userContext / user_context, requestId }
    Response: { answer, calculations, followUps, requestId, intent, entities }
    """
    query_text = (payload.query or payload.question or payload.message or "").strip()
    if not query_text:
        query_text = "What is an ETF?"

    ctx = payload.userContext if payload.userContext is not None else payload.user_context
    req_id = payload.requestId or payload.request_id

    return process_conversational_query(
        query=query_text,
        user_context=ctx,
        history=payload.history,
        request_id=req_id
    )

@router.get("/suggestions")
def get_ai_suggestions():
    return [
        {"prompt": "Suggest me some US stocks", "category": "Stock Screening"},
        {"prompt": "Where should I invest my monthly surplus?", "category": "Investment"},
        {"prompt": "What is an ETF?", "category": "Education"},
        {"prompt": "How much SIP for ₹1 crore?", "category": "Goal Planning"},
        {"prompt": "Can I afford a ₹10 lakh car?", "category": "Affordability"}
    ]
