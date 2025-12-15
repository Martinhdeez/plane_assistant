from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.core.database import get_db
from app.auth.dependencies import get_current_user
from app.user.user import User
from app.assistant.chat.chat import Chat
from app.assistant.chat.schemas import ChatCreate, ChatUpdate, ChatResponse, ChatListResponse, ChatWithMessages
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
        title=chat_data.title,
        airplane_model=chat_data.airplane_model,
        component_type=chat_data.component_type
    )
    db.add(new_chat)
    await db.commit()
    await db.refresh(new_chat)
    
    return ChatResponse(
        id=new_chat.id,
        user_id=new_chat.user_id,
        title=new_chat.title,
        airplane_model=new_chat.airplane_model,
        component_type=new_chat.component_type,
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
            airplane_model=chat.airplane_model,
            component_type=chat.component_type,
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
    from app.core.storage import storage_service
    
    result = await db.execute(
        select(Chat).where(Chat.id == chat_id, Chat.user_id == current_user.id)
    )
    chat = result.scalars().first()
    
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    
    # Get messages
    result = await db.execute(
        select(Message)
        .where(Message.chat_id == chat_id)
        .order_by(Message.created_at.asc())
    )
    messages = result.scalars().all()
    
    # Convert messages to response format with image URLs
    message_responses = []
    for msg in messages:
        msg_dict = {
            "id": msg.id,
            "chat_id": msg.chat_id,
            "role": msg.role,
            "content": msg.content,
            "created_at": msg.created_at,
            "has_image": msg.has_image,
            "image_filename": msg.image_filename
        }
        
        # Add image URL if message has image
        if msg.has_image and msg.image_path:
            msg_dict["image_url"] = storage_service.get_image_url(msg.image_path)
        else:
            msg_dict["image_url"] = None
            
        message_responses.append(MessageResponse(**msg_dict))
    
    return ChatWithMessages(
        id=chat.id,
        user_id=chat.user_id,
        title=chat.title,
        airplane_model=chat.airplane_model,
        component_type=chat.component_type,
        created_at=chat.created_at,
        messages=message_responses
    )

@router.patch("/{chat_id}", response_model=ChatResponse)
async def update_chat(
    chat_id: int,
    chat_update: ChatUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)]
):
    """Update chat title."""
    result = await db.execute(
        select(Chat).where(Chat.id == chat_id, Chat.user_id == current_user.id)
    )
    chat = result.scalars().first()
    
    if not chat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat not found"
        )
    
    # Update title
    chat.title = chat_update.title
    await db.commit()
    await db.refresh(chat)
    
    # Get message count
    count_result = await db.execute(
        select(func.count(Message.id)).where(Message.chat_id == chat_id)
    )
    message_count = count_result.scalar()
    
    return ChatResponse(
        id=chat.id,
        user_id=chat.user_id,
        title=chat.title,
        airplane_model=chat.airplane_model,
        component_type=chat.component_type,
        created_at=chat.created_at,
        message_count=message_count
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

@router.post("/{chat_id}/messages", response_model=dict)
async def send_message(
    chat_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
    content: str = Form(...),
    image: UploadFile | None = File(None)
):
    """Send a message in a chat (with optional image) and get AI response."""
    from app.core.storage import storage_service
    from app.assistant.image_processor import image_processor
    
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
    
    # Handle image upload if present
    user_image_info = None
    if image:
        user_image_info = await storage_service.save_user_image(
            user_id=current_user.id,
            chat_id=chat_id,
            file=image
        )
    
    # Save user message
    user_message = Message(
        chat_id=chat_id,
        role=MessageRole.USER,
        content=content,
        has_image=bool(user_image_info),
        image_path=user_image_info["path"] if user_image_info else None,
        image_filename=user_image_info["filename"] if user_image_info else None,
        image_size=user_image_info["size"] if user_image_info else None,
        image_type=user_image_info["type"] if user_image_info else None
    )
    db.add(user_message)
    await db.commit()
    await db.refresh(user_message)
    
    # Get AI response
    # Prepare chat context
    chat_context = {
        "airplane_model": chat.airplane_model,
        "component_type": chat.component_type
    }
    
    try:
        if user_image_info:
            # Process with Gemini Vision
            ai_response = await gemini_service.chat_with_image(
                user_message=content,
                image_path=user_image_info["path"],
                message_history=message_history,
                chat_context=chat_context
            )
            
            # Draw annotations on image
            if ai_response.get("annotations"):
                annotated_image_bytes = image_processor.draw_annotations(
                    image_path=user_image_info["path"],
                    annotations=ai_response["annotations"]
                )
                
                # Save annotated image
                ai_image_info = await storage_service.save_ai_image(
                    user_id=current_user.id,
                    chat_id=chat_id,
                    image_data=annotated_image_bytes
                )
            else:
                ai_image_info = None
            
            ai_response_content = ai_response["text"]
        else:
            # Regular text chat
            ai_response_content = await gemini_service.chat(
                user_message=content,
                message_history=message_history,
                chat_context=chat_context
            )
            ai_image_info = None
            
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error communicating with AI assistant: {str(e)}"
        )
    
    # Save AI response
    ai_message = Message(
        chat_id=chat_id,
        role=MessageRole.ASSISTANT,
        content=ai_response_content,
        has_image=bool(ai_image_info),
        image_path=ai_image_info["path"] if ai_image_info else None,
        image_filename=ai_image_info["filename"] if ai_image_info else None,
        image_size=ai_image_info["size"] if ai_image_info else None,
        image_type=ai_image_info["type"] if ai_image_info else None
    )
    db.add(ai_message)
    await db.commit()
    await db.refresh(ai_message)
    
    # Return both messages with image URLs
    return {
        "user_message": {
            "id": user_message.id,
            "role": user_message.role.value,
            "content": user_message.content,
            "has_image": user_message.has_image,
            "image_url": storage_service.get_image_url(user_message.image_path) if user_message.has_image else None,
            "created_at": user_message.created_at.isoformat()
        },
        "ai_message": {
            "id": ai_message.id,
            "role": ai_message.role.value,
            "content": ai_message.content,
            "has_image": ai_message.has_image,
            "image_url": storage_service.get_image_url(ai_message.image_path) if ai_message.has_image else None,
            "created_at": ai_message.created_at.isoformat()
        }
    }
