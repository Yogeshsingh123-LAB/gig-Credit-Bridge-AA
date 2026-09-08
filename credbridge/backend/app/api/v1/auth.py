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
