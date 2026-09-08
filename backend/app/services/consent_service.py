from datetime import datetime, timedelta, timezone
from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import desc
from fastapi import HTTPException, status
from app.models.consent import Consent
from app.models.enums import ConsentStatus
from app.models.lender_profile import LenderProfile
from app.models.credit_passport import CreditPassport

def grant_consent(
    db: Session,
    worker_id: str,
    lender_id: str,
    passport_id: str,
    duration_days: int = 30
) -> Consent:
    lender = db.query(LenderProfile).filter(LenderProfile.id == lender_id).first()
    if not lender:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lender organization not found.")

    passport = db.query(CreditPassport).filter(
        CreditPassport.id == passport_id,
        CreditPassport.worker_id == worker_id
    ).first()
    if not passport:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Credit Passport not found or unauthorized.")

    # Revoke any prior active consent for this lender & worker
    db.query(Consent).filter(
        Consent.worker_id == worker_id,
        Consent.lender_id == lender_id,
        Consent.status == ConsentStatus.ACTIVE
    ).update({"status": ConsentStatus.REVOKED, "revoked_at": datetime.now(timezone.utc)})

    now = datetime.now(timezone.utc)
    consent = Consent(
        worker_id=worker_id,
        lender_id=lender_id,
        passport_id=passport_id,
        granted_at=now,
        expires_at=now + timedelta(days=duration_days),
        status=ConsentStatus.ACTIVE
    )

    db.add(consent)
    db.commit()
    db.refresh(consent)
    return consent

def revoke_consent(db: Session, worker_id: str, consent_id: str) -> Consent:
    consent = db.query(Consent).filter(
        Consent.id == consent_id,
        Consent.worker_id == worker_id
    ).first()
    if not consent:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Consent record not found.")

    consent.status = ConsentStatus.REVOKED
    consent.revoked_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(consent)
    return consent

def get_worker_consents(db: Session, worker_id: str) -> List[Consent]:
    return db.query(Consent).filter(Consent.worker_id == worker_id).order_by(desc(Consent.granted_at)).all()

def validate_lender_consent(db: Session, lender_id: str, worker_id: str) -> Optional[Consent]:
    """
    Validates if an ACTIVE, unexpired consent exists allowing lender to view worker evidence.
    """
    now = datetime.now(timezone.utc)
    consent = db.query(Consent).filter(
        Consent.lender_id == lender_id,
        Consent.worker_id == worker_id,
        Consent.status == ConsentStatus.ACTIVE
    ).order_by(desc(Consent.granted_at)).first()

    if not consent:
        return None

    if consent.expires_at:
        exp_dt = consent.expires_at if consent.expires_at.tzinfo else consent.expires_at.replace(tzinfo=timezone.utc)
        if exp_dt < now:
            consent.status = ConsentStatus.EXPIRED
            db.commit()
            return None

    return consent
