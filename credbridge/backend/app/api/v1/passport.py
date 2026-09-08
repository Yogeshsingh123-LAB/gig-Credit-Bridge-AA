from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.deps import require_worker, get_current_user
from app.models.user import User
from app.models.worker_profile import WorkerProfile
from app.services.passport_service import generate_credit_passport, get_latest_passport, get_passport_by_id, get_passport_history
from app.services.audit_service import log_audit_action

router = APIRouter()

@router.post("/generate")
def generate_passport(
    worker: WorkerProfile = Depends(require_worker),
    db: Session = Depends(get_db)
):
    passport = generate_credit_passport(db, worker.id)
    log_audit_action(db, worker.user_id, "GENERATE_PASSPORT", "CreditPassport", passport.id)
    return {
        "id": passport.id,
        "passport_number": passport.passport_number,
        "version": passport.version,
        "generated_at": passport.generated_at,
        "expires_at": passport.expires_at,
        "income_summary": passport.income_summary,
        "verification_summary": passport.verification_summary,
        "financial_score": passport.financial_score,
        "risk_indicators": passport.risk_indicators,
        "income_sources": passport.income_sources,
        "data_quality": passport.data_quality,
        "explanation": passport.explanation,
        "status": passport.status.value if hasattr(passport.status, "value") else str(passport.status)
    }

@router.get("/latest")
def get_latest(
    worker: WorkerProfile = Depends(require_worker),
    db: Session = Depends(get_db)
):
    p = get_latest_passport(db, worker.id)
    if not p:
        p = generate_credit_passport(db, worker.id)
    return {
        "id": p.id,
        "passport_number": p.passport_number,
        "version": p.version,
        "generated_at": p.generated_at,
        "expires_at": p.expires_at,
        "income_summary": p.income_summary,
        "verification_summary": p.verification_summary,
        "financial_score": p.financial_score,
        "risk_indicators": p.risk_indicators,
        "income_sources": p.income_sources,
        "data_quality": p.data_quality,
        "explanation": p.explanation,
        "status": p.status.value if hasattr(p.status, "value") else str(p.status)
    }

@router.get("/history")
def get_history(
    worker: WorkerProfile = Depends(require_worker),
    db: Session = Depends(get_db)
):
    history = get_passport_history(db, worker.id)
    return [
        {
            "id": p.id,
            "passport_number": p.passport_number,
            "version": p.version,
            "generated_at": p.generated_at,
            "status": p.status.value if hasattr(p.status, "value") else str(p.status)
        } for p in history
    ]

@router.get("/{passport_id}")
def get_by_id(
    passport_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    p = get_passport_by_id(db, passport_id)
    if not p:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Credit Passport not found.")
    return {
        "id": p.id,
        "passport_number": p.passport_number,
        "version": p.version,
        "generated_at": p.generated_at,
        "expires_at": p.expires_at,
        "income_summary": p.income_summary,
        "verification_summary": p.verification_summary,
        "financial_score": p.financial_score,
        "risk_indicators": p.risk_indicators,
        "income_sources": p.income_sources,
        "data_quality": p.data_quality,
        "explanation": p.explanation,
        "status": p.status.value if hasattr(p.status, "value") else str(p.status)
    }
