from pydantic import BaseModel, EmailStr

class UserBase(BaseModel):
    email: EmailStr
    username: str

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    email: EmailStr | None = None
    username: str | None = None

class PasswordUpdate(BaseModel):
    current_password: str
    new_password: str

class UserResponse(UserBase):
    id: int
    
    class Config:
        from_attributes = True
