"""
Financial Analytics Result Schema for CredBridge Intelligence.
Holds aggregated financial metrics, trend indicators, and quality metrics.
"""

from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict
from intelligence.src.models.data_quality import DataQualityResult


class IncomeTrend(str, Enum):
    INCREASING = "INCREASING"
    STABLE = "STABLE"
    DECREASING = "DECREASING"
    INSUFFICIENT_DATA = "INSUFFICIENT_DATA"


class MonthlyAggregate(BaseModel):
    """
    Monthly income aggregation structure.
    """
    month: str = Field(..., description="Month in YYYY-MM format")
    income: float = Field(..., description="Total gig income credited in month")
    transaction_count: int = Field(..., description="Count of gig income transactions in month")
    sources: List[str] = Field(default_factory=list, description="List of income sources in month")

    model_config = ConfigDict(from_attributes=True)


class VolatilityResult(BaseModel):
    """
    Structured outcome for income volatility calculation.
    """
    value: Optional[float] = Field(default=None, description="Coefficient of variation as a percentage")
    status: str = Field(..., description="CALCULATED or INSUFFICIENT_DATA")

    model_config = ConfigDict(from_attributes=True)


class ConsistencyResult(BaseModel):
    """
    Structured outcome for income consistency calculation.
    """
    months_analyzed: int = Field(default=0, description="Total distinct calendar months evaluated")
    months_with_income: int = Field(default=0, description="Count of months with non-zero gig income")
    consistency_percentage: float = Field(default=0.0, description="Percentage of active income months")

    model_config = ConfigDict(from_attributes=True)


class FinancialAnalyticsResult(BaseModel):
    """
    Complete standard financial analytics outcome model.
    """
    total_income: float = Field(default=0.0, description="Sum of all observed gig income")
    average_monthly_income: float = Field(default=0.0, description="Mean monthly income across analyzed months")
    median_monthly_income: float = Field(default=0.0, description="Median monthly income across analyzed months")
    minimum_monthly_income: float = Field(default=0.0, description="Lowest observed monthly income")
    maximum_monthly_income: float = Field(default=0.0, description="Highest observed monthly income")

    months_analyzed: int = Field(default=0, description="Total calendar months analyzed")
    months_with_income: int = Field(default=0, description="Months featuring non-zero gig income")

    income_volatility_percentage: Optional[float] = Field(default=None, description="Volatility expressed as CV %")
    volatility_status: str = Field(default="INSUFFICIENT_DATA", description="Status of volatility calculation")
    income_consistency_percentage: float = Field(default=0.0, description="Income generation consistency %")

    income_sources: List[str] = Field(default_factory=list, description="Unique gig income platform sources")
    monthly_income: List[MonthlyAggregate] = Field(default_factory=list, description="Chronological monthly aggregations")

    trend: IncomeTrend = Field(default=IncomeTrend.INSUFFICIENT_DATA, description="Historical income trajectory trend")
    data_quality: DataQualityResult = Field(default_factory=DataQualityResult, description="Data quality metrics")

    model_config = ConfigDict(from_attributes=True)
