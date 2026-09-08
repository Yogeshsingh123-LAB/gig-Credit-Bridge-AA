from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import desc
from fastapi import HTTPException, status
from app.models.income_verification import IncomeVerification
from app.models.worker_profile import WorkerProfile
from app.services.analytics_service import get_worker_financial_summary
from intelligence.src.verification import verify_income

def run_income_verification(
    db: Session,
    worker_id: str,
    declared_monthly_income: float = 0.0
) -> IncomeVerification:
    worker = db.query(WorkerProfile).filter(WorkerProfile.id == worker_id).first()
    if not worker:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Worker profile not found.")

    analytics_result = get_worker_financial_summary(db, worker_id)
    verification_res = verify_income(analytics_result, declared_monthly_income=declared_monthly_income)

    verification = IncomeVerification(
        worker_id=worker_id,
        declared_monthly_income=verification_res.declared_monthly_income,
        observed_average_monthly_income=verification_res.observed_average_monthly_income,
        verified_monthly_income=verification_res.verified_monthly_income,
        total_income_observed=verification_res.total_income_observed,
        months_analyzed=verification_res.months_analyzed,
        income_sources_count=verification_res.income_sources_count,
        income_coverage_percentage=verification_res.income_coverage_percentage,
        volatility_percentage=verification_res.volatility_percentage,
        confidence_score=verification_res.confidence_score,
        verification_status=verification_res.verification_status,
        verification_summary=verification_res.verification_summary,
        calculation_version=verification_res.calculation_version
    )
    db.add(verification)
    db.commit()
    db.refresh(verification)
    return verification

def get_latest_verification(db: Session, worker_id: str) -> Optional[IncomeVerification]:
    return db.query(IncomeVerification).filter(
        IncomeVerification.worker_id == worker_id
    ).order_by(desc(IncomeVerification.created_at)).first()

def get_verification_history(db: Session, worker_id: str) -> List[IncomeVerification]:
    return db.query(IncomeVerification).filter(
        IncomeVerification.worker_id == worker_id
    ).order_by(desc(IncomeVerification.created_at)).all()
