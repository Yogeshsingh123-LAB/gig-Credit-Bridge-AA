import os
import hmac
import hashlib
import json
import uuid
import secrets
from datetime import datetime, timezone
from typing import Dict, Any, Tuple

from app.core.config import settings

# Import Ed25519 from cryptography
try:
    from cryptography.hazmat.primitives.asymmetric import ed25519
    from cryptography.exceptions import InvalidSignature
    HAS_CRYPTOGRAPHY = True
except ImportError:
    HAS_CRYPTOGRAPHY = False

SECRET_KEY = getattr(settings, "SECRET_KEY", "credbridge_secure_server_signature_key_2026")
KEY_VERSION = "v1"

def _get_ed25519_private_key():
    """
    Derives an Ed25519 private key deterministically from the server's private secret.
    The private key stays strictly server-side and is never exposed through APIs or sent to clients.
    """
    seed = hashlib.sha256(f"credbridge_ed25519_signing_seed_{SECRET_KEY}".encode("utf-8")).digest()
    return ed25519.Ed25519PrivateKey.from_private_bytes(seed)

def get_ed25519_public_key_hex() -> str:
    """
    Returns the server's public key in hex format for verifiers.
    """
    if not HAS_CRYPTOGRAPHY:
        return "UNAVAILABLE"
    priv = _get_ed25519_private_key()
    pub = priv.public_key()
    from cryptography.hazmat.primitives import serialization
    return pub.public_bytes(
        encoding=serialization.Encoding.Raw,
        format=serialization.PublicFormat.Raw
    ).hex()

def generate_report_id() -> str:
    """
    Generates a globally unique, non-reusable Report ID following the format:
    CBR-YYYY-XXXX-XXXX-XXXX (e.g., CBR-2026-8F4K-91X7-PLM2).
    """
    year = datetime.now(timezone.utc).year
    chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"  # Exclude ambiguous characters (0, O, 1, I)
    seg1 = "".join(secrets.choice(chars) for _ in range(4))
    seg2 = "".join(secrets.choice(chars) for _ in range(4))
    seg3 = "".join(secrets.choice(chars) for _ in range(4))
    return f"CBR-{year}-{seg1}-{seg2}-{seg3}"

def canonicalize_report_data(report_dict: Dict[str, Any]) -> str:
    """
    Produces a canonical, deterministic JSON representation of key report fields
    suitable for cryptographic hashing.
    """
    canonical_fields = {
        "report_id": report_dict.get("report_id") or report_dict.get("report_number"),
        "analysis_period": {
            "start": str(report_dict.get("analysis_start_date")),
            "end": str(report_dict.get("analysis_end_date"))
        },
        "verified_average_monthly_gig_income": float(report_dict.get("verified_average_monthly_gig_income", 0.0)),
        "total_verified_gig_income": float(report_dict.get("total_verified_gig_income", 0.0)),
        "months_analyzed": int(report_dict.get("months_analyzed", 12)),
        "calculation_version": str(report_dict.get("calculation_version", "v1.0")),
        "accounts_analyzed": sorted(list(report_dict.get("accounts_analyzed", []))),
        "data_source": str(report_dict.get("data_source", "Account Aggregator (Authorized Financial Data)"))
    }
    return json.dumps(canonical_fields, sort_keys=True, separators=(',', ':'))

def compute_canonical_hash(canonical_str: str) -> str:
    """
    Computes the SHA-256 hex digest of the canonical report representation.
    """
    return hashlib.sha256(canonical_str.encode("utf-8")).hexdigest()

def sign_hash(canonical_hash: str) -> str:
    """
    Computes an Ed25519 digital signature of the canonical hash using the private server key.
    Falls back to HMAC-SHA256 if cryptography is not available.
    """
    if HAS_CRYPTOGRAPHY:
        priv = _get_ed25519_private_key()
        sig_bytes = priv.sign(canonical_hash.encode("utf-8"))
        return sig_bytes.hex()
    else:
        return hmac.new(
            SECRET_KEY.encode("utf-8"),
            canonical_hash.encode("utf-8"),
            hashlib.sha256
        ).hexdigest()

def verify_signature(canonical_hash: str, signature: str) -> bool:
    """
    Verifies that the digital signature matches the Ed25519 or HMAC signature of the canonical hash.
    """
    if HAS_CRYPTOGRAPHY:
        try:
            priv = _get_ed25519_private_key()
            pub = priv.public_key()
            pub.verify(bytes.fromhex(signature), canonical_hash.encode("utf-8"))
            return True
        except (InvalidSignature, ValueError):
            # Try HMAC fallback for backward compatibility
            expected = hmac.new(
                SECRET_KEY.encode("utf-8"),
                canonical_hash.encode("utf-8"),
                hashlib.sha256
            ).hexdigest()
            return hmac.compare_digest(expected, signature)
    else:
        expected = hmac.new(
            SECRET_KEY.encode("utf-8"),
            canonical_hash.encode("utf-8"),
            hashlib.sha256
        ).hexdigest()
        return hmac.compare_digest(expected, signature)
