from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.auth.dependencies import get_current_user
from app.user.user import User
from app.assistant.step.step import Step
from app.assistant.step.schemas import StepResponse, StepListResponse
from app.assistant.chat.chat import Chat

router = APIRouter(prefix="/chats/{chat_id}/steps", tags=["steps"])

@router.get("/", response_model=StepListResponse)
async def list_steps(
    chat_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)]
):
    """Get all steps for a chat"""
    # Verify chat belongs to user
    result = await db.execute(
        select(Chat).where(Chat.id == chat_id, Chat.user_id == current_user.id)
    )
    chat = result.scalars().first()
    
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    
    # Get all steps
    result = await db.execute(
        select(Step)
        .where(Step.chat_id == chat_id)
        .order_by(Step.step_number)
    )
    steps = result.scalars().all()
    
    # Find current step (first incomplete)
    current_step_number = None
    for step in steps:
        if not step.is_completed:
            current_step_number = step.step_number
            break
    
    return StepListResponse(
        steps=[StepResponse.model_validate(step) for step in steps],
        total=len(steps),
        current_step_number=current_step_number
    )

@router.get("/current", response_model=StepResponse | None)
async def get_current_step(
    chat_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)]
):
    """Get the current incomplete step"""
    # Verify chat belongs to user
    result = await db.execute(
        select(Chat).where(Chat.id == chat_id, Chat.user_id == current_user.id)
    )
    chat = result.scalars().first()
    
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    
    # Get first incomplete step
    result = await db.execute(
        select(Step)
        .where(Step.chat_id == chat_id, Step.is_completed == False)
        .order_by(Step.step_number)
        .limit(1)
    )
    step = result.scalars().first()
    
    if not step:
        return None
    
    return StepResponse.model_validate(step)

@router.patch("/{step_id}/complete", response_model=StepResponse)
async def complete_step(
    chat_id: int,
    step_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)]
):
    """Mark a step as completed"""
    from datetime import datetime
    
    # Verify chat belongs to user
    result = await db.execute(
        select(Chat).where(Chat.id == chat_id, Chat.user_id == current_user.id)
    )
    chat = result.scalars().first()
    
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    
    # Get step
    result = await db.execute(
        select(Step).where(Step.id == step_id, Step.chat_id == chat_id)
    )
    step = result.scalars().first()
    
    if not step:
        raise HTTPException(status_code=404, detail="Step not found")
    
    # Mark as completed
    step.is_completed = True
    step.completed_at = datetime.utcnow()
    
    await db.commit()
    await db.refresh(step)
    
    return StepResponse.model_validate(step)
