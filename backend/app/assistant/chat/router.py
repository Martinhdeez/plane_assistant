from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.core.database import get_db
from app.auth.dependencies import get_current_user
from app.user.user import User
from app.assistant.chat.chat import Chat
from app.assistant.chat.schemas import ChatCreate, ChatResponse, ChatListResponse, ChatWithMessages
from app.assistant.message.message import Message, MessageRole
from app.assistant.message.schemas import MessageCreate, MessageResponse
from app.assistant.service import gemini_service

router = APIRouter(prefix="/chats", tags=["chats"])

@router.post("/", response_model=ChatResponse, status_code=status.HTTP_201_CREATED)
async def create_chat(
    chat_data: ChatCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)]
):
    """Create a new chat for the current user."""
    new_chat = Chat(
        user_id=current_user.id,
        title=chat_data.title
    )
    db.add(new_chat)
    await db.commit()
    await db.refresh(new_chat)
    
    return ChatResponse(
        id=new_chat.id,
        user_id=new_chat.user_id,
        title=new_chat.title,
        created_at=new_chat.created_at,
        message_count=0
    )

@router.get("/", response_model=ChatListResponse)
async def list_chats(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)]
):
    """List all chats for the current user."""
    # Get chats with message count
    result = await db.execute(
        select(Chat, func.count(Message.id).label("message_count"))
        .outerjoin(Message)
        .where(Chat.user_id == current_user.id)
        .group_by(Chat.id)
        .order_by(Chat.created_at.desc())
    )
    
    chats_with_counts = result.all()
    
    chat_responses = [
        ChatResponse(
            id=chat.id,
            user_id=chat.user_id,
            title=chat.title,
            created_at=chat.created_at,
            message_count=message_count
        )
        for chat, message_count in chats_with_counts
    ]
    
    return ChatListResponse(chats=chat_responses)

@router.get("/{chat_id}", response_model=ChatWithMessages)
async def get_chat(
    chat_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)]
):
    """Get a specific chat with all its messages."""
    result = await db.execute(
        select(Chat).where(Chat.id == chat_id, Chat.user_id == current_user.id)
    )
    chat = result.scalars().first()
    
    if not chat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat not found"
        )
    
    # Get messages
    messages_result = await db.execute(
        select(Message)
        .where(Message.chat_id == chat_id)
        .order_by(Message.created_at.asc())
    )
    messages = messages_result.scalars().all()
    
    return ChatWithMessages(
        id=chat.id,
        user_id=chat.user_id,
        title=chat.title,
        created_at=chat.created_at,
        messages=[MessageResponse.model_validate(msg) for msg in messages]
    )

@router.delete("/{chat_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_chat(
    chat_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)]
):
    """Delete a chat and all its messages."""
    result = await db.execute(
        select(Chat).where(Chat.id == chat_id, Chat.user_id == current_user.id)
    )
    chat = result.scalars().first()
    
    if not chat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat not found"
        )
    
    await db.delete(chat)
    await db.commit()

@router.post("/{chat_id}/messages", response_model=MessageResponse)
async def send_message(
    chat_id: int,
    message_data: MessageCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)]
):
    """Send a message in a chat and get AI response."""
    # Verify chat exists and belongs to user
    result = await db.execute(
        select(Chat).where(Chat.id == chat_id, Chat.user_id == current_user.id)
    )
    chat = result.scalars().first()
    
    if not chat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat not found"
        )
    
    # Get message history for context
    history_result = await db.execute(
        select(Message)
        .where(Message.chat_id == chat_id)
        .order_by(Message.created_at.asc())
    )
    history = history_result.scalars().all()
    
    # Convert to format expected by Gemini service
    message_history = [
        {"role": msg.role.value, "content": msg.content}
        for msg in history
    ]
    
    # Save user message
    user_message = Message(
        chat_id=chat_id,
        role=MessageRole.USER,
        content=message_data.content
    )
    db.add(user_message)
    await db.commit()
    await db.refresh(user_message)
    
    # Get AI response with context
    try:
        ai_response_content = await gemini_service.chat(
            user_message=message_data.content,
            message_history=message_history
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error communicating with AI assistant: {str(e)}"
        )
    
    # Save AI response
    ai_message = Message(
        chat_id=chat_id,
        role=MessageRole.ASSISTANT,
        content=ai_response_content
    )
    db.add(ai_message)
    await db.commit()
    await db.refresh(ai_message)
    
    return MessageResponse.model_validate(ai_message)
