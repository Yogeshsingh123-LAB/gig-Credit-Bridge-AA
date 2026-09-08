import uuid
from datetime import datetime, date, timezone
from sqlalchemy import String, Float, Date, DateTime, JSON, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

class IncomeReport(Base):
    """
    Verified Gig Income Report entity.
    Stores immutable deterministic calculation snapshots, explainability breakdowns, and methodology metadata.
    """
    __tablename__ = "income_reports"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4())
    )
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
    consent_id: Mapped[str | None] = mapped_column(
        String(36),
        ForeignKey("aa_consents.id", ondelete="SET NULL"),
        index=True,
        nullable=True
    )
    analysis_start_date: Mapped[date] = mapped_column(Date, nullable=False)
    analysis_end_date: Mapped[date] = mapped_column(Date, nullable=False)
    generated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )
    calculation_version: Mapped[str] = mapped_column(String(20), default="v1.0", nullable=False)
    data_source: Mapped[str] = mapped_column(String(100), default="Account Aggregator (Authorized)", nullable=False)
    accounts_analyzed: Mapped[list] = mapped_column(JSON, default=list, nullable=False)
    platforms_selected: Mapped[list] = mapped_column(JSON, default=list, nullable=False)
    verified_average_monthly_gig_income: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    total_verified_gig_income: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    monthly_breakdown: Mapped[list] = mapped_column(JSON, default=list, nullable=False)
    platform_breakdown: Mapped[list] = mapped_column(JSON, default=list, nullable=False)
    verification_confidence: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    data_quality: Mapped[dict] = mapped_column(JSON, default=dict, nullable=False)
    methodology: Mapped[str] = mapped_column(
        Text,
        default="Deterministic calculation of gig income credits filtered strictly by selected platforms and date range.",
        nullable=False
    )
    risk_flags: Mapped[list] = mapped_column(JSON, default=list, nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="ACTIVE", nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    worker: Mapped["WorkerProfile"] = relationship("WorkerProfile", foreign_keys=[worker_id])
    consent: Mapped["AAConsent"] = relationship("AAConsent", foreign_keys=[consent_id])
