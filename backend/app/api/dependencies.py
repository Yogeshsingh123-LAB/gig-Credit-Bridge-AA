from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.config import settings
from app.core.security import decode_access_token
from app.models.user import User
from app.models.enums import UserRole
from app.services.auth_service import get_user_by_id

# OAuth2 Bearer token scheme pointing to login endpoint for Swagger UI testing
oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login"
)

def get_current_user(
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
) -> User:
    """
    Validates JWT token from Bearer header and returns the authenticated active user.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    payload = decode_access_token(token)
    if not payload:
        raise credentials_exception
        
    user_id: str = payload.get("sub")
    if not user_id:
        raise credentials_exception

    user = get_user_by_id(db, user_id=user_id)
    if not user:
        raise credentials_exception

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive or disabled."
        )

    return user

def require_worker(current_user: User = Depends(get_current_user)) -> User:
    """
    Role authorization dependency allowing access only to WORKER role users.
    """
    if current_user.role != UserRole.WORKER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to access this resource. Worker role required."
        )
    return current_user

def require_lender(current_user: User = Depends(get_current_user)) -> User:
    """
    Role authorization dependency allowing access only to LENDER role users.
    """
    if current_user.role != UserRole.LENDER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to access this resource. Lender role required."
        )
    return current_user

def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """
    Role authorization dependency allowing access only to ADMIN role users.
    """
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to access this resource. Admin role required."
        )
    return current_user
