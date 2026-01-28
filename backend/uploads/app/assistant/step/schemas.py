from pydantic import BaseModel
from datetime import datetime

class StepBase(BaseModel):
    step_number: int
    title: str
    description: str | None = None

class StepCreate(StepBase):
    pass

class StepResponse(StepBase):
    id: int
    chat_id: int
    is_completed: bool
    completed_at: datetime | None = None
    created_at: datetime
    
    class Config:
        from_attributes = True

class StepListResponse(BaseModel):
    steps: list[StepResponse]
    total: int
    current_step_number: int | None = None
