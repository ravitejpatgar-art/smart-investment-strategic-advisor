from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional
from datetime import datetime
import uuid

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.conversation import Conversation, ConversationMessage
from app.schemas.conversation import (
    ConversationSummary, ConversationDetail, ConversationCreate, 
    ConversationRename, ConversationPin, MessageCreate, MessageResponse
)
from app.services.title_generator import generate_conversation_title

router = APIRouter(prefix="/conversations", tags=["Conversations"])

@router.get("", response_model=List[ConversationSummary])
def list_conversations(
    q: Optional[str] = Query(None, description="Search term for title or message content"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    List all conversations for the authenticated user.
    Ordered by:
    1. is_pinned DESC (pinned first)
    2. last_message_at DESC (newest activity first)
    """
    query = db.query(Conversation).filter(Conversation.user_id == current_user.id)
    
    if q and q.strip():
        search_term = f"%{q.strip()}%"
        # Search by title or within conversation messages
        query = query.filter(
            or_(
                Conversation.title.ilike(search_term),
                Conversation.messages.any(ConversationMessage.content.ilike(search_term))
            )
        )
    
    conversations = query.order_by(
        Conversation.is_pinned.desc(),
        Conversation.last_message_at.desc(),
        Conversation.updated_at.desc()
    ).all()
    
    return conversations

@router.post("", response_model=ConversationDetail, status_code=status.HTTP_201_CREATED)
def create_conversation(
    payload: Optional[ConversationCreate] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new user-scoped conversation.
    """
    conv_id = (payload.id if payload and payload.id else None) or f"conv_{uuid.uuid4().hex[:12]}"
    
    # Verify ID is not already used
    existing = db.query(Conversation).filter(Conversation.id == conv_id).first()
    if existing:
        if existing.user_id == current_user.id:
            return existing
        conv_id = f"conv_{uuid.uuid4().hex[:12]}"
    
    title = (payload.title if payload and payload.title else "New Financial Chat").strip() or "New Financial Chat"
    
    conversation = Conversation(
        id=conv_id,
        user_id=current_user.id,
        title=title,
        is_pinned=False,
        message_count=0,
        last_message_at=datetime.utcnow(),
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    
    db.add(conversation)
    db.commit()
    db.refresh(conversation)
    return conversation

@router.get("/{id}", response_model=ConversationDetail)
def get_conversation(
    id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get conversation metadata and ordered messages for the authenticated user.
    Returns 404 if conversation does not exist or belongs to another user.
    """
    conversation = db.query(Conversation).filter(
        Conversation.id == id,
        Conversation.user_id == current_user.id
    ).first()
    
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )
    
    return conversation

@router.post("/{id}/messages", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
def add_message(
    id: str,
    payload: MessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Add a user, assistant, or system message to a conversation.
    Auto-titles the conversation if this is the first user message.
    """
    conversation = db.query(Conversation).filter(
        Conversation.id == id,
        Conversation.user_id == current_user.id
    ).first()
    
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )
    
    content = (payload.content or "").strip()
    if not content:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Message content cannot be empty"
        )
    
    msg_id = payload.id or f"msg_{uuid.uuid4().hex[:12]}"
    
    # Auto-generate title if first user message or still default title
    if payload.role == "user" and (conversation.title == "New Financial Chat" or conversation.message_count == 0):
        new_title = generate_conversation_title(content)
        conversation.title = new_title
    
    now = datetime.utcnow()
    message = ConversationMessage(
        id=msg_id,
        conversation_id=conversation.id,
        role=payload.role,
        content=content,
        created_at=now
    )
    
    conversation.message_count = (conversation.message_count or 0) + 1
    conversation.last_message_at = now
    conversation.updated_at = now
    
    db.add(message)
    db.commit()
    db.refresh(message)
    return message

@router.patch("/{id}/rename", response_model=ConversationSummary)
def rename_conversation(
    id: str,
    payload: ConversationRename,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Rename conversation title (max 60 chars, sanitized, non-empty).
    """
    conversation = db.query(Conversation).filter(
        Conversation.id == id,
        Conversation.user_id == current_user.id
    ).first()
    
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )
    
    clean_title = (payload.title or "").strip()
    if not clean_title:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Title cannot be empty"
        )
    
    if len(clean_title) > 60:
        clean_title = clean_title[:60].rstrip()
    
    conversation.title = clean_title
    conversation.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(conversation)
    return conversation

@router.patch("/{id}/pin", response_model=ConversationSummary)
def pin_conversation(
    id: str,
    payload: Optional[ConversationPin] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Pin or unpin a conversation.
    """
    conversation = db.query(Conversation).filter(
        Conversation.id == id,
        Conversation.user_id == current_user.id
    ).first()
    
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )
    
    if payload is not None and payload.is_pinned is not None:
        conversation.is_pinned = payload.is_pinned
    else:
        conversation.is_pinned = not conversation.is_pinned
    
    db.commit()
    db.refresh(conversation)
    return conversation

@router.delete("/{id}")
def delete_conversation(
    id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a conversation and its messages.
    Does NOT affect user profile, expenses, goals, portfolio, or financial records.
    """
    conversation = db.query(Conversation).filter(
        Conversation.id == id,
        Conversation.user_id == current_user.id
    ).first()
    
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )
    
    db.delete(conversation)
    db.commit()
    
    return {
        "status": "success",
        "message": "Conversation deleted successfully",
        "id": id
    }
