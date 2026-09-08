import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base

class ReportVerification(Base):
    __tablename__ = "report_verifications"

    id: Mapped[str] = mapped_column(
        String(36), 
        primary_key=True, 
        default=lambda: str(uuid.uuid4())
    )
    report_id: Mapped[str] = mapped_column(
        String(100), 
        index=True, 
        nullable=False
    )
    lender_id: Mapped[str | None] = mapped_column(
        String(50), 
        index=True, 
        nullable=True
    )
    lender_name: Mapped[str | None] = mapped_column(String(150), nullable=True)
    organization_id: Mapped[str | None] = mapped_column(String(36), nullable=True, index=True)
    verified_by_user_id: Mapped[str | None] = mapped_column(
        String(36), 
        ForeignKey("users.id", ondelete="SET NULL"), 
        nullable=True
    )
    verified_by: Mapped[str | None] = mapped_column(String(100), nullable=True)
    verification_result: Mapped[str] = mapped_column(
        String(50), 
        default="AUTHENTIC", 
        nullable=False
    )
    integrity_valid: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    signature_valid: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    verified_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        default=lambda: datetime.now(timezone.utc), 
        nullable=False
    )
    request_ip: Mapped[str | None] = mapped_column(String(50), nullable=True)
    failure_reason: Mapped[str | None] = mapped_column(String(255), nullable=True)
    is_demo: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
