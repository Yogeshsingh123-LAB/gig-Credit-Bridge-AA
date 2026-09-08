from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from fastapi import HTTPException, status
from app.models.consent import Consent
from app.models.enums import ConsentStatus
from app.models.lender_profile import LenderProfile
from app.models.worker_profile import WorkerProfile
from app.models.credit_passport import CreditPassport
from app.models.user import User
from app.services.consent_service import validate_lender_consent
from app.services.passport_service import get_passport_by_id
from app.services.analytics_service import get_worker_financial_summary
from intelligence.src.analytics.whatif_simulator import run_whatif_simulation, WhatIfSimulationRequest

def get_lender_dashboard_stats(db: Session, lender_id: str) -> Dict[str, Any]:
    active_consents = db.query(Consent).filter(
        Consent.lender_id == lender_id,
        Consent.status == ConsentStatus.ACTIVE
    ).all()

    worker_ids = [c.worker_id for c in active_consents]
    
    passports = []
    if worker_ids:
        passports = db.query(CreditPassport).filter(
            CreditPassport.worker_id.in_(worker_ids),
            CreditPassport.status == "ACTIVE"
        ).all()

    avg_score = 0.0
    if passports:
        scores = [p.financial_score.get("overall_score", 0.0) for p in passports if isinstance(p.financial_score, dict)]
        avg_score = round(sum(scores) / len(scores), 1) if scores else 0.0

    verif_dist = {"VERIFIED": 0, "PARTIALLY_VERIFIED": 0, "INSUFFICIENT_DATA": 0, "REVIEW_REQUIRED": 0}
    for p in passports:
        v_status = p.verification_summary.get("verification_status", "INSUFFICIENT_DATA") if isinstance(p.verification_summary, dict) else "INSUFFICIENT_DATA"
        verif_dist[v_status] = verif_dist.get(v_status, 0) + 1

    return {
        "shared_applicants_count": len(worker_ids),
        "active_passports_count": len(passports),
        "average_readiness_score": avg_score,
        "verification_distribution": verif_dist
    }

def get_lender_applicants(db: Session, lender_id: str) -> List[Dict[str, Any]]:
    consents = db.query(Consent).filter(
        Consent.lender_id == lender_id,
        Consent.status == ConsentStatus.ACTIVE
    ).order_by(desc(Consent.granted_at)).all()

    results = []
    for c in consents:
        worker = db.query(WorkerProfile).filter(WorkerProfile.id == c.worker_id).first()
        user = db.query(User).filter(User.id == worker.user_id).first() if worker else None
        passport = db.query(CreditPassport).filter(CreditPassport.id == c.passport_id).first()

        if worker and user and passport:
            results.append({
                "consent_id": c.id,
                "worker_id": worker.id,
                "worker_name": user.name,
                "city": worker.city,
                "occupation": worker.occupation,
                "granted_at": c.granted_at,
                "expires_at": c.expires_at,
                "passport_number": passport.passport_number,
                "readiness_score": passport.financial_score.get("overall_score", 0.0) if isinstance(passport.financial_score, dict) else 0.0,
                "score_band": passport.financial_score.get("score_band", "UNSCORED") if isinstance(passport.financial_score, dict) else "UNSCORED",
                "verification_status": passport.verification_summary.get("verification_status", "UNKNOWN") if isinstance(passport.verification_summary, dict) else "UNKNOWN"
            })
    return results

def get_lender_applicant_detail(db: Session, lender_id: str, worker_id: str) -> Dict[str, Any]:
    consent = validate_lender_consent(db, lender_id, worker_id)
    if not consent:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Active worker consent is missing or revoked."
        )

    passport = get_passport_by_id(db, consent.passport_id)
    if not passport:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Shared Credit Passport not found.")

    worker = db.query(WorkerProfile).filter(WorkerProfile.id == worker_id).first()
    user = db.query(User).filter(User.id == worker.user_id).first()

    return {
        "consent": {
            "id": consent.id,
            "granted_at": consent.granted_at,
            "expires_at": consent.expires_at,
            "status": consent.status
        },
        "worker": {
            "id": worker.id,
            "name": user.name,
            "email": user.email,
            "phone": worker.phone,
            "city": worker.city,
            "occupation": worker.occupation,
            "experience_months": worker.experience_months
        },
        "passport": {
            "id": passport.id,
            "passport_number": passport.passport_number,
            "version": passport.version,
            "generated_at": passport.generated_at,
            "income_summary": passport.income_summary,
            "verification_summary": passport.verification_summary,
            "financial_score": passport.financial_score,
            "risk_indicators": passport.risk_indicators,
            "income_sources": passport.income_sources,
            "data_quality": passport.data_quality,
            "explanation": passport.explanation
        }
    }

def run_lender_simulator(db: Session, lender_id: str, worker_id: str, request: WhatIfSimulationRequest) -> Dict[str, Any]:
    consent = validate_lender_consent(db, lender_id, worker_id)
    if not consent:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Consent missing or revoked.")

    passport = get_passport_by_id(db, consent.passport_id)
    if not passport:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Passport not found.")

    analytics = get_worker_financial_summary(db, worker_id)

    from intelligence.src.verification import IncomeVerificationResult
    from intelligence.src.scoring import FinancialScoreResult, calculate_financial_readiness_score

    ver_sum = passport.verification_summary or {}
    ver_res = IncomeVerificationResult(
        declared_monthly_income=ver_sum.get("declared_monthly_income", 0.0),
        observed_average_monthly_income=ver_sum.get("observed_average_monthly_income", analytics.avg_monthly_income),
        verified_monthly_income=ver_sum.get("verified_monthly_income", analytics.avg_monthly_income),
        total_income_observed=analytics.total_income,
        months_analyzed=ver_sum.get("months_analyzed", analytics.months_analyzed),
        income_sources_count=len(analytics.source_breakdown),
        income_coverage_percentage=ver_sum.get("income_coverage_percentage", 100.0),
        volatility_percentage=analytics.income_volatility_pct,
        confidence_score=ver_sum.get("confidence_score", 80.0),
        verification_status=ver_sum.get("verification_status", "VERIFIED"),
        verification_summary=ver_sum.get("summary", "")
    )

    score_res = calculate_financial_readiness_score(analytics, ver_res)
    sim_res = run_whatif_simulation(analytics, ver_res, score_res, request)

    return {
        "worker_id": worker_id,
        "scenario": sim_res.scenario,
        "original_monthly_income": sim_res.original_monthly_income,
        "simulated_monthly_income": sim_res.simulated_monthly_income,
        "income_delta": sim_res.income_delta,
        "original_monthly_expenses": sim_res.original_monthly_expenses,
        "simulated_monthly_expenses": sim_res.simulated_monthly_expenses,
        "expense_delta": sim_res.expense_delta,
        "simulated_net_monthly_income": sim_res.simulated_net_monthly_income,
        "original_readiness_score": sim_res.original_readiness_score,
        "simulated_readiness_score": sim_res.simulated_readiness_score,
        "score_delta": sim_res.score_delta,
        "simulated_score_band": sim_res.simulated_score_band,
        "simulated_verification_status": sim_res.simulated_verification_status,
        "disclaimer": sim_res.disclaimer
    }
