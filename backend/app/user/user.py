from sqlalchemy import String, Boolean, DateTime, Table, Column, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from datetime import datetime
from app.core.database import Base

# Association table for oficinista-operario assignments
user_assignments = Table(
    'user_assignments',
    Base.metadata,
    Column('oficinista_id', ForeignKey('users.id'), primary_key=True),
    Column('operario_id', ForeignKey('users.id'), primary_key=True)
)

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    username: Mapped[str] = mapped_column(String, unique=True, index=True)
    email: Mapped[str] = mapped_column(String, unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String)
    
    # Role and division
    role: Mapped[str] = mapped_column(String, default="mantenimiento", index=True)  # mantenimiento, oficinista, administrador
    division: Mapped[str | None] = mapped_column(String, nullable=True)
    
    # Status and timestamps
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    chats: Mapped[list["Chat"]] = relationship("Chat", back_populates="user", cascade="all, delete-orphan")
    
    # For oficinista: users they can view
    assigned_users: Mapped[list["User"]] = relationship(
        "User",
        secondary=user_assignments,
        primaryjoin=id == user_assignments.c.oficinista_id,
        secondaryjoin=id == user_assignments.c.operario_id,
        backref="assigned_to"
    )
