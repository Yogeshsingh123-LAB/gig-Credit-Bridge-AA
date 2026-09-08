import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Float, ForeignKey, DateTime, Text, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

class FinancialScore(Base):
    __tablename__ = "financial_scores"

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
    overall_score: Mapped[float] = mapped_column(Float, nullable=False) # 0 to 100
    score_band: Mapped[str] = mapped_column(String(50), nullable=False) # EXCELLENT, GOOD, FAIR, POOR
    positive_factors: Mapped[dict | list] = mapped_column(JSON, default=list, nullable=False)
    attention_areas: Mapped[dict | list] = mapped_column(JSON, default=list, nullable=False)
    calculation_summary: Mapped[str] = mapped_column(Text, nullable=False)
    component_scores: Mapped[dict] = mapped_column(JSON, default=dict, nullable=False)
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
