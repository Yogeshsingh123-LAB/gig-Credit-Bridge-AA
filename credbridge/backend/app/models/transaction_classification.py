import uuid
from datetime import datetime, date, timezone
from sqlalchemy import String, Float, Boolean, Date, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base
from app.models.enums import TransactionClassificationType

class TransactionClassification(Base):
    """
    Stores classification results for audited bank transactions.
    Discriminates gig platform income from non-gig income, transfers, and living expenses.
    """
    __tablename__ = "transaction_classifications"

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
    report_id: Mapped[str | None] = mapped_column(String(36), index=True, nullable=True)
    transaction_date: Mapped[date] = mapped_column(Date, nullable=False)
    amount: Mapped[float] = mapped_column(Float, nullable=False)
    source: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str | None] = mapped_column(String(255), nullable=True)
    matched_platform: Mapped[str | None] = mapped_column(String(50), nullable=True)
    classification: Mapped[TransactionClassificationType] = mapped_column(
        SQLEnum(TransactionClassificationType),
        default=TransactionClassificationType.UNKNOWN,
        nullable=False
    )
    confidence: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    reason: Mapped[str] = mapped_column(String(255), nullable=False)
    included_in_report: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    worker: Mapped["WorkerProfile"] = relationship("WorkerProfile", foreign_keys=[worker_id])
