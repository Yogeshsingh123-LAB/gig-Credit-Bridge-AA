"""
Backend service bridge for statistical analytics computation.
Integrates intelligence/src/analytics/statistics.py with FastAPI service layer.
"""

from typing import List, Union
from intelligence.src.models.transaction import TransactionRecord
from intelligence.src.models.analytics_result import FinancialAnalyticsResult
from intelligence.src.analytics.statistics import compute_financial_analytics


def analyze_financial_performance(
    records: List[Union[dict, TransactionRecord]]
) -> FinancialAnalyticsResult:
    """
    Executes full financial analytics pipeline and returns standardized FinancialAnalyticsResult.
    """
    return compute_financial_analytics(records)
