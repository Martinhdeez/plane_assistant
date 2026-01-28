from pydantic import BaseModel, EmailStr
from enum import Enum
from datetime import datetime

class UserRole(str, Enum):
    MANTENIMIENTO = "mantenimiento"
    OFICINISTA = "oficinista"
    ADMINISTRADOR = "administrador"

class UserBase(BaseModel):
    email: EmailStr
    username: str

class UserCreate(UserBase):
    password: str
    role: UserRole = UserRole.MANTENIMIENTO
    division: str | None = None

class UserUpdate(BaseModel):
    email: EmailStr | None = None
    username: str | None = None

class UserAdminUpdate(BaseModel):
    """Admin-only user update schema"""
    email: EmailStr | None = None
    role: UserRole | None = None
    division: str | None = None
    is_active: bool | None = None

class PasswordUpdate(BaseModel):
    current_password: str
    new_password: str

class UserResponse(UserBase):
    id: int
    role: str
    division: str | None
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class UserAssignmentRequest(BaseModel):
    """Request to assign operarios to an oficinista"""
    operario_ids: list[int]
