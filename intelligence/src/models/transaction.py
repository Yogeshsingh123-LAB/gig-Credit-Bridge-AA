"""
Transaction Data Contract models for CredBridge Intelligence.
Defines standardized internal representations of transaction records.
"""

from datetime import date
from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


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


class TransactionRecord(BaseModel):
    """
    Standard transaction contract for financial analytics ingestion.
    """
    id: str = Field(..., description="Unique transaction ID")
    worker_id: str = Field(..., description="Unique gig worker identifier")
    transaction_date: date = Field(..., description="Date of the transaction")
    transaction_type: str = Field(..., description="CREDIT or DEBIT")
    amount: float = Field(..., description="Transaction monetary value")
    category: str = Field(..., description="Category classification (e.g. GIG_INCOME, FUEL)")
    source: str = Field(..., description="Originating platform or bank stream (e.g. Swiggy, Uber)")
    description: Optional[str] = Field(default=None, description="Optional description or note")
    reference_id: Optional[str] = Field(default=None, description="Optional bank or gateway reference ID")

    model_config = ConfigDict(from_attributes=True)
