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
