"""
Financial Statistics & Analytics Engine for CredBridge Intelligence.
Provides deterministic, explainable calculations for income, volatility, trend, and consistency.
"""

from typing import List, Dict, Any, Union, Optional
import numpy as np
import pandas as pd

from intelligence.src.models.transaction import TransactionRecord
from intelligence.src.models.data_quality import DataQualityResult
from intelligence.src.models.analytics_result import (
    FinancialAnalyticsResult,
    MonthlyAggregate,
    VolatilityResult,
    ConsistencyResult,
    IncomeTrend,
)
from intelligence.src.analytics.cleaning import (
    normalize_transactions,
    get_gig_income_transactions,
    assess_data_quality,
)
from intelligence.src.analytics.aggregation import (
    aggregate_monthly_income,
)


def calculate_total_income(records: List[TransactionRecord]) -> float:
    gig_records = get_gig_income_transactions(records)
    total = sum(r.amount for r in gig_records)
    return round(float(total), 2)


def calculate_average_monthly_income(aggregates: List[MonthlyAggregate]) -> float:
    if not aggregates:
        return 0.0
    incomes = [m.income for m in aggregates]
    return round(float(np.mean(incomes)), 2)


def calculate_median_monthly_income(aggregates: List[MonthlyAggregate]) -> float:
    if not aggregates:
        return 0.0
    incomes = [m.income for m in aggregates]
    return round(float(np.median(incomes)), 2)


def calculate_min_monthly_income(aggregates: List[MonthlyAggregate]) -> float:
    if not aggregates:
        return 0.0
    incomes = [m.income for m in aggregates]
    return round(float(min(incomes)), 2)


def calculate_max_monthly_income(aggregates: List[MonthlyAggregate]) -> float:
    if not aggregates:
        return 0.0
    incomes = [m.income for m in aggregates]
    return round(float(max(incomes)), 2)


def calculate_income_volatility(aggregates: List[MonthlyAggregate]) -> VolatilityResult:
    if not aggregates or len(aggregates) < 2:
        return VolatilityResult(value=None, status="INSUFFICIENT_DATA")

    incomes = [m.income for m in aggregates]
    mean_val = float(np.mean(incomes))

    if mean_val <= 0:
        return VolatilityResult(value=None, status="INSUFFICIENT_DATA")

    std_val = float(np.std(incomes, ddof=1)) if len(incomes) > 1 else 0.0
    cv_percentage = (std_val / mean_val) * 100.0

    if np.isnan(cv_percentage) or np.isinf(cv_percentage):
        return VolatilityResult(value=None, status="INSUFFICIENT_DATA")

    return VolatilityResult(value=round(cv_percentage, 2), status="CALCULATED")


def calculate_income_trend(aggregates: List[MonthlyAggregate]) -> IncomeTrend:
    if not aggregates or len(aggregates) < 2:
        return IncomeTrend.INSUFFICIENT_DATA

    incomes = [m.income for m in aggregates]
    n = len(incomes)
    x = np.arange(n)
    mean_income = np.mean(incomes)

    if mean_income <= 0:
        return IncomeTrend.INSUFFICIENT_DATA

    slope, _ = np.polyfit(x, incomes, 1)
    relative_slope_pct = (slope / mean_income) * 100.0

    if relative_slope_pct > 3.0:
        return IncomeTrend.INCREASING
    elif relative_slope_pct < -3.0:
        return IncomeTrend.DECREASING
    else:
        return IncomeTrend.STABLE


def calculate_income_consistency(
    aggregates: List[MonthlyAggregate],
    total_span_months: Optional[int] = None
) -> ConsistencyResult:
    if not aggregates:
        return ConsistencyResult(months_analyzed=0, months_with_income=0, consistency_percentage=0.0)

    months_with_income = sum(1 for m in aggregates if m.income > 0)
    months_analyzed = total_span_months if total_span_months and total_span_months > 0 else len(aggregates)

    if months_analyzed == 0:
        pct = 0.0
    else:
        pct = (months_with_income / months_analyzed) * 100.0

    return ConsistencyResult(
        months_analyzed=months_analyzed,
        months_with_income=months_with_income,
        consistency_percentage=round(pct, 2),
    )


def compute_financial_analytics(records: List[Union[dict, TransactionRecord]]) -> FinancialAnalyticsResult:
    from intelligence.src.analytics.financial_analytics import analyze_transactions
    return analyze_transactions(records)
