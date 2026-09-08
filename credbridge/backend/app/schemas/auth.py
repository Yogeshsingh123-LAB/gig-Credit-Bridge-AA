from pydantic import BaseModel, EmailStr, Field, field_validator, ConfigDict
from typing import Optional
from app.models.enums import UserRole

class RegisterRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100, description="Full name of user")
    email: str = Field(..., min_length=3, max_length=255, description="Valid email address")
    password: str = Field(..., min_length=8, description="Minimum 8 characters password")
    role: UserRole = Field(default=UserRole.WORKER, description="Account role: WORKER or LENDER")

    @field_validator("email", mode="before")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        if isinstance(v, str):
            v = v.strip().lower()
            if "@" not in v:
                raise ValueError("Invalid email format.")
            return v
        return v

    @field_validator("role")
    @classmethod
    def validate_public_role(cls, v: UserRole) -> UserRole:
        if v in [UserRole.ADMIN, UserRole.PLATFORM_ADMIN]:
            raise ValueError("Public registration for ADMIN role is strictly forbidden.")
        return v

class LoginRequest(BaseModel):
    email: str = Field(..., min_length=3, max_length=255, description="Registered email address")
    password: str = Field(..., min_length=1, description="Account password")

    @field_validator("email", mode="before")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        if isinstance(v, str):
            v = v.strip().lower()
            if "@" not in v:
                raise ValueError("Invalid email format.")
            return v
        return v

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class WorkerProfileResponse(BaseModel):
    id: str
    phone: Optional[str] = None
    city: Optional[str] = None
    occupation: Optional[str] = None
    experience_months: int = 0

    model_config = ConfigDict(from_attributes=True)

class LenderProfileResponse(BaseModel):
    id: str
    organization_name: Optional[str] = None
    designation: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class UserResponse(BaseModel):
    id: str
    name: str
    email: EmailStr
    role: UserRole
    is_active: bool
    worker_profile: Optional[WorkerProfileResponse] = None
    lender_profile: Optional[LenderProfileResponse] = None

    model_config = ConfigDict(from_attributes=True)
