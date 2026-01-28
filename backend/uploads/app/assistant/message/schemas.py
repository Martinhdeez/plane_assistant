from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from app.assistant.message.message import MessageRole

class MessageCreate(BaseModel):
    content: str = Field(..., min_length=1, max_length=5000)

class MessageResponse(BaseModel):
    id: int
    chat_id: int
    role: str
    content: str
    has_image: bool = False
    image_url: str | None = None
    image_filename: str | None = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
