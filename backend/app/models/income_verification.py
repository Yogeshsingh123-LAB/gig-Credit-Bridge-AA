import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Float, Integer, ForeignKey, DateTime, Text, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base
from app.models.enums import VerificationStatus

class IncomeVerification(Base):
    __tablename__ = "income_verifications"

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
    declared_monthly_income: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    observed_average_monthly_income: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    verified_monthly_income: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    total_income_observed: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    months_analyzed: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    income_sources_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    income_coverage_percentage: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    volatility_percentage: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    confidence_score: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    verification_status: Mapped[VerificationStatus] = mapped_column(
        SQLEnum(VerificationStatus), 
        default=VerificationStatus.INSUFFICIENT_DATA, 
        nullable=False
    )
    verification_summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    calculation_version: Mapped[str] = mapped_column(String(20), default="v1.0", nullable=False)
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
