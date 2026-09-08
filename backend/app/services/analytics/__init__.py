"""
Backend Analytics Services integration bridges.
Exposes intelligence analytics functionality to FastAPI backend modules.
"""

from backend.app.services.analytics.data_cleaning import clean_and_validate_transactions
from backend.app.services.analytics.aggregations import compute_monthly_aggregates
from backend.app.services.analytics.statistics import analyze_financial_performance

__all__ = [
    "clean_and_validate_transactions",
    "compute_monthly_aggregates",
    "analyze_financial_performance",
]
