from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import desc
from fastapi import HTTPException, status
from app.models.financial_score import FinancialScore
from app.models.worker_profile import WorkerProfile
from app.services.analytics_service import get_worker_financial_summary
from app.services.verification_service import get_latest_verification, run_income_verification
from intelligence.src.scoring import calculate_financial_readiness_score

def calculate_worker_score(db: Session, worker_id: str) -> FinancialScore:
    worker = db.query(WorkerProfile).filter(WorkerProfile.id == worker_id).first()
    if not worker:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Worker profile not found.")

    analytics_result = get_worker_financial_summary(db, worker_id)
    verification = get_latest_verification(db, worker_id)
    
    if not verification:
        verification = run_income_verification(db, worker_id)

    # Convert database verification record to verification result structure
    from intelligence.src.verification import IncomeVerificationResult
    ver_res = IncomeVerificationResult(
        declared_monthly_income=verification.declared_monthly_income,
        observed_average_monthly_income=verification.observed_average_monthly_income,
        verified_monthly_income=verification.verified_monthly_income,
        total_income_observed=verification.total_income_observed,
        months_analyzed=verification.months_analyzed,
        income_sources_count=verification.income_sources_count,
        income_coverage_percentage=verification.income_coverage_percentage,
        volatility_percentage=verification.volatility_percentage,
        confidence_score=verification.confidence_score,
        verification_status=verification.verification_status,
        verification_summary=verification.verification_summary or ""
    )

    score_res = calculate_financial_readiness_score(analytics_result, ver_res)

    financial_score = FinancialScore(
        worker_id=worker_id,
        overall_score=score_res.overall_score,
        score_band=score_res.score_band,
        positive_factors=score_res.positive_factors,
        attention_areas=score_res.attention_areas,
        calculation_summary=score_res.calculation_summary,
        component_scores=score_res.component_scores,
        calculation_version=score_res.calculation_version
    )
    db.add(financial_score)
    db.commit()
    db.refresh(financial_score)
    return financial_score

def get_latest_score(db: Session, worker_id: str) -> Optional[FinancialScore]:
    return db.query(FinancialScore).filter(
        FinancialScore.worker_id == worker_id
    ).order_by(desc(FinancialScore.created_at)).first()
