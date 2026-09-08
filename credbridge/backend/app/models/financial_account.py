import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Boolean, Float, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

class FinancialAccount(Base):
    """
    Represents an authorized bank account discovered through the Account Aggregator framework.
    Never stores complete account numbers, passwords, UPI PINs, or credentials.
    """
    __tablename__ = "financial_accounts"

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
    bank_name: Mapped[str] = mapped_column(String(100), nullable=False)
    account_mask: Mapped[str] = mapped_column(String(20), nullable=False) # e.g. ****4821
    account_type: Mapped[str] = mapped_column(String(50), default="SAVINGS", nullable=False)
    fip_id: Mapped[str] = mapped_column(String(50), nullable=False) # Financial Information Provider ID
    fip_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    balance_indicative: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    currency: Mapped[str] = mapped_column(String(10), default="INR", nullable=False)
    is_linked: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_selected: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    last_synced_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    worker: Mapped["WorkerProfile"] = relationship("WorkerProfile", foreign_keys=[worker_id])
