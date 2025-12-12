from typing import Annotated
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.security import SECRET_KEY, ALGORITHM
from app.auth.schemas import TokenData
from app.user.user import User
from app.user.schemas import UserRole

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/token")

async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)], db: Annotated[AsyncSession, Depends(get_db)]):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
        token_data = TokenData(username=user_id)  # Reusing TokenData, but storing user_id
    except JWTError:
        raise credentials_exception
    
    # Query by user ID instead of username
    result = await db.execute(select(User).where(User.id == int(user_id)))
    user = result.scalars().first()
    if user is None:
        raise credentials_exception
    
    # Check if user is active
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
        )
    
    return user

def require_role(allowed_roles: list[UserRole]):
    """
    Dependency factory that creates a role checker
    Usage: dependencies=[Depends(require_role([UserRole.ADMINISTRADOR]))]
    """
    async def role_checker(current_user: User = Depends(get_current_user)):
        if current_user.role not in [role.value for role in allowed_roles]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Insufficient permissions. Required roles: {[r.value for r in allowed_roles]}"
            )
        return current_user
    return role_checker

# Convenience dependencies for common role checks
async def require_admin(current_user: User = Depends(get_current_user)):
    """Require administrador role"""
    if current_user.role != UserRole.ADMINISTRADOR.value:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrator access required"
        )
    return current_user

async def require_mantenimiento_or_admin(current_user: User = Depends(get_current_user)):
    """Require mantenimiento or administrador role"""
    if current_user.role not in [UserRole.MANTENIMIENTO.value, UserRole.ADMINISTRADOR.value]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Mantenimiento or Administrator access required"
        )
    return current_user
