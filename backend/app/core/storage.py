import os
import uuid
import shutil
from pathlib import Path
from datetime import datetime
from fastapi import UploadFile, HTTPException
from app.core.config import settings

UPLOAD_DIR = Path(settings.UPLOAD_PATH)
TEMPLATE_DIR = Path(settings.TEMPLATE_PATH)
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
ALLOWED_TEMPLATE_EXTENSIONS = {".pdf"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
MAX_TEMPLATE_SIZE = 25 * 1024 * 1024  # 25MB

class StorageService:
    @staticmethod
    def _get_chat_dir(user_id: int, chat_id: int) -> Path:
        """Get the directory for a specific chat"""
        return UPLOAD_DIR / f"user_{user_id}" / f"chat_{chat_id}"
    
    @staticmethod
    async def save_user_image(
        user_id: int,
        chat_id: int,
        file: UploadFile
    ) -> dict:
        """Save user uploaded image"""
        # Validate extension
        ext = Path(file.filename).suffix.lower()
        if ext not in ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=400,
                detail=f"File type not allowed. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
            )
        
        # Create directory if not exists
        chat_dir = StorageService._get_chat_dir(user_id, chat_id)
        chat_dir.mkdir(parents=True, exist_ok=True)
        
        # Generate unique filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        unique_id = str(uuid.uuid4())[:8]
        filename = f"user_{timestamp}_{unique_id}{ext}"
        file_path = chat_dir / filename
        
        # Read and validate size
        content = await file.read()
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=400,
                detail=f"File too large. Maximum size: {MAX_FILE_SIZE / 1024 / 1024}MB"
            )
        
        # Save file
        with open(file_path, "wb") as f:
            f.write(content)
        
        # Get absolute path and then relative to cwd
        abs_path = file_path.resolve()
        
        return {
            "path": str(abs_path.relative_to(Path.cwd())),
            "filename": file.filename,
            "size": len(content),
            "type": file.content_type
        }
    
    @staticmethod
    async def save_ai_image(
        user_id: int,
        chat_id: int,
        image_data: bytes,
        extension: str = ".jpg"
    ) -> dict:
        """Save AI-generated annotated image"""
        chat_dir = StorageService._get_chat_dir(user_id, chat_id)
        chat_dir.mkdir(parents=True, exist_ok=True)
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"ai_{timestamp}_annotated{extension}"
        file_path = chat_dir / filename
        
        with open(file_path, "wb") as f:
            f.write(image_data)
        
        # Get absolute path and then relative to cwd
        abs_path = file_path.resolve()
        
        return {
            "path": str(abs_path.relative_to(Path.cwd())),
            "filename": filename,
            "size": len(image_data),
            "type": f"image/{extension[1:]}"
        }
    
    def get_image_url(self, image_path: str) -> str:
        """
        Convert file path to servable URL
        Args:
            image_path: Relative path to image (e.g., "uploads/users/user_1/chat_1/image.jpg")
        Returns:
            URL path for serving the image (e.g., "/api/images/uploads/users/user_1/chat_1/image.jpg")
        """
        # Ensure path doesn't start with /
        clean_path = image_path.lstrip('/')
        return f"/api/images/{clean_path}"
    
    @staticmethod
    async def delete_chat_images(user_id: int, chat_id: int):
        """Delete all images from a chat"""
        chat_dir = StorageService._get_chat_dir(user_id, chat_id)
        if chat_dir.exists():
            shutil.rmtree(chat_dir)
    
    @staticmethod
    async def get_chat_images(user_id: int, chat_id: int) -> list[dict]:
        """List all images from a chat"""
        chat_dir = StorageService._get_chat_dir(user_id, chat_id)
        if not chat_dir.exists():
            return []
        
        images = []
        for file_path in sorted(chat_dir.glob("*")):
            if file_path.suffix.lower() in ALLOWED_EXTENSIONS:
                images.append({
                    "filename": file_path.name,
                    "path": str(file_path.relative_to(Path.cwd())),
                    "size": file_path.stat().st_size,
                    "url": StorageService.get_image_url(
                        str(file_path.relative_to(Path.cwd()))
                    )
                })
        return images
    
    @staticmethod
    async def save_instruction_template(
        user_id: int,
        file: UploadFile
    ) -> dict:
        """Save instruction template PDF"""
        # Validate extension
        ext = Path(file.filename).suffix.lower()
        if ext not in ALLOWED_TEMPLATE_EXTENSIONS:
            raise HTTPException(
                status_code=400,
                detail=f"File type not allowed. Only PDF files are supported."
            )
        
        # Create directory if not exists
        template_dir = TEMPLATE_DIR / f"user_{user_id}"
        template_dir.mkdir(parents=True, exist_ok=True)
        
        # Generate unique filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        unique_id = str(uuid.uuid4())[:8]
        filename = f"template_{timestamp}_{unique_id}{ext}"
        file_path = template_dir / filename
        
        # Read and validate size
        content = await file.read()
        if len(content) > MAX_TEMPLATE_SIZE:
            raise HTTPException(
                status_code=400,
                detail=f"File too large. Maximum size: {MAX_TEMPLATE_SIZE / 1024 / 1024}MB"
            )
        
        # Save file
        with open(file_path, "wb") as f:
            f.write(content)
        
        # Get absolute path and then relative to cwd
        abs_path = file_path.resolve()
        
        return {
            "path": str(abs_path.relative_to(Path.cwd())),
            "filename": file.filename,
            "size": len(content),
            "type": file.content_type
        }

# Singleton instance
storage_service = StorageService()
