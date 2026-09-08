from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from app.db.session import get_db
from app.api.deps import require_worker, get_current_user
from app.models.worker_profile import WorkerProfile
from app.models.lender_profile import LenderProfile
from app.models.user import User
from app.models.enums import UserRole
from app.services.consent_service import grant_consent, revoke_consent, get_worker_consents
from app.services.passport_service import get_latest_passport, generate_credit_passport
from app.services.audit_service import log_audit_action

router = APIRouter()

class GrantConsentSchema(BaseModel):
    lender_id: str
    passport_id: Optional[str] = None
    duration_days: int = Field(default=30, ge=1, le=180)

class RevokeConsentSchema(BaseModel):
    consent_id: str

@router.post("/grant")
def grant_lender_consent(
    req: GrantConsentSchema,
    worker: WorkerProfile = Depends(require_worker),
    db: Session = Depends(get_db)
):
    passport_id = req.passport_id
    if not passport_id:
        latest_p = get_latest_passport(db, worker.id) or generate_credit_passport(db, worker.id)
        passport_id = latest_p.id

    consent = grant_consent(db, worker.id, req.lender_id, passport_id, duration_days=req.duration_days)
    log_audit_action(db, worker.user_id, "GRANT_CONSENT", "Consent", consent.id, {"lender_id": req.lender_id})
    return {
        "message": "Consent granted successfully to lender.",
        "consent": {
            "id": consent.id,
            "lender_id": consent.lender_id,
            "passport_id": consent.passport_id,
            "granted_at": consent.granted_at,
            "expires_at": consent.expires_at,
            "status": consent.status.value if hasattr(consent.status, "value") else str(consent.status)
        }
    }

@router.post("/revoke")
def revoke_lender_consent(
    req: RevokeConsentSchema,
    worker: WorkerProfile = Depends(require_worker),
    db: Session = Depends(get_db)
):
    consent = revoke_consent(db, worker.id, req.consent_id)
    log_audit_action(db, worker.user_id, "REVOKE_CONSENT", "Consent", consent.id)
    return {"message": "Consent revoked successfully. Lender access has been terminated."}

@router.get("/my-consents")
def my_consents(
    worker: WorkerProfile = Depends(require_worker),
    db: Session = Depends(get_db)
):
    consents = get_worker_consents(db, worker.id)
    results = []
    for c in consents:
        lender = db.query(LenderProfile).filter(LenderProfile.id == c.lender_id).first()
        lender_user = db.query(User).filter(User.id == lender.user_id).first() if lender else None
        results.append({
            "id": c.id,
            "lender_id": c.lender_id,
            "lender_organization": lender.organization_name if lender else "Lender Org",
            "lender_name": lender_user.name if lender_user else "Lender Agent",
            "passport_id": c.passport_id,
            "granted_at": c.granted_at,
            "expires_at": c.expires_at,
            "revoked_at": c.revoked_at,
            "status": c.status.value if hasattr(c.status, "value") else str(c.status)
        })
    return results

@router.get("/lenders-list")
def list_registered_lenders(
    worker: WorkerProfile = Depends(require_worker),
    db: Session = Depends(get_db)
):
    lenders = db.query(LenderProfile).all()
    results = []
    for l in lenders:
        user = db.query(User).filter(User.id == l.user_id).first()
        if user:
            results.append({
                "lender_id": l.id,
                "organization_name": l.organization_name or "Registered Lender",
                "designation": l.designation or "Loan Officer",
                "contact_name": user.name,
                "contact_email": user.email
            })
    return results
