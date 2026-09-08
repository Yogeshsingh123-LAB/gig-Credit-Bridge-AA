from typing import Optional
from sqlalchemy.orm import Session
from app.models.worker_profile import WorkerProfile
from app.models.lender_profile import LenderProfile

def create_worker_profile(db: Session, user_id: str, phone: Optional[str] = None, city: Optional[str] = None) -> WorkerProfile:
    """
    Creates a new WorkerProfile record linked to a User.
    """
    profile = WorkerProfile(
        user_id=user_id,
        phone=phone,
        city=city
    )
    db.add(profile)
    return profile

def create_lender_profile(db: Session, user_id: str, organization_name: Optional[str] = None) -> LenderProfile:
    """
    Creates a new LenderProfile record linked to a User.
    """
    profile = LenderProfile(
        user_id=user_id,
        organization_name=organization_name
    )
    db.add(profile)
    return profile

def get_worker_profile(db: Session, user_id: str) -> Optional[WorkerProfile]:
    return db.query(WorkerProfile).filter(WorkerProfile.user_id == user_id).first()

def get_lender_profile(db: Session, user_id: str) -> Optional[LenderProfile]:
    return db.query(LenderProfile).filter(LenderProfile.user_id == user_id).first()
