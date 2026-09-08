"""
Analytics subpackage exports for Phase 1 & Phase 2.
"""

from intelligence.src.analytics.cleaning import (
    normalize_transactions,
    validate_transaction_dates,
    validate_transaction_amounts,
    remove_duplicate_transactions,
    validate_transaction_types,
    validate_transaction_categories,
    detect_missing_values,
    get_gig_income_transactions,
    compute_data_quality,
    assess_data_quality,
)
from intelligence.src.analytics.aggregation import (
    aggregate_monthly_income,
    aggregate_monthly_expenses,
    aggregate_income_by_source,
    aggregate_income_by_category,
)
from intelligence.src.analytics.statistics import (
    calculate_total_income,
    calculate_average_monthly_income,
    calculate_median_monthly_income,
    calculate_min_monthly_income,
    calculate_max_monthly_income,
    calculate_income_volatility,
    calculate_income_trend,
    calculate_income_consistency,
    compute_financial_analytics,
)
from intelligence.src.analytics.financial_analytics import analyze_transactions
from intelligence.src.analytics.config import (
    VOLATILITY_LOW_THRESHOLD,
    VOLATILITY_MODERATE_THRESHOLD,
    TREND_CHANGE_THRESHOLD,
)

__all__ = [
    "normalize_transactions",
    "validate_transaction_dates",
    "validate_transaction_amounts",
    "remove_duplicate_transactions",
    "validate_transaction_types",
    "validate_transaction_categories",
    "detect_missing_values",
    "get_gig_income_transactions",
    "compute_data_quality",
    "assess_data_quality",
    "aggregate_monthly_income",
    "aggregate_monthly_expenses",
    "aggregate_income_by_source",
    "aggregate_income_by_category",
    "calculate_total_income",
    "calculate_average_monthly_income",
    "calculate_median_monthly_income",
    "calculate_min_monthly_income",
    "calculate_max_monthly_income",
    "calculate_income_volatility",
    "calculate_income_trend",
    "calculate_income_consistency",
    "compute_financial_analytics",
    "analyze_transactions",
    "VOLATILITY_LOW_THRESHOLD",
    "VOLATILITY_MODERATE_THRESHOLD",
    "TREND_CHANGE_THRESHOLD",
]
