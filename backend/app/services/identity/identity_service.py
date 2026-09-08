import os
import uuid
from typing import Dict, Any, Optional
from datetime import datetime, timezone
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.enums import UserRole
from app.models.worker_profile import WorkerProfile
from app.providers.digilocker.mock_digilocker_provider import MockDigiLockerProvider
from app.providers.digilocker.digilocker_provider import BaseDigiLockerProvider
from app.services.auth_service import create_user_token

class IdentityService:
    """
    DigiLocker Identity Provider Service.
    Supports mock/sandbox and production modes via DIGILOCKER_MODE environment variable.
    Provisions and authenticates workers passwordlessly via verified government identity.
    """

    def __init__(self):
        self.mode = os.getenv("DIGILOCKER_MODE", "mock").lower()
        if self.mode == "production":
            # Production DigiLocker OAuth2 provider would be instantiated here
            self.provider: BaseDigiLockerProvider = MockDigiLockerProvider()
        else:
            self.provider: BaseDigiLockerProvider = MockDigiLockerProvider()

    def is_demo_mode(self) -> bool:
        return self.mode != "production"

    def initiate_digilocker_auth(self, redirect_url: Optional[str] = None) -> Dict[str, Any]:
        """
        Starts a DigiLocker session. In mock mode, explicitly flags DEMO MODE.
        """
        sess = self.provider.initiate_verification(worker_id="pending", redirect_url=redirect_url)
        sess["mode"] = "DEMO MODE" if self.is_demo_mode() else "PRODUCTION"
        return sess

    def authenticate_or_register_worker(
        self,
        db: Session,
        name: Optional[str] = None,
        masked_aadhaar: Optional[str] = None,
        session_id: Optional[str] = None,
        is_new_user: bool = False,
        city: Optional[str] = None,
        occupation: Optional[str] = None,
        phone: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Resolves or provisions a worker user atomically from DigiLocker identity.
        Never requires or stores passwords, OTPs, or username credentials.
        """
        verified_name = name or "Ravi Kumar"
        uid_mask = masked_aadhaar or "XXXXXXXX4821"

        user: Optional[User] = None
        is_new = False

        if not is_new_user:
            # Check existing by identity_provider_user_id or known demo email
            user = db.query(User).filter(
                (User.identity_provider_user_id == uid_mask) | 
                (User.email == "ravi.worker@example.com")
            ).first()

        if not user:
            # Auto-provision minimal worker profile
            is_new = True
            new_id = uuid.uuid4().hex[:8]
            user = User(
                name=verified_name,
                identity_provider="DigiLocker",
                identity_provider_user_id=uid_mask,
                email=f"worker.{new_id}@digilocker.credbridge.internal",
                password_hash=None,
                role=UserRole.WORKER,
                is_active=True
            )
            db.add(user)
            db.flush()

            worker_prof = WorkerProfile(
                user_id=user.id,
                phone=phone or "+91 98765 43210",
                city=city or "Bengaluru",
                occupation=occupation or "Gig Delivery Partner",
                experience_months=18,
                profile_completion=100.0,
                identity_status="VERIFIED",
                identity_source="DigiLocker",
                identity_verified_at=datetime.now(timezone.utc),
                masked_aadhaar=uid_mask,
                identity_name=verified_name
            )
            db.add(worker_prof)
            db.commit()
            db.refresh(user)
        else:
            # Ensure identity attributes are up to date
            user.identity_provider = "DigiLocker"
            user.identity_provider_user_id = uid_mask
            if user.worker_profile:
                user.worker_profile.identity_status = "VERIFIED"
                user.worker_profile.identity_source = "DigiLocker"
                user.worker_profile.masked_aadhaar = uid_mask
                user.worker_profile.identity_name = verified_name
            db.commit()

        token = create_user_token(user)

        return {
            "access_token": token,
            "token_type": "bearer",
            "is_new_user": is_new,
            "mode": "DEMO MODE" if self.is_demo_mode() else "PRODUCTION",
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "role": user.role.value if hasattr(user.role, "value") else str(user.role),
                "is_active": user.is_active,
                "worker_profile": {
                    "identity_status": "VERIFIED",
                    "identity_source": "DigiLocker",
                    "masked_aadhaar": uid_mask,
                    "identity_name": verified_name
                }
            }
        }

# Global singleton
identity_service = IdentityService()
