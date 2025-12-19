from fastapi import FastAPI, Depends, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
from app.core.config import settings
from app.auth.router import router as auth_router
from app.user.router import router as user_router
from app.assistant.router import router as assistant_router
from app.assistant.chat.router import router as chat_router
from app.assistant.step.router import router as step_router
from app.maintenance_history.router import router as maintenance_history_router
from app.admin.router import router as admin_router
from app.auth.dependencies import get_current_user
from app.user.user import User
from typing import Annotated

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION
)

# CORS middleware for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for Docker
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api")
app.include_router(user_router, prefix="/api")
app.include_router(assistant_router, prefix="/api")
app.include_router(chat_router, prefix="/api")
app.include_router(step_router, prefix="/api")
app.include_router(maintenance_history_router)
app.include_router(admin_router, prefix="/api")

@app.get("/api")
async def root():
    return {"message": "Welcome to Plane Assistant API"}

@app.get("/api/images/{path:path}")
async def serve_image(
    path: str,
    current_user: Annotated[User, Depends(get_current_user)]
):
    """Serve images with authentication"""
    file_path = Path(path)
    
    # Security: ensure path is within uploads directory
    if not str(file_path).startswith("uploads/users/"):
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Verify file exists
    if not file_path.exists() or not file_path.is_file():
        raise HTTPException(status_code=404, detail="Image not found")
    
    # TODO: Add user ownership verification
    # Extract user_id from path and verify it matches current_user.id
    
    return FileResponse(file_path)