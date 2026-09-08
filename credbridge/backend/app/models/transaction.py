import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Float, ForeignKey, DateTime, Enum as SQLEnum, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base
from app.models.enums import TransactionType, TransactionCategory

class Transaction(Base):
    __tablename__ = "transactions"

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
    platform_id: Mapped[str | None] = mapped_column(
        String(36), 
        ForeignKey("gig_platforms.id", ondelete="SET NULL"), 
        index=True, 
        nullable=True
    )
    transaction_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        index=True, 
        nullable=False
    )
    transaction_type: Mapped[TransactionType] = mapped_column(
        SQLEnum(TransactionType), 
        nullable=False
    )
    amount: Mapped[float] = mapped_column(Float, nullable=False)
    category: Mapped[TransactionCategory] = mapped_column(
        SQLEnum(TransactionCategory), 
        default=TransactionCategory.GIG_INCOME, 
        nullable=False
    )
    source: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str | None] = mapped_column(String(255), nullable=True)
    reference_id: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        default=lambda: datetime.now(timezone.utc), 
        nullable=False
    )

    worker: Mapped["WorkerProfile"] = relationship("WorkerProfile", foreign_keys=[worker_id])
    platform: Mapped["GigPlatform"] = relationship("GigPlatform", back_populates="transactions", foreign_keys=[platform_id])

__table_args__ = (
    Index("idx_worker_ref", "worker_id", "reference_id", unique=True),
)
