import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Integer, Float, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

class WorkerProfile(Base):
    __tablename__ = "worker_profiles"

    id: Mapped[str] = mapped_column(
        String(36), 
        primary_key=True, 
        default=lambda: str(uuid.uuid4())
    )
    user_id: Mapped[str] = mapped_column(
        String(36), 
        ForeignKey("users.id", ondelete="CASCADE"), 
        unique=True, 
        index=True, 
        nullable=False
    )
    phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    city: Mapped[str | None] = mapped_column(String(100), nullable=True)
    occupation: Mapped[str | None] = mapped_column(String(100), nullable=True)
    experience_months: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    profile_completion: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    identity_status: Mapped[str] = mapped_column(String(30), default="UNVERIFIED", nullable=False)
    identity_source: Mapped[str | None] = mapped_column(String(50), nullable=True) # e.g. "DigiLocker"
    identity_verified_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    masked_aadhaar: Mapped[str | None] = mapped_column(String(20), nullable=True) # e.g. "XXXXXXXX4821"
    identity_name: Mapped[str | None] = mapped_column(String(150), nullable=True)
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

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="worker_profile")
