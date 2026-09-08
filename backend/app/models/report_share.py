import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Boolean, DateTime, JSON, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

class ReportShare(Base):
    """
    Granular, worker-controlled report sharing authorization record.
    Ensures explicit worker consent is required before sharing financial evidence with any external party/lender.
    """
    __tablename__ = "report_shares"

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
    report_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("income_reports.id", ondelete="CASCADE"),
        index=True,
        nullable=False
    )
    recipient_name: Mapped[str] = mapped_column(String(100), nullable=False) # e.g. "ABC Finance Ltd."
    recipient_id: Mapped[str | None] = mapped_column(String(50), nullable=True)
    share_scope: Mapped[dict] = mapped_column(
        JSON,
        default=lambda: {
            "verified_income": True,
            "monthly_income_history": True,
            "income_sources": True,
            "verification_methodology": True
        },
        nullable=False
    )
    include_raw_transactions: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    granted_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )
    expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    revoked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="ACTIVE", nullable=False) # ACTIVE, REVOKED, EXPIRED

    worker: Mapped["WorkerProfile"] = relationship("WorkerProfile", foreign_keys=[worker_id])
    report: Mapped["IncomeReport"] = relationship("IncomeReport", foreign_keys=[report_id])
