from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select
from typing import List
from app.core.database import get_db
from app.auth.dependencies import get_current_user, require_mantenimiento_or_admin
from app.user.user import User, user_assignments
from app.user.schemas import UserRole
from app.maintenance_history import service
from app.maintenance_history.schemas import (
    MaintenanceHistoryResponse,
    GenerateHistoryRequest,
    GenerateHistoryResponse
)
from app.maintenance_history.models import MaintenanceHistory

router = APIRouter(prefix="/api", tags=["maintenance_histories"])


@router.post(
    "/chats/{chat_id}/generate-history",
    response_model=GenerateHistoryResponse,
    status_code=status.HTTP_201_CREATED
)
async def generate_maintenance_history(
    chat_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_mantenimiento_or_admin)
):
    """
    Generate maintenance history from chat conversation using AI
    Only mantenimiento and admin can generate histories
    """
    try:
        history = await service.generate_history_from_chat(
            db=db,
            chat_id=chat_id,
            user_id=current_user.id
        )
        return GenerateHistoryResponse(
            history_id=history.id,
            message="Histórico generado exitosamente"
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al generar histórico: {str(e)}"
        )


@router.get(
    "/histories",
    response_model=List[MaintenanceHistoryResponse]
)
async def get_maintenance_histories(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get maintenance histories based on user role:
    - Administrador: sees all histories
    - Oficinista: sees histories from assigned operarios
    - Mantenimiento: sees only own histories
    """
    if current_user.role == UserRole.ADMINISTRADOR.value:
        # Admin sees all histories
        result = await db.execute(
            select(MaintenanceHistory)
            .order_by(MaintenanceHistory.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        histories = result.scalars().all()
        
    elif current_user.role == UserRole.OFICINISTA.value:
        # Oficinista sees histories from assigned operarios
        result = await db.execute(
            select(MaintenanceHistory)
            .join(
                user_assignments,
                MaintenanceHistory.user_id == user_assignments.c.operario_id
            )
            .where(user_assignments.c.oficinista_id == current_user.id)
            .order_by(MaintenanceHistory.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        histories = result.scalars().all()
        
    else:
        # Mantenimiento sees only own histories
        histories = await service.get_histories_by_user(
            db=db,
            user_id=current_user.id,
            skip=skip,
            limit=limit
        )
    
    return histories


@router.get(
    "/histories/{history_id}",
    response_model=MaintenanceHistoryResponse
)
async def get_maintenance_history(
    history_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get a specific maintenance history
    """
    history = await service.get_history_by_id(
        db=db,
        history_id=history_id,
        user_id=current_user.id
    )
    if not history:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Histórico no encontrado"
        )
    return history


@router.get(
    "/chats/{chat_id}/history",
    response_model=MaintenanceHistoryResponse
)
async def get_chat_history(
    chat_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get maintenance history for a specific chat
    """
    history = await service.get_history_by_chat(
        db=db,
        chat_id=chat_id,
        user_id=current_user.id
    )
    if not history:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Este chat no tiene histórico generado"
        )
    return history


@router.delete(
    "/histories/{history_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
async def delete_maintenance_history(
    history_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a maintenance history
    """
    deleted = await service.delete_history(
        db=db,
        history_id=history_id,
        user_id=current_user.id
    )
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Histórico no encontrado"
        )
    return None

