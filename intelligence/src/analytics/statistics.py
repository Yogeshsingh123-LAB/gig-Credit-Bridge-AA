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
    aggregate_income_by_source,
)


def calculate_total_income(records: List[TransactionRecord]) -> float:
    """
    Calculates total gig income sum from valid credit gig income transactions.
    """
    gig_records = get_gig_income_transactions(records)
    total = sum(r.amount for r in gig_records)
    return round(float(total), 2)


def calculate_average_monthly_income(aggregates: List[MonthlyAggregate]) -> float:
    """
    Calculates mean monthly gig income across observed months.
    """
    if not aggregates:
        return 0.0
    incomes = [m.income for m in aggregates]
    return round(float(np.mean(incomes)), 2)


def calculate_median_monthly_income(aggregates: List[MonthlyAggregate]) -> float:
    """
    Calculates median monthly gig income across observed months.
    """
    if not aggregates:
        return 0.0
    incomes = [m.income for m in aggregates]
    return round(float(np.median(incomes)), 2)


def calculate_min_monthly_income(aggregates: List[MonthlyAggregate]) -> float:
    """
    Calculates minimum monthly gig income across observed months.
    """
    if not aggregates:
        return 0.0
    incomes = [m.income for m in aggregates]
    return round(float(min(incomes)), 2)


def calculate_max_monthly_income(aggregates: List[MonthlyAggregate]) -> float:
    """
    Calculates maximum monthly gig income across observed months.
    """
    if not aggregates:
        return 0.0
    incomes = [m.income for m in aggregates]
    return round(float(max(incomes)), 2)


def calculate_income_volatility(aggregates: List[MonthlyAggregate]) -> VolatilityResult:
    """
    Calculates income volatility using Coefficient of Variation (CV = std_dev / mean * 100).
    Safely handles single month of data, zero mean, empty data, or NaN.
    Never returns NaN or Infinity.
    """
    if not aggregates or len(aggregates) < 2:
        return VolatilityResult(value=None, status="INSUFFICIENT_DATA")

    incomes = [m.income for m in aggregates]
    mean_val = float(np.mean(incomes))

    if mean_val <= 0:
        return VolatilityResult(value=None, status="INSUFFICIENT_DATA")

    # Sample standard deviation (ddof=1) or population (ddof=0)
    std_val = float(np.std(incomes, ddof=1)) if len(incomes) > 1 else 0.0

    cv_percentage = (std_val / mean_val) * 100.0

    if np.isnan(cv_percentage) or np.isinf(cv_percentage):
        return VolatilityResult(value=None, status="INSUFFICIENT_DATA")

    return VolatilityResult(value=round(cv_percentage, 2), status="CALCULATED")


def calculate_income_trend(aggregates: List[MonthlyAggregate]) -> IncomeTrend:
    """
    Classifies observed historical income trajectory as INCREASING, STABLE, DECREASING, or INSUFFICIENT_DATA.
    Based strictly on observed data slope/changes. Does not make future predictions.
    """
    if not aggregates or len(aggregates) < 2:
        return IncomeTrend.INSUFFICIENT_DATA

    incomes = [m.income for m in aggregates]
    n = len(incomes)

    # Use linear regression slope normalized by mean
    x = np.arange(n)
    mean_income = np.mean(incomes)

    if mean_income <= 0:
        return IncomeTrend.INSUFFICIENT_DATA

    # Fit degree-1 polynomial (slope, intercept)
    slope, _ = np.polyfit(x, incomes, 1)

    # Relative slope percentage per month relative to mean
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
    """
    Calculates income consistency percentage.
    Answers: How consistently does the worker generate income across observed months?
    """
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
    """
    Master function for processing raw transaction records into a complete FinancialAnalyticsResult.
    """
    # 1. Evaluate Data Quality
    dq_result = assess_data_quality(records)

    # 2. Normalize transaction records
    normalized = normalize_transactions(records)

    # 3. Monthly aggregations
    monthly_aggs = aggregate_monthly_income(normalized)

    # 4. Extract platform sources
    gig_recs = get_gig_income_transactions(normalized)
    unique_sources = sorted(list({r.source for r in gig_recs if r.source}))

    # 5. Calculate statistical metrics
    tot_inc = calculate_total_income(normalized)
    avg_inc = calculate_average_monthly_income(monthly_aggs)
    med_inc = calculate_median_monthly_income(monthly_aggs)
    min_inc = calculate_min_monthly_income(monthly_aggs)
    max_inc = calculate_max_monthly_income(monthly_aggs)

    vol_res = calculate_income_volatility(monthly_aggs)
    trend_res = calculate_income_trend(monthly_aggs)
    cons_res = calculate_income_consistency(monthly_aggs)

    return FinancialAnalyticsResult(
        total_income=tot_inc,
        average_monthly_income=avg_inc,
        median_monthly_income=med_inc,
        minimum_monthly_income=min_inc,
        maximum_monthly_income=max_inc,
        months_analyzed=cons_res.months_analyzed,
        months_with_income=cons_res.months_with_income,
        income_volatility_percentage=vol_res.value,
        volatility_status=vol_res.status,
        income_consistency_percentage=cons_res.consistency_percentage,
        income_sources=unique_sources,
        monthly_income=monthly_aggs,
        trend=trend_res,
        data_quality=dq_result,
    )
