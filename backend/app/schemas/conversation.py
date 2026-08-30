from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class MessageBase(BaseModel):
    role: str = Field(..., description="'user', 'assistant', or 'system'")
    content: str = Field(..., min_length=1)

class MessageCreate(BaseModel):
    id: Optional[str] = None
    role: str = "user"
    content: str = Field(..., min_length=1)

class MessageResponse(BaseModel):
    id: str
    conversation_id: str
    role: str
    content: str
    created_at: datetime

    class Config:
        from_attributes = True

class ConversationCreate(BaseModel):
    id: Optional[str] = None
    title: Optional[str] = "New Financial Chat"

class ConversationRename(BaseModel):
    title: str = Field(..., min_length=1, max_length=100)

class ConversationPin(BaseModel):
    is_pinned: Optional[bool] = None

class ConversationSummary(BaseModel):
    id: str
    user_id: int
    title: str
    is_pinned: bool
    message_count: int
    last_message_at: datetime
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ConversationDetail(ConversationSummary):
    messages: List[MessageResponse] = []

    class Config:
        from_attributes = True
