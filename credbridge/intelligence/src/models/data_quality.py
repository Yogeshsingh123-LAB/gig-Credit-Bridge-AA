"""
Data Quality Result Schema for CredBridge Intelligence.
Represents structural integrity, missing data flags, and health of ingested transactions.
"""

from enum import Enum
from pydantic import BaseModel, Field, ConfigDict


class QualityStatus(str, Enum):
    GOOD = "GOOD"
    WARNING = "WARNING"
    POOR = "POOR"
    INSUFFICIENT_DATA = "INSUFFICIENT_DATA"


class DataQualityResult(BaseModel):
    """
    Standard data quality structure. Analytical indicator of dataset reliability.
    """
    transaction_count: int = Field(default=0, description="Total number of evaluated records")
    income_transaction_count: int = Field(default=0, description="Number of valid GIG_INCOME credit transactions")
    months_available: int = Field(default=0, description="Count of distinct months spanned by data")
    missing_dates: int = Field(default=0, description="Count of records with missing or unparseable dates")
    invalid_amounts: int = Field(default=0, description="Count of records with non-positive, null, or invalid amounts")
    duplicate_transactions: int = Field(default=0, description="Count of detected duplicate records")
    invalid_categories: int = Field(default=0, description="Count of unrecognized transaction categories")
    invalid_transaction_types: int = Field(default=0, description="Count of unrecognized transaction types")
    quality_status: QualityStatus = Field(default=QualityStatus.INSUFFICIENT_DATA, description="Overall dataset health status")

    model_config = ConfigDict(from_attributes=True)
