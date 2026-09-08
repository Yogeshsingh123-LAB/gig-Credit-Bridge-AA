"""
Financial Analytics Result Schemas for CredBridge Intelligence (Phase 1 & Phase 2).
Provides strongly typed Pydantic structures for income, expense, monthly, source, volatility, trend, and data quality analytics.
"""

from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict


class VolatilityClassification(str, Enum):
    LOW = "LOW"
    MODERATE = "MODERATE"
    HIGH = "HIGH"
    INSUFFICIENT_DATA = "INSUFFICIENT_DATA"


class TrendDirection(str, Enum):
    INCREASING = "INCREASING"
    STABLE = "STABLE"
    DECREASING = "DECREASING"
    INSUFFICIENT_DATA = "INSUFFICIENT_DATA"


class IncomeAnalysis(BaseModel):
    total_income: float = Field(default=0.0, description="Sum of all verified gig income")
    average_monthly_income: float = Field(default=0.0, description="Mean monthly gig income")
    median_monthly_income: float = Field(default=0.0, description="Median monthly gig income")
    minimum_monthly_income: float = Field(default=0.0, description="Lowest observed monthly income")
    maximum_monthly_income: float = Field(default=0.0, description="Highest observed monthly income")
    income_months: int = Field(default=0, description="Number of distinct months with income")
    active_income_sources: int = Field(default=0, description="Count of distinct gig platforms contributing income")

    model_config = ConfigDict(from_attributes=True)


class ExpenseAnalysis(BaseModel):
    total_expenses: float = Field(default=0.0, description="Sum of all debit expense transactions")
    average_monthly_expenses: float = Field(default=0.0, description="Mean monthly debit expenses")
    median_monthly_expenses: float = Field(default=0.0, description="Median monthly debit expenses")
    minimum_monthly_expenses: float = Field(default=0.0, description="Lowest observed monthly expenses")
    maximum_monthly_expenses: float = Field(default=0.0, description="Highest observed monthly expenses")

    model_config = ConfigDict(from_attributes=True)


class MonthlyAnalysis(BaseModel):
    month: str = Field(..., description="Calendar month in YYYY-MM format")
    income: float = Field(default=0.0, description="Total gig income in month")
    expenses: float = Field(default=0.0, description="Total expenses in month")
    net_income: float = Field(default=0.0, description="Monthly income minus monthly expenses")
    transaction_count: int = Field(default=0, description="Total transactions in month")
    sources: List[str] = Field(default_factory=list, description="List of income sources in month")

    model_config = ConfigDict(from_attributes=True)


class SourceAnalysis(BaseModel):
    source: str = Field(..., description="Platform or income source name (e.g. Swiggy, Uber)")
    total_income: float = Field(default=0.0, description="Total income earned from this source")
    percentage_of_income: float = Field(default=0.0, description="Percentage contribution to total gig income")
    transaction_count: int = Field(default=0, description="Number of transactions from this source")

    model_config = ConfigDict(from_attributes=True)


class VolatilityAnalysis(BaseModel):
    coefficient_of_variation: Optional[float] = Field(default=None, description="Ratio of std dev to mean (CV)")
    volatility_percentage: Optional[float] = Field(default=None, description="Coefficient of Variation expressed as %")
    classification: VolatilityClassification = Field(default=VolatilityClassification.INSUFFICIENT_DATA, description="Analytical volatility level")

    model_config = ConfigDict(from_attributes=True)


class TrendAnalysis(BaseModel):
    direction: TrendDirection = Field(default=TrendDirection.INSUFFICIENT_DATA, description="Income trajectory direction")
    percentage_change: Optional[float] = Field(default=None, description="Observed percentage change across period")
    confidence: float = Field(default=0.0, description="Statistical confidence score between 0.0 and 1.0")

    model_config = ConfigDict(from_attributes=True)


class DataQuality(BaseModel):
    total_transactions: int = Field(default=0, description="Total transaction records evaluated")
    valid_transactions: int = Field(default=0, description="Count of clean, valid transactions")
    invalid_transactions: int = Field(default=0, description="Count of records with invalid dates, amounts, or types")
    duplicate_transactions: int = Field(default=0, description="Count of detected duplicate records")
    missing_values: int = Field(default=0, description="Count of missing essential fields")
    quality_score: int = Field(default=100, description="Data evidence quality score from 0 to 100")
    warnings: List[str] = Field(default_factory=list, description="Descriptive data quality warning notes")

    model_config = ConfigDict(from_attributes=True)

    @property
    def transaction_count(self) -> int:
        return self.total_transactions


class FinancialAnalyticsResult(BaseModel):
    income: IncomeAnalysis = Field(default_factory=IncomeAnalysis, description="Income analytics breakdown")
    expenses: ExpenseAnalysis = Field(default_factory=ExpenseAnalysis, description="Expense analytics breakdown")
    monthly_analysis: List[MonthlyAnalysis] = Field(default_factory=list, description="Chronological monthly analysis")
    source_analysis: List[SourceAnalysis] = Field(default_factory=list, description="Income source contribution breakdown")
    volatility: VolatilityAnalysis = Field(default_factory=VolatilityAnalysis, description="Income volatility assessment")
    trend: TrendAnalysis = Field(default_factory=TrendAnalysis, description="Historical trend analysis")
    data_quality: DataQuality = Field(default_factory=DataQuality, description="Data quality & completeness score")

    model_config = ConfigDict(from_attributes=True)

    # Phase 1 Backward Compatibility Property Accessors
    @property
    def total_income(self) -> float:
        return self.income.total_income

    @property
    def average_monthly_income(self) -> float:
        return self.income.average_monthly_income

    @property
    def median_monthly_income(self) -> float:
        return self.income.median_monthly_income

    @property
    def minimum_monthly_income(self) -> float:
        return self.income.minimum_monthly_income

    @property
    def maximum_monthly_income(self) -> float:
        return self.income.maximum_monthly_income

    @property
    def months_analyzed(self) -> int:
        return len(self.monthly_analysis)

    @property
    def months_with_income(self) -> int:
        return self.income.income_months

    @property
    def income_volatility_percentage(self) -> Optional[float]:
        return self.volatility.volatility_percentage

    @property
    def volatility_status(self) -> str:
        return "CALCULATED" if self.volatility.volatility_percentage is not None else "INSUFFICIENT_DATA"

    @property
    def income_consistency_percentage(self) -> float:
        if not self.monthly_analysis:
            return 0.0
        return round((self.income.income_months / len(self.monthly_analysis)) * 100.0, 2)

    @property
    def income_sources(self) -> List[str]:
        return [s.source for s in self.source_analysis]

    @property
    def monthly_income(self) -> List[MonthlyAnalysis]:
        return self.monthly_analysis


# Phase 1 Backward Compatibility Models & Aliases
class VolatilityResult(BaseModel):
    value: Optional[float] = Field(default=None)
    status: str = Field(default="INSUFFICIENT_DATA")


class ConsistencyResult(BaseModel):
    months_analyzed: int = Field(default=0)
    months_with_income: int = Field(default=0)
    consistency_percentage: float = Field(default=0.0)


MonthlyAggregate = MonthlyAnalysis
IncomeTrend = TrendDirection
