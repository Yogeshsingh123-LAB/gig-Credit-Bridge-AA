import uuid
from datetime import datetime, date, timezone
from sqlalchemy import String, Date, DateTime, JSON, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base
from app.models.enums import AAConsentStatus

class AAConsent(Base):
    """
    Electronic Consent Record conforming to India's Account Aggregator Framework.
    Captures exact user consent scopes, selected financial accounts, selected sources, and validity.
    """
    __tablename__ = "aa_consents"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4())
    )
    consent_handle: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        index=True,
        nullable=False
    )
    worker_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("worker_profiles.id", ondelete="CASCADE"),
        index=True,
        nullable=False
    )
    purpose: Mapped[str] = mapped_column(String(255), default="Income verification only", nullable=False)
    data_types: Mapped[list] = mapped_column(JSON, default=lambda: ["TRANSACTIONS"], nullable=False)
    selected_accounts: Mapped[list] = mapped_column(JSON, default=list, nullable=False)
    selected_sources: Mapped[list] = mapped_column(JSON, default=list, nullable=False)
    start_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    end_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    consent_status: Mapped[AAConsentStatus] = mapped_column(
        SQLEnum(AAConsentStatus),
        default=AAConsentStatus.ACTIVE,
        nullable=False
    )
    provider: Mapped[str] = mapped_column(String(100), default="Account Aggregator Sandbox", nullable=False)
    consent_version: Mapped[str] = mapped_column(String(20), default="v1.0", nullable=False)
    granted_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )
    expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    revoked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
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
