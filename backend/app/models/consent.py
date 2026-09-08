import uuid
from datetime import datetime, timezone
from sqlalchemy import String, ForeignKey, DateTime, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base
from app.models.enums import ConsentStatus

class Consent(Base):
    __tablename__ = "consents"

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
    lender_id: Mapped[str] = mapped_column(
        String(36), 
        ForeignKey("lender_profiles.id", ondelete="CASCADE"), 
        index=True, 
        nullable=False
    )
    passport_id: Mapped[str] = mapped_column(
        String(36), 
        ForeignKey("credit_passports.id", ondelete="CASCADE"), 
        index=True, 
        nullable=False
    )
    granted_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        default=lambda: datetime.now(timezone.utc), 
        nullable=False
    )
    expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    revoked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    status: Mapped[ConsentStatus] = mapped_column(
        SQLEnum(ConsentStatus), 
        default=ConsentStatus.ACTIVE, 
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
    lender: Mapped["LenderProfile"] = relationship("LenderProfile", foreign_keys=[lender_id])
    passport: Mapped["CreditPassport"] = relationship("CreditPassport", foreign_keys=[passport_id])
