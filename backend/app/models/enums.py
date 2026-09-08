from enum import Enum

class UserRole(str, Enum):
    WORKER = "WORKER"
    LENDER = "LENDER"
    ADMIN = "ADMIN"

class PlatformStatus(str, Enum):
    CONNECTED = "CONNECTED"
    DISCONNECTED = "DISCONNECTED"
    PENDING = "PENDING"

class TransactionType(str, Enum):
    CREDIT = "CREDIT"
    DEBIT = "DEBIT"

class TransactionCategory(str, Enum):
    GIG_INCOME = "GIG_INCOME"
    FUEL = "FUEL"
    FOOD = "FOOD"
    MAINTENANCE = "MAINTENANCE"
    TRANSFER = "TRANSFER"
    OTHER = "OTHER"

class VerificationStatus(str, Enum):
    VERIFIED = "VERIFIED"
    PARTIALLY_VERIFIED = "PARTIALLY_VERIFIED"
    INSUFFICIENT_DATA = "INSUFFICIENT_DATA"
    REVIEW_REQUIRED = "REVIEW_REQUIRED"

class ConsentStatus(str, Enum):
    ACTIVE = "ACTIVE"
    EXPIRED = "EXPIRED"
    REVOKED = "REVOKED"

class PassportStatus(str, Enum):
    ACTIVE = "ACTIVE"
    EXPIRED = "EXPIRED"
    REVOKED = "REVOKED"

class AAConsentStatus(str, Enum):
    REQUESTED = "REQUESTED"
    ACTIVE = "ACTIVE"
    USED = "USED"
    EXPIRED = "EXPIRED"
    REVOKED = "REVOKED"
    FAILED = "FAILED"

class TransactionClassificationType(str, Enum):
    GIG_INCOME = "GIG_INCOME"
    NON_GIG_INCOME = "NON_GIG_INCOME"
    EXPENSE = "EXPENSE"
    TRANSFER = "TRANSFER"
    UNKNOWN = "UNKNOWN"

class IdentityVerificationStatus(str, Enum):
    UNVERIFIED = "UNVERIFIED"
    PENDING = "PENDING"
    VERIFIED = "VERIFIED"
    FAILED = "FAILED"
