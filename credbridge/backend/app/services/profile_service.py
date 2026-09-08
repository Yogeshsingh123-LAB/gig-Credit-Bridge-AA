from typing import Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.worker_profile import WorkerProfile
from app.models.lender_profile import LenderProfile

def create_worker_profile(db: Session, user_id: str, phone: Optional[str] = None, city: Optional[str] = None) -> WorkerProfile:
    profile = WorkerProfile(
        user_id=user_id,
        phone=phone,
        city=city,
        profile_completion=30.0 if (phone or city) else 10.0
    )
    db.add(profile)
    return profile

def create_lender_profile(db: Session, user_id: str, organization_name: Optional[str] = None) -> LenderProfile:
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

def update_worker_profile(
    db: Session,
    user_id: str,
    phone: Optional[str] = None,
    city: Optional[str] = None,
    occupation: Optional[str] = None,
    experience_months: Optional[int] = None
) -> WorkerProfile:
    profile = get_worker_profile(db, user_id)
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Worker profile not found.")

    if phone is not None:
        profile.phone = phone.strip()
    if city is not None:
        profile.city = city.strip()
    if occupation is not None:
        profile.occupation = occupation.strip()
    if experience_months is not None:
        profile.experience_months = experience_months

    # Calculate profile completion %
    completed_fields = 0
    total_fields = 4
    if profile.phone: completed_fields += 1
    if profile.city: completed_fields += 1
    if profile.occupation: completed_fields += 1
    if profile.experience_months > 0: completed_fields += 1

    profile.profile_completion = round((completed_fields / total_fields) * 100.0, 1)

    db.commit()
    db.refresh(profile)
    return profile

def update_lender_profile(
    db: Session,
    user_id: str,
    organization_name: Optional[str] = None,
    designation: Optional[str] = None
) -> LenderProfile:
    profile = get_lender_profile(db, user_id)
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lender profile not found.")

    if organization_name is not None:
        profile.organization_name = organization_name.strip()
    if designation is not None:
        profile.designation = designation.strip()

    db.commit()
    db.refresh(profile)
    return profile
