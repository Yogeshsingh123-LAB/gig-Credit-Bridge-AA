import uuid
from datetime import datetime, timezone
from sqlalchemy import String, ForeignKey, DateTime, Text, JSON, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base
from app.models.enums import PassportStatus

class CreditPassport(Base):
    __tablename__ = "credit_passports"

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
    passport_number: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    version: Mapped[str] = mapped_column(String(20), default="v1.0", nullable=False)
    generated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        default=lambda: datetime.now(timezone.utc), 
        nullable=False
    )
    expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    income_summary: Mapped[dict] = mapped_column(JSON, default=dict, nullable=False)
    verification_summary: Mapped[dict] = mapped_column(JSON, default=dict, nullable=False)
    financial_score: Mapped[dict] = mapped_column(JSON, default=dict, nullable=False)
    risk_indicators: Mapped[dict | list] = mapped_column(JSON, default=list, nullable=False)
    income_sources: Mapped[dict | list] = mapped_column(JSON, default=list, nullable=False)
    data_quality: Mapped[dict] = mapped_column(JSON, default=dict, nullable=False)
    explanation: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[PassportStatus] = mapped_column(
        SQLEnum(PassportStatus), 
        default=PassportStatus.ACTIVE, 
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
