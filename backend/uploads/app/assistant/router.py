from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from app.assistant.schemas import ChatRequest, ChatResponse
from app.assistant.service import gemini_service
from app.auth.dependencies import get_current_user
from app.user.user import User
from app.core.config import settings

router = APIRouter(prefix="/assistant", tags=["assistant"])

@router.post("/chat", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    current_user: Annotated[User, Depends(get_current_user)]
):
    """
    Send a message to the AI assistant and get a response.
    
    Requires authentication. The assistant is specialized in aircraft maintenance.
    """
    try:
        response_text = await gemini_service.chat(request.message)
        return ChatResponse(
            response=response_text,
            model=settings.GEMINI_MODEL
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error communicating with AI assistant: {str(e)}"
        )

@router.get("/health")
async def health_check():
    """
    Check if the assistant service is configured correctly.
    Does not require authentication.
    """
    return {
        "status": "ok",
        "model": settings.GEMINI_MODEL,
        "api_key_configured": bool(settings.GOOGLE_API_KEY)
    }
