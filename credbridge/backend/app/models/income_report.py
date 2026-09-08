import uuid
from datetime import datetime, date, timezone
from typing import Optional, List, Dict, Any
from sqlalchemy import String, Float, Date, DateTime, JSON, Text, ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

class IncomeReport(Base):
    """
    Verified Gig Income Report entity.
    Stores immutable deterministic calculation snapshots, cryptographic integrity hashes,
    server digital signatures, and explainability metadata.
    """
    __tablename__ = "income_reports"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4())
    )
    # Standard format: CBR-YYYY-XXXX-XXXX-XXXX
    report_id: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        index=True,
        nullable=False
    )
    # Legacy alias / report number for backward compatibility
    report_number: Mapped[str] = mapped_column(
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
    consent_id: Mapped[Optional[str]] = mapped_column(
        String(36),
        ForeignKey("aa_consents.id", ondelete="SET NULL"),
        index=True,
        nullable=True
    )
    analysis_start_date: Mapped[date] = mapped_column(Date, nullable=False)
    analysis_end_date: Mapped[date] = mapped_column(Date, nullable=False)
    months_analyzed: Mapped[int] = mapped_column(Integer, default=6, nullable=False)

    generated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )
    issued_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )
    expires_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )

    calculation_version: Mapped[str] = mapped_column(String(20), default="v1.0", nullable=False)
    data_source: Mapped[str] = mapped_column(String(100), default="Account Aggregator (Authorized Financial Data)", nullable=False)
    accounts_analyzed: Mapped[list] = mapped_column(JSON, default=list, nullable=False)
    platforms_selected: Mapped[list] = mapped_column(JSON, default=list, nullable=False)

    verified_average_monthly_gig_income: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    total_verified_gig_income: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    monthly_breakdown: Mapped[list] = mapped_column(JSON, default=list, nullable=False)
    platform_breakdown: Mapped[list] = mapped_column(JSON, default=list, nullable=False)

    income_trend: Mapped[str] = mapped_column(String(30), default="Stable", nullable=False)
    income_consistency: Mapped[str] = mapped_column(String(30), default="High", nullable=False)
    verification_confidence: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    data_quality: Mapped[dict] = mapped_column(JSON, default=dict, nullable=False)
    methodology: Mapped[str] = mapped_column(
        Text,
        default="Deterministic calculation of gig income credits filtered strictly by authorized bank accounts and date range.",
        nullable=False
    )
    risk_flags: Mapped[list] = mapped_column(JSON, default=list, nullable=False)

    # Cryptographic integrity attributes
    canonical_hash: Mapped[str] = mapped_column(String(64), nullable=False) # SHA-256
    signature: Mapped[str] = mapped_column(String(128), nullable=False)     # HMAC-SHA256
    signature_algorithm: Mapped[str] = mapped_column(String(30), default="HMAC-SHA256", nullable=False)
    key_version: Mapped[str] = mapped_column(String(20), default="v1", nullable=False)

    # Lifecycle status: DRAFT, FINALIZED, ISSUED, ACTIVE, EXPIRED, REVOKED
    status: Mapped[str] = mapped_column(String(20), default="ACTIVE", nullable=False)
    report_status: Mapped[str] = mapped_column(String(20), default="ACTIVE", nullable=False)
    revoked_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    worker: Mapped["WorkerProfile"] = relationship("WorkerProfile", foreign_keys=[worker_id])
    consent: Mapped["AAConsent"] = relationship("AAConsent", foreign_keys=[consent_id])
