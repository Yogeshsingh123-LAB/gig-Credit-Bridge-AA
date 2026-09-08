import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Boolean, Enum as SQLEnum, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base
from app.models.enums import UserRole

class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(
        String(36), 
        primary_key=True, 
        default=lambda: str(uuid.uuid4())
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    identity_provider: Mapped[str] = mapped_column(String(50), default="DigiLocker", nullable=True)
    identity_provider_user_id: Mapped[str] = mapped_column(String(100), nullable=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=True)
    role: Mapped[UserRole] = mapped_column(
        SQLEnum(UserRole), 
        nullable=False, 
        default=UserRole.WORKER
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        default=lambda: datetime.now(timezone.utc), 
        nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        default=lambda: datetime.now(timezone.utc), 
        onupdate=lambda: datetime.now(timezone.utc), 
        nullable=False
    )

    # Relationships
    worker_profile: Mapped["WorkerProfile"] = relationship(
        "WorkerProfile", 
        back_populates="user", 
        uselist=False, 
        cascade="all, delete-orphan"
    )
    lender_profile: Mapped["LenderProfile"] = relationship(
        "LenderProfile", 
        back_populates="user", 
        uselist=False, 
        cascade="all, delete-orphan"
    )
