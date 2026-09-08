"""
Monthly & Categorical Aggregations for CredBridge Intelligence.
Performs deterministic groupings over transaction records.
"""

from typing import List, Dict, Any
import pandas as pd

from intelligence.src.models.transaction import TransactionRecord, TransactionType
from intelligence.src.models.analytics_result import MonthlyAggregate
from intelligence.src.analytics.cleaning import get_gig_income_transactions


def aggregate_monthly_income(records: List[TransactionRecord]) -> List[MonthlyAggregate]:
    """
    Aggregates gig income by calendar month (YYYY-MM).
    Returns a sorted list of MonthlyAggregate objects.
    """
    gig_records = get_gig_income_transactions(records)
    if not gig_records:
        return []

    data = [
        {
            "month": rec.transaction_date.strftime("%Y-%m"),
            "amount": rec.amount,
            "source": rec.source,
        }
        for rec in gig_records
        if rec.transaction_date
    ]

    df = pd.DataFrame(data)
    if df.empty:
        return []

    grouped = df.groupby("month")

    aggregates = []
    for month, group in sorted(grouped):
        month_str = str(month)
        total_income = float(group["amount"].sum())
        tx_count = int(len(group))
        sources = sorted(list(group["source"].unique()))

        aggregates.append(
            MonthlyAggregate(
                month=month_str,
                income=round(total_income, 2),
                transaction_count=tx_count,
                sources=sources,
            )
        )

    return aggregates


def aggregate_monthly_expenses(records: List[TransactionRecord]) -> Dict[str, float]:
    """
    Aggregates expense/DEBIT transactions by month (YYYY-MM).
    Returns dictionary mapping month string to total expense sum.
    """
    debit_records = [r for r in records if str(r.transaction_type).upper() == TransactionType.DEBIT.value]
    if not debit_records:
        return {}

    data = [
        {
            "month": rec.transaction_date.strftime("%Y-%m"),
            "amount": rec.amount,
        }
        for rec in debit_records
        if rec.transaction_date
    ]

    df = pd.DataFrame(data)
    if df.empty:
        return {}

    grouped = df.groupby("month")["amount"].sum()
    return {str(m): round(float(val), 2) for m, val in sorted(grouped.items())}


def aggregate_income_by_source(records: List[TransactionRecord]) -> Dict[str, float]:
    """
    Aggregates gig income by platform source (e.g. Swiggy, Uber, Zomato).
    """
    gig_records = get_gig_income_transactions(records)
    if not gig_records:
        return {}

    data = [{"source": rec.source, "amount": rec.amount} for rec in gig_records]
    df = pd.DataFrame(data)
    if df.empty:
        return {}

    grouped = df.groupby("source")["amount"].sum()
    return {str(src): round(float(val), 2) for src, val in sorted(grouped.items())}


def aggregate_income_by_category(records: List[TransactionRecord]) -> Dict[str, float]:
    """
    Aggregates transaction totals grouped by category across all transactions.
    """
    if not records:
        return {}

    data = [{"category": rec.category, "amount": rec.amount} for rec in records]
    df = pd.DataFrame(data)
    if df.empty:
        return {}

    grouped = df.groupby("category")["amount"].sum()
    return {str(cat): round(float(val), 2) for cat, val in sorted(grouped.items())}
