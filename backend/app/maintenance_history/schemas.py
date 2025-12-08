from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List, Dict, Any


class AircraftInfo(BaseModel):
    model: Optional[str] = None
    registration: Optional[str] = None
    operator: Optional[str] = None


class MaintenanceAction(BaseModel):
    action: str
    result: Optional[str] = None
    date: Optional[str] = None


class PartUsed(BaseModel):
    part_name: str
    part_number: Optional[str] = None
    quantity: int = 1


class MaintenanceHistoryCreate(BaseModel):
    chat_id: int
    title: str = Field(..., max_length=200)
    summary: str
    aircraft_info: Optional[Dict[str, Any]] = None
    maintenance_actions: Optional[List[Dict[str, Any]]] = None
    parts_used: Optional[List[Dict[str, Any]]] = None


class MaintenanceHistoryResponse(BaseModel):
    id: int
    chat_id: int
    user_id: int
    title: str
    summary: str
    aircraft_info: Optional[Dict[str, Any]] = None
    maintenance_actions: Optional[List[Dict[str, Any]]] = None
    parts_used: Optional[List[Dict[str, Any]]] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class GenerateHistoryRequest(BaseModel):
    """Request to generate maintenance history from chat"""
    pass


class GenerateHistoryResponse(BaseModel):
    """Response after generating history"""
    history_id: int
    message: str
