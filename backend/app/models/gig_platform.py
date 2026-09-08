import uuid
from datetime import datetime, timezone
from sqlalchemy import String, ForeignKey, DateTime, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base
from app.models.enums import PlatformStatus

class GigPlatform(Base):
    __tablename__ = "gig_platforms"

    id: Mapped[str] = mapped_column(
        String(36), 
        primary_key=True, 
        default=lambda: str(uuid.uuid4())
    )
    worker_id: Mapped[str] = mapped_column(
        String(36), 
        ForeignKey("worker_profiles.id", ondelete="CASCADE"), 
        index=True, 
        nullable=False
    )
    platform_name: Mapped[str] = mapped_column(String(100), nullable=False)
    account_identifier: Mapped[str] = mapped_column(String(150), nullable=False)
    connection_status: Mapped[PlatformStatus] = mapped_column(
        SQLEnum(PlatformStatus), 
        default=PlatformStatus.CONNECTED, 
        nullable=False
    )
    connected_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        default=lambda: datetime.now(timezone.utc), 
        nullable=False
    )
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

    worker: Mapped["WorkerProfile"] = relationship("WorkerProfile", foreign_keys=[worker_id])
    transactions: Mapped[list["Transaction"]] = relationship("Transaction", back_populates="platform", cascade="all, delete-orphan")
