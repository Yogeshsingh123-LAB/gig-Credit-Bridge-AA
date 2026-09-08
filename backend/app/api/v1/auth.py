from fastapi import APIRouter, Depends, status, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.auth import (
    RegisterRequest,
    LoginRequest,
    TokenResponse,
    UserResponse,
)
from app.services.auth_service import register_user, authenticate_user, create_user_token
from app.api.dependencies import (
    get_current_user,
    require_worker,
    require_lender,
    require_admin,
)
from app.models.user import User

router = APIRouter()

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED, summary="Register User")
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    """
    Registers a new WORKER or LENDER user and creates their role profile atomically.
    Public registration for ADMIN role is blocked.
    """
    user = register_user(db, req)
    return user

@router.post("/login", response_model=TokenResponse, summary="Login for Access Token")
def login(req: LoginRequest, db: Session = Depends(get_db)):
    """
    Authenticates user with JSON email and password, returning a JWT bearer token.
    """
    user = authenticate_user(db, req)
    access_token = create_user_token(user)
    return TokenResponse(access_token=access_token, token_type="bearer")

from pydantic import BaseModel
from typing import Optional
from app.models.enums import UserRole
from app.models.worker_profile import WorkerProfile
from app.core.security import hash_password
from datetime import datetime, timezone
import uuid

class DigiLockerLoginRequest(BaseModel):
    session_id: Optional[str] = None
    masked_aadhaar: Optional[str] = "XXXXXXXX4821"
    name: Optional[str] = "Ravi Kumar"
    is_new_user: Optional[bool] = False
    phone: Optional[str] = "+91 98765 43210"
    city: Optional[str] = "Bengaluru"
    occupation: Optional[str] = "Gig Delivery Partner"
    experience_months: Optional[int] = 18

class DigiLockerLoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    is_new_user: bool
    mode: Optional[str] = "DEMO MODE"
    user: UserResponse

from app.services.identity.identity_service import IdentityService
identity_service = IdentityService()

@router.get("/digilocker/session", summary="Initiate DigiLocker Authentication Session")
def get_digilocker_session():
    """
    Returns session initialization details, including active mode (DEMO MODE vs PRODUCTION).
    """
    return identity_service.initiate_digilocker_auth()

@router.post("/digilocker", response_model=DigiLockerLoginResponse, summary="Authenticate Worker via DigiLocker")
@router.post("/digilocker-login", response_model=DigiLockerLoginResponse, summary="Authenticate Worker via DigiLocker")
def digilocker_login(req: DigiLockerLoginRequest, db: Session = Depends(get_db)):
    """
    Authenticates worker through DigiLocker identity verification.
    If the worker exists, returns JWT token directly.
    If new user, provisions worker profile with verified Aadhaar metadata.
    """
    auth_result = identity_service.authenticate_or_register_worker(
        db=db,
        name=req.name,
        masked_aadhaar=req.masked_aadhaar,
        session_id=req.session_id,
        is_new_user=req.is_new_user or False,
        city=req.city,
        occupation=req.occupation,
        phone=req.phone
    )
    user = db.query(User).filter(User.id == auth_result["user"]["id"]).first()
    return DigiLockerLoginResponse(
        access_token=auth_result["access_token"],
        token_type=auth_result["token_type"],
        is_new_user=auth_result["is_new_user"],
        mode=auth_result.get("mode", "DEMO MODE"),
        user=user
    )

@router.get("/me", response_model=UserResponse, summary="Get Current User Profile")
def get_me(current_user: User = Depends(get_current_user)):
    """
    Protected endpoint returning current authenticated user profile and associated role profile.
    """
    return current_user

# Protected Role Verification Test Endpoints
@router.get("/test-worker", summary="Test Worker Authorization")
def test_worker_auth(current_user: User = Depends(require_worker)):
    return {
        "status": "ok",
        "message": f"Worker access granted to {current_user.email}",
        "role": current_user.role.value
    }

@router.get("/test-lender", summary="Test Lender Authorization")
def test_lender_auth(current_user: User = Depends(require_lender)):
    return {
        "status": "ok",
        "message": f"Lender access granted to {current_user.email}",
        "role": current_user.role.value
    }

@router.get("/test-admin", summary="Test Admin Authorization")
def test_admin_auth(current_user: User = Depends(require_admin)):
    return {
        "status": "ok",
        "message": f"Admin access granted to {current_user.email}",
        "role": current_user.role.value
    }
