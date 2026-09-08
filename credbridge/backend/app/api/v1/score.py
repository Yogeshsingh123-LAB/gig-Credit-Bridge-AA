from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.deps import require_worker
from app.models.worker_profile import WorkerProfile
from app.services.score_service import calculate_worker_score, get_latest_score
from app.services.audit_service import log_audit_action

router = APIRouter()

@router.get("/latest")
def get_latest_readiness_score(
    worker: WorkerProfile = Depends(require_worker),
    db: Session = Depends(get_db)
):
    s = get_latest_score(db, worker.id)
    if not s:
        s = calculate_worker_score(db, worker.id)
    
    return {
        "id": s.id,
        "worker_id": s.worker_id,
        "overall_score": s.overall_score,
        "score_band": s.score_band,
        "positive_factors": s.positive_factors,
        "attention_areas": s.attention_areas,
        "calculation_summary": s.calculation_summary,
        "component_scores": s.component_scores,
        "calculation_version": s.calculation_version,
        "created_at": s.created_at
    }

@router.post("/calculate")
def calculate_readiness_score(
    worker: WorkerProfile = Depends(require_worker),
    db: Session = Depends(get_db)
):
    s = calculate_worker_score(db, worker.id)
    log_audit_action(db, worker.user_id, "CALCULATE_SCORE", "FinancialScore", s.id)
    return {
        "id": s.id,
        "worker_id": s.worker_id,
        "overall_score": s.overall_score,
        "score_band": s.score_band,
        "positive_factors": s.positive_factors,
        "attention_areas": s.attention_areas,
        "calculation_summary": s.calculation_summary,
        "component_scores": s.component_scores,
        "created_at": s.created_at
    }
