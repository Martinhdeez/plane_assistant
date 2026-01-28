from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from typing import List

from app.core.database import get_db
from app.auth.dependencies import require_admin, get_current_user
from app.user.user import User, user_assignments
from app.user.schemas import (
    UserCreate, UserResponse, UserAdminUpdate, 
    UserAssignmentRequest, UserRole
)
from app.core.security import get_password_hash

router = APIRouter(prefix="/admin", tags=["admin"])


@router.post("/init", response_model=UserResponse)
async def initialize_first_admin(
    user: UserCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Initialize the first administrator user.
    This endpoint can only be used if no admin exists yet.
    """
    # Check if any admin already exists
    result = await db.execute(
        select(User).where(User.role == UserRole.ADMINISTRADOR.value)
    )
    existing_admin = result.scalars().first()
    
    if existing_admin:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An administrator already exists. Use regular admin endpoints to create users."
        )
    
    # Check if username or email already exists
    result = await db.execute(
        select(User).where(
            or_(User.username == user.username, User.email == user.email)
        )
    )
    existing_user = result.scalars().first()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username or email already registered"
        )
    
    # Create admin user
    db_user = User(
        username=user.username,
        email=user.email,
        hashed_password=get_password_hash(user.password),
        role=UserRole.ADMINISTRADOR.value,
        division=user.division,
        is_active=True
    )
    
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    
    return db_user


@router.get("/users", response_model=List[UserResponse])
async def list_users(
    skip: int = 0,
    limit: int = 100,
    role: str | None = None,
    division: str | None = None,
    is_active: bool | None = None,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """List all users with optional filters (admin only)"""
    query = select(User)
    
    # Apply filters
    if role:
        query = query.where(User.role == role)
    if division:
        query = query.where(User.division == division)
    if is_active is not None:
        query = query.where(User.is_active == is_active)
    
    query = query.offset(skip).limit(limit).order_by(User.created_at.desc())
    
    result = await db.execute(query)
    users = result.scalars().all()
    
    return users


@router.post("/users", response_model=UserResponse)
async def create_user(
    user: UserCreate,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """Create a new user (admin only)"""
    # Check if username or email already exists
    result = await db.execute(
        select(User).where(
            or_(User.username == user.username, User.email == user.email)
        )
    )
    existing_user = result.scalars().first()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username or email already registered"
        )
    
    # Create user
    db_user = User(
        username=user.username,
        email=user.email,
        hashed_password=get_password_hash(user.password),
        role=user.role.value,
        division=user.division,
        is_active=True
    )
    
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    
    return db_user


@router.put("/users/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int,
    user_update: UserAdminUpdate,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """Update a user (admin only)"""
    # Get user
    result = await db.execute(select(User).where(User.id == user_id))
    db_user = result.scalars().first()
    
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Prevent admin from deactivating themselves
    if user_id == current_user.id and user_update.is_active is False:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot deactivate your own account"
        )
    
    # Prevent admin from changing their own role
    if user_id == current_user.id and user_update.role and user_update.role.value != db_user.role:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot change your own role"
        )
    
    # Update fields
    if user_update.email:
        # Check if email is already taken by another user
        result = await db.execute(
            select(User).where(User.email == user_update.email, User.id != user_id)
        )
        if result.scalars().first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        db_user.email = user_update.email
    
    if user_update.role:
        db_user.role = user_update.role.value
    
    if user_update.division is not None:
        db_user.division = user_update.division
    
    if user_update.is_active is not None:
        db_user.is_active = user_update.is_active
    
    await db.commit()
    await db.refresh(db_user)
    
    return db_user


@router.delete("/users/{user_id}")
async def delete_user(
    user_id: int,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """Delete a user (admin only) - soft delete by setting is_active=False"""
    # Get user
    result = await db.execute(select(User).where(User.id == user_id))
    db_user = result.scalars().first()
    
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Prevent admin from deleting themselves
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account"
        )
    
    # Soft delete
    db_user.is_active = False
    await db.commit()
    
    return {"message": "User deactivated successfully"}


@router.put("/users/{oficinista_id}/assign")
async def assign_operarios_to_oficinista(
    oficinista_id: int,
    assignment: UserAssignmentRequest,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """Assign operarios to an oficinista (admin only)"""
    # Get oficinista
    result = await db.execute(select(User).where(User.id == oficinista_id))
    oficinista = result.scalars().first()
    
    if not oficinista:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Oficinista not found"
        )
    
    if oficinista.role != UserRole.OFICINISTA.value:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is not an oficinista"
        )
    
    # Get operarios
    result = await db.execute(
        select(User).where(
            User.id.in_(assignment.operario_ids),
            User.role == UserRole.MANTENIMIENTO.value
        )
    )
    operarios = result.scalars().all()
    
    if len(operarios) != len(assignment.operario_ids):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Some operario IDs are invalid or not mantenimiento users"
        )
    
    # Clear existing assignments
    await db.execute(
        user_assignments.delete().where(
            user_assignments.c.oficinista_id == oficinista_id
        )
    )
    
    # Create new assignments
    for operario in operarios:
        await db.execute(
            user_assignments.insert().values(
                oficinista_id=oficinista_id,
                operario_id=operario.id
            )
        )
    
    await db.commit()
    
    return {
        "message": f"Assigned {len(operarios)} operarios to oficinista",
        "operario_ids": [o.id for o in operarios]
    }


@router.get("/users/{oficinista_id}/assigned", response_model=List[UserResponse])
async def get_assigned_operarios(
    oficinista_id: int,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """Get operarios assigned to an oficinista (admin only)"""
    # Get oficinista with assigned users
    result = await db.execute(
        select(User).where(User.id == oficinista_id)
    )
    oficinista = result.scalars().first()
    
    if not oficinista:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Oficinista not found"
        )
    
    if oficinista.role != UserRole.OFICINISTA.value:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is not an oficinista"
        )
    
    # Get assigned operarios
    result = await db.execute(
        select(User).join(
            user_assignments,
            User.id == user_assignments.c.operario_id
        ).where(
            user_assignments.c.oficinista_id == oficinista_id
        )
    )
    operarios = result.scalars().all()
    
    return operarios


@router.get("/divisions")
async def list_divisions(
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """Get list of all unique divisions (admin only)"""
    result = await db.execute(
        select(User.division).where(User.division.isnot(None)).distinct()
    )
    divisions = [row[0] for row in result.all()]
    
    return {"divisions": divisions}
