from typing import Any, Dict
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.enums import UserRole
from app.services.profile_service import get_worker_profile, get_lender_profile, update_worker_profile, update_lender_profile

router = APIRouter()

class WorkerProfileUpdateSchema(BaseModel):
    phone: str | None = None
    city: str | None = None
    occupation: str | None = None
    experience_months: int | None = Field(default=None, ge=0)

class LenderProfileUpdateSchema(BaseModel):
    organization_name: str | None = None
    designation: str | None = None

@router.get("")
def get_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    if current_user.role == UserRole.WORKER:
        prof = get_worker_profile(db, current_user.id)
        return {
            "id": prof.id,
            "user_id": current_user.id,
            "name": current_user.name,
            "email": current_user.email,
            "role": current_user.role.value,
            "phone": prof.phone,
            "city": prof.city,
            "occupation": prof.occupation,
            "experience_months": prof.experience_months,
            "profile_completion": prof.profile_completion
        }
    elif current_user.role == UserRole.LENDER:
        prof = get_lender_profile(db, current_user.id)
        return {
            "id": prof.id,
            "user_id": current_user.id,
            "name": current_user.name,
            "email": current_user.email,
            "role": current_user.role.value,
            "organization_name": prof.organization_name,
            "designation": prof.designation
        }
    else:
        return {
            "id": current_user.id,
            "name": current_user.name,
            "email": current_user.email,
            "role": current_user.role.value
        }

@router.put("/worker")
def update_worker(
    req: WorkerProfileUpdateSchema,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != UserRole.WORKER:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Must be a WORKER account.")
    
    prof = update_worker_profile(
        db, current_user.id,
        phone=req.phone,
        city=req.city,
        occupation=req.occupation,
        experience_months=req.experience_months
    )
    return {"message": "Profile updated successfully.", "profile_completion": prof.profile_completion}

@router.put("/lender")
def update_lender(
    req: LenderProfileUpdateSchema,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != UserRole.LENDER:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Must be a LENDER account.")
    
    prof = update_lender_profile(
        db, current_user.id,
        organization_name=req.organization_name,
        designation=req.designation
    )
    return {"message": "Lender profile updated successfully."}
