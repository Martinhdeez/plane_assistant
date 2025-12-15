from pydantic import BaseModel, Field
from datetime import datetime

class ChatCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    airplane_model: str = Field(..., min_length=1, max_length=100)
    component_type: str = Field(..., min_length=1, max_length=100)

class ChatUpdate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)

class ChatResponse(BaseModel):
    id: int
    user_id: int
    title: str
    airplane_model: str
    component_type: str
    created_at: datetime
    message_count: int = 0
    
    class Config:
        from_attributes = True

class ChatListResponse(BaseModel):
    chats: list[ChatResponse]

class ChatWithMessages(BaseModel):
    id: int
    user_id: int
    title: str
    airplane_model: str
    component_type: str
    created_at: datetime
    messages: list["MessageResponse"]
    
    class Config:
        from_attributes = True

# Import for forward reference
from app.assistant.message.schemas import MessageResponse
ChatWithMessages.model_rebuild()
