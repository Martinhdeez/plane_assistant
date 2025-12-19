from sqlalchemy import String, Integer, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime
from app.core.database import Base

class Chat(Base):
    __tablename__ = "chats"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    title: Mapped[str] = mapped_column(String, nullable=False)
    airplane_model: Mapped[str | None] = mapped_column(String, nullable=True)
    component_type: Mapped[str | None] = mapped_column(String, nullable=True)
    instruction_template_path: Mapped[str | None] = mapped_column(String, nullable=True)
    instruction_template_filename: Mapped[str | None] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    
    # Relationships
    messages: Mapped[list["Message"]] = relationship("Message", back_populates="chat", cascade="all, delete-orphan")
    steps: Mapped[list["Step"]] = relationship("Step", back_populates="chat", cascade="all, delete-orphan", order_by="Step.step_number")
    user: Mapped["User"] = relationship("User", back_populates="chats")
