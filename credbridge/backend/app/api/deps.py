from typing import Generator, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.security import decode_access_token
from app.models.user import User
from app.models.enums import UserRole
from app.models.worker_profile import WorkerProfile
from app.models.lender_profile import LenderProfile

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

def get_current_user(
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
) -> User:
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token or token has expired.",
            headers={"WWW-Authenticate": "Bearer"}
        )

    user_id = payload["sub"]
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User associated with this token no longer exists.",
            headers={"WWW-Authenticate": "Bearer"}
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive."
        )

    return user

def require_worker(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> WorkerProfile:
    if current_user.role != UserRole.WORKER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: This endpoint is restricted to WORKER accounts."
        )
    profile = db.query(WorkerProfile).filter(WorkerProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Worker profile associated with this account was not found."
        )
    return profile

def require_lender(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> LenderProfile:
    if current_user.role not in [UserRole.LENDER, UserRole.LENDER_ADMIN, UserRole.LENDER_OFFICER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: This endpoint is restricted to LENDER accounts."
        )
    profile = db.query(LenderProfile).filter(LenderProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lender profile associated with this account was not found."
        )
    return profile

def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role not in [UserRole.ADMIN, UserRole.PLATFORM_ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: This endpoint is restricted to ADMIN accounts."
        )
    return current_user

def require_platform_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role not in [UserRole.ADMIN, UserRole.PLATFORM_ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: This endpoint is restricted to Platform Admin accounts."
        )
    return current_user

def require_lender_any(
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
) -> tuple[User, LenderProfile]:
    if current_user.role not in [UserRole.LENDER, UserRole.LENDER_ADMIN, UserRole.LENDER_OFFICER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: This endpoint is restricted to Lender accounts."
        )
    profile = db.query(LenderProfile).filter(LenderProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lender profile associated with this account was not found."
        )
    return current_user, profile

def require_lender_admin(
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
) -> tuple[User, LenderProfile]:
    if current_user.role not in [UserRole.LENDER_ADMIN, UserRole.LENDER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: This action requires Lender Admin role."
        )
    profile = db.query(LenderProfile).filter(LenderProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lender profile associated with this account was not found."
        )
    return current_user, profile

