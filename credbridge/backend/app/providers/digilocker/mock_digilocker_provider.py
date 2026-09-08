import uuid
from datetime import datetime, timezone
from typing import Dict, Any, Optional
from app.providers.digilocker.digilocker_provider import BaseDigiLockerProvider

class MockDigiLockerProvider(BaseDigiLockerProvider):
    """
    Sandbox / Mock implementation of DigiLocker Identity Verification.
    Used for local development, hackathon demos, and automated testing.
    Never pretends to be a production government connection.
    """

    def __init__(self):
        # In-memory storage of active demo sessions
        self._sessions: Dict[str, Dict[str, Any]] = {}

    def initiate_verification(self, worker_id: str, redirect_url: Optional[str] = None) -> Dict[str, Any]:
        session_id = f"DL-SESS-{uuid.uuid4().hex[:12].upper()}"
        session_data = {
            "session_id": session_id,
            "worker_id": worker_id,
            "status": "INITIATED",
            "provider": "DigiLocker Sandbox",
            "is_demo": True,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "consent_purpose": "Worker Identity Verification for CredBridge",
            "redirect_url": redirect_url or "/worker/onboarding?step=identity-confirm"
        }
        self._sessions[session_id] = session_data
        return session_data

    def verify_identity(self, session_id: str, auth_payload: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        session = self._sessions.get(session_id)
        if not session:
            # Fallback or auto-generate for stateless testing
            session = {
                "session_id": session_id,
                "worker_id": auth_payload.get("worker_id", "unknown") if auth_payload else "unknown",
                "status": "INITIATED"
            }

        # Simulated verified identity information following data minimization
        verified_data = {
            "session_id": session_id,
            "worker_id": session["worker_id"],
            "status": "VERIFIED",
            "provider": "DigiLocker Sandbox",
            "is_demo": True,
            "verification_source": "DigiLocker",
            "verified_name": (auth_payload and auth_payload.get("name")) or "Ravi Kumar Sharma",
            "identity_type": "Aadhaar Card",
            "masked_id": "XXXXXXXX4821",
            "dob": "1994-08-15",
            "gender": "MALE",
            "verified_at": datetime.now(timezone.utc).isoformat(),
            "confidence": 1.0,
            "message": "Identity successfully verified via DigiLocker Sandbox."
        }
        self._sessions[session_id] = verified_data
        return verified_data

    def get_verification_status(self, session_id: str) -> Dict[str, Any]:
        if session_id in self._sessions:
            return self._sessions[session_id]
        return {
            "session_id": session_id,
            "status": "NOT_FOUND",
            "is_demo": True
        }
