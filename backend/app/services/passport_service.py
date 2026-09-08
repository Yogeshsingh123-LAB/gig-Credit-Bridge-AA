import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import desc
from fastapi import HTTPException, status
from app.models.credit_passport import CreditPassport
from app.models.worker_profile import WorkerProfile
from app.models.enums import PassportStatus
from app.services.analytics_service import get_worker_financial_summary
from app.services.verification_service import get_latest_verification, run_income_verification
from app.services.score_service import get_latest_score, calculate_worker_score
from intelligence.src.explanations import generate_ai_explanation

def generate_credit_passport(db: Session, worker_id: str) -> CreditPassport:
    worker = db.query(WorkerProfile).filter(WorkerProfile.id == worker_id).first()
    if not worker:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Worker profile not found.")

    analytics = get_worker_financial_summary(db, worker_id)
    verification = get_latest_verification(db, worker_id) or run_income_verification(db, worker_id)
    score = get_latest_score(db, worker_id) or calculate_worker_score(db, worker_id)

    # Reconstruct intelligence objects for explanation generator
    from intelligence.src.verification import IncomeVerificationResult
    from intelligence.src.scoring import FinancialScoreResult
    
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

    score_res = FinancialScoreResult(
        overall_score=score.overall_score,
        score_band=score.score_band,
        positive_factors=score.positive_factors or [],
        attention_areas=score.attention_areas or [],
        component_scores=score.component_scores or {},
        calculation_summary=score.calculation_summary
    )

    explanation = generate_ai_explanation(analytics, ver_res, score_res)
    passport_num = f"CB-PASS-{uuid.uuid4().hex[:8].upper()}"
    now = datetime.now(timezone.utc)

    # Deactivate previous active passports
    db.query(CreditPassport).filter(
        CreditPassport.worker_id == worker_id,
        CreditPassport.status == PassportStatus.ACTIVE
    ).update({"status": PassportStatus.REVOKED})

    passport = CreditPassport(
        worker_id=worker_id,
        passport_number=passport_num,
        version="v1.0",
        generated_at=now,
        expires_at=now + timedelta(days=90),
        income_summary={
            "total_income": analytics.total_income,
            "average_monthly_income": analytics.avg_monthly_income,
            "total_expenses": analytics.total_expenses,
            "average_monthly_expenses": analytics.avg_monthly_expenses,
            "volatility_percentage": analytics.income_volatility_pct,
            "volatility_class": analytics.income_volatility_class,
            "trend_direction": analytics.income_trend_direction
        },
        verification_summary={
            "verification_status": verification.verification_status,
            "verified_monthly_income": verification.verified_monthly_income,
            "confidence_score": verification.confidence_score,
            "months_analyzed": verification.months_analyzed,
            "summary": verification.verification_summary
        },
        financial_score={
            "overall_score": score.overall_score,
            "score_band": score.score_band,
            "component_scores": score.component_scores
        },
        risk_indicators=score.attention_areas,
        income_sources=[s.model_dump() for s in analytics.source_analysis],
        data_quality=analytics.data_quality.model_dump(),
        explanation=explanation,
        status=PassportStatus.ACTIVE
    )

    db.add(passport)
    db.commit()
    db.refresh(passport)
    return passport

def get_latest_passport(db: Session, worker_id: str) -> Optional[CreditPassport]:
    return db.query(CreditPassport).filter(
        CreditPassport.worker_id == worker_id,
        CreditPassport.status == PassportStatus.ACTIVE
    ).order_by(desc(CreditPassport.generated_at)).first()

def get_passport_by_id(db: Session, passport_id: str) -> Optional[CreditPassport]:
    return db.query(CreditPassport).filter(CreditPassport.id == passport_id).first()

def get_passport_history(db: Session, worker_id: str) -> List[CreditPassport]:
    return db.query(CreditPassport).filter(
        CreditPassport.worker_id == worker_id
    ).order_by(desc(CreditPassport.generated_at)).all()
