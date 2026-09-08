from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
from datetime import datetime

class BaseDigiLockerProvider(ABC):
    """
    Abstract Base Class for DigiLocker Identity Verification Providers.
    Designed for production DigiLocker API or sandbox mock implementations.
    """

    @abstractmethod
    def initiate_verification(self, worker_id: str, redirect_url: Optional[str] = None) -> Dict[str, Any]:
        """
        Initiates an identity verification session.
        Returns session/request tokens, consent URL or verification session ID.
        """
        pass

    @abstractmethod
    def verify_identity(self, session_id: str, auth_payload: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Completes/validates identity verification with DigiLocker.
        Returns verified identity details (name, masked Aadhaar/doc ID, verification status, timestamps).
        """
        pass

    @abstractmethod
    def get_verification_status(self, session_id: str) -> Dict[str, Any]:
        """
        Checks the status of an ongoing verification session.
        """
        pass
