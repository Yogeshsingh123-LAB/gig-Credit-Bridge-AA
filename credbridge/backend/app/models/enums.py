from enum import Enum

class UserRole(str, Enum):
    WORKER = "WORKER"
    LENDER = "LENDER"
    ADMIN = "ADMIN"
