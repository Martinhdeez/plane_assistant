from pydantic import BaseModel, Field
from datetime import datetime
from app.assistant.message.message import MessageRole

class MessageCreate(BaseModel):
    content: str = Field(..., min_length=1, max_length=5000)

class MessageResponse(BaseModel):
    id: int
    chat_id: int
    role: MessageRole
    content: str
    created_at: datetime
    
    class Config:
        from_attributes = True
