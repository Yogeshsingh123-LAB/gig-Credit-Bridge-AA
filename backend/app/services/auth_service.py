from typing import Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.user import User
from app.models.enums import UserRole
from app.schemas.auth import RegisterRequest, LoginRequest
from app.core.security import hash_password, verify_password, create_access_token
from app.services.profile_service import create_worker_profile, create_lender_profile

def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """
    Fetches a user by normalized email address.
    """
    normalized_email = email.strip().lower()
    return db.query(User).filter(User.email == normalized_email).first()

def get_user_by_id(db: Session, user_id: str) -> Optional[User]:
    """
    Fetches a user by unique ID.
    """
    return db.query(User).filter(User.id == user_id).first()

def register_user(db: Session, req: RegisterRequest) -> User:
    """
    Registers a new WORKER or LENDER user and creates their associated profile atomically.
    Rejects ADMIN registration requests.
    """
    if req.role == UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Public registration for ADMIN role is strictly forbidden."
        )

    # Email uniqueness check
    normalized_email = req.email.strip().lower()
    existing_user = get_user_by_email(db, normalized_email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists."
        )

    # Hash password & create user entity
    hashed_pwd = hash_password(req.password)
    user = User(
        name=req.name.strip(),
        email=normalized_email,
        password_hash=hashed_pwd,
        role=req.role,
        is_active=True
    )

    try:
        db.add(user)
        db.flush()  # Flush to generate user.id

        # Atomic profile creation based on role
        if req.role == UserRole.WORKER:
            create_worker_profile(db, user_id=user.id)
        elif req.role == UserRole.LENDER:
            create_lender_profile(db, user_id=user.id)

        db.commit()
        db.refresh(user)
        return user
    except Exception as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to complete user registration. Transaction rolled back."
        ) from exc

def authenticate_user(db: Session, req: LoginRequest) -> User:
    """
    Authenticates email and password. Verifies account status.
    """
    normalized_email = req.email.strip().lower()
    user = get_user_by_email(db, normalized_email)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={"WWW-Authenticate": "Bearer"}
        )

    if not verify_password(req.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={"WWW-Authenticate": "Bearer"}
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive or disabled."
        )

    return user

def create_user_token(user: User) -> str:
    """
    Generates a signed JWT token for the user.
    """
    return create_access_token(subject=user.id, role=user.role.value)
