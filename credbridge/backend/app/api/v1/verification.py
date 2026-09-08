from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from app.db.session import get_db
from app.api.deps import require_worker
from app.models.worker_profile import WorkerProfile
from app.services.verification_service import run_income_verification, get_latest_verification, get_verification_history
from app.services.audit_service import log_audit_action

router = APIRouter()

class StartVerificationSchema(BaseModel):
    declared_monthly_income: float = Field(default=0.0, ge=0)

@router.post("/start")
def start_verification(
    req: StartVerificationSchema = StartVerificationSchema(),
    worker: WorkerProfile = Depends(require_worker),
    db: Session = Depends(get_db)
):
    verification = run_income_verification(db, worker.id, declared_monthly_income=req.declared_monthly_income)
    log_audit_action(db, worker.user_id, "RUN_VERIFICATION", "IncomeVerification", verification.id)
    return {
        "id": verification.id,
        "worker_id": verification.worker_id,
        "declared_monthly_income": verification.declared_monthly_income,
        "observed_average_monthly_income": verification.observed_average_monthly_income,
        "verified_monthly_income": verification.verified_monthly_income,
        "total_income_observed": verification.total_income_observed,
        "months_analyzed": verification.months_analyzed,
        "income_sources_count": verification.income_sources_count,
        "income_coverage_percentage": verification.income_coverage_percentage,
        "volatility_percentage": verification.volatility_percentage,
        "confidence_score": verification.confidence_score,
        "verification_status": verification.verification_status.value if hasattr(verification.verification_status, "value") else str(verification.verification_status),
        "verification_summary": verification.verification_summary,
        "created_at": verification.created_at
    }

@router.get("/latest")
def get_latest(
    worker: WorkerProfile = Depends(require_worker),
    db: Session = Depends(get_db)
):
    v = get_latest_verification(db, worker.id)
    if not v:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No verification result found. Run verification first.")
    return {
        "id": v.id,
        "worker_id": v.worker_id,
        "declared_monthly_income": v.declared_monthly_income,
        "observed_average_monthly_income": v.observed_average_monthly_income,
        "verified_monthly_income": v.verified_monthly_income,
        "total_income_observed": v.total_income_observed,
        "months_analyzed": v.months_analyzed,
        "income_sources_count": v.income_sources_count,
        "income_coverage_percentage": v.income_coverage_percentage,
        "volatility_percentage": v.volatility_percentage,
        "confidence_score": v.confidence_score,
        "verification_status": v.verification_status.value if hasattr(v.verification_status, "value") else str(v.verification_status),
        "verification_summary": v.verification_summary,
        "created_at": v.created_at
    }

@router.get("/history")
def get_history(
    worker: WorkerProfile = Depends(require_worker),
    db: Session = Depends(get_db)
):
    history = get_verification_history(db, worker.id)
    return [
        {
            "id": v.id,
            "verification_status": v.verification_status.value if hasattr(v.verification_status, "value") else str(v.verification_status),
            "verified_monthly_income": v.verified_monthly_income,
            "confidence_score": v.confidence_score,
            "created_at": v.created_at
        } for v in history
    ]

@router.post("/recalculate")
def recalculate_verification(
    worker: WorkerProfile = Depends(require_worker),
    db: Session = Depends(get_db)
):
    latest = get_latest_verification(db, worker.id)
    declared = latest.declared_monthly_income if latest else 0.0
    return start_verification(req=StartVerificationSchema(declared_monthly_income=declared), worker=worker, db=db)
