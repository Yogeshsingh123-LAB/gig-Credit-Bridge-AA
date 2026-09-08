"""
Backend service bridge for monthly & categorical aggregations.
Integrates intelligence/src/analytics/aggregation.py with FastAPI service layer.
"""

from typing import List, Dict, Any, Union
from intelligence.src.models.transaction import TransactionRecord
from intelligence.src.models.analytics_result import MonthlyAggregate
from intelligence.src.analytics.cleaning import normalize_transactions
from intelligence.src.analytics.aggregation import (
    aggregate_monthly_income,
    aggregate_monthly_expenses,
    aggregate_income_by_source,
    aggregate_income_by_category,
)


def compute_monthly_aggregates(
    records: List[Union[dict, TransactionRecord]]
) -> Dict[str, Any]:
    """
    Computes monthly income, monthly expenses, source breakdowns, and category distributions.
    """
    normalized = normalize_transactions(records)
    monthly_income = aggregate_monthly_income(normalized)
    monthly_expenses = aggregate_monthly_expenses(normalized)
    source_income = aggregate_income_by_source(normalized)
    category_totals = aggregate_income_by_category(normalized)

    return {
        "monthly_income": monthly_income,
        "monthly_expenses": monthly_expenses,
        "income_by_source": source_income,
        "totals_by_category": category_totals,
    }
