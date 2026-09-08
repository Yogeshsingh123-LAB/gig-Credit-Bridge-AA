"""
Backend Adapter Service connecting FastAPI backend with CredBridge Intelligence Engine.
Enforces worker data isolation and provides analytics service calls.
"""

import json
from pathlib import Path
from datetime import date
from typing import List, Dict, Any, Optional, Union

from intelligence.src.models.transaction import TransactionRecord
from intelligence.src.models.analytics_result import FinancialAnalyticsResult
from intelligence.src.analytics.financial_analytics import analyze_transactions

FIXTURES_PATH = Path(__file__).resolve().parents[2] / "intelligence" / "tests" / "fixtures" / "synthetic_transactions.json"


def load_demo_transactions() -> List[Dict[str, Any]]:
    if FIXTURES_PATH.exists():
        with open(FIXTURES_PATH, "r") as f:
            return json.load(f)
    return []


def get_worker_financial_summary(
    worker_id: str,
    start_date: Optional[Union[str, date]] = None,
    end_date: Optional[Union[str, date]] = None,
    transactions_override: Optional[List[Dict[str, Any]]] = None,
) -> FinancialAnalyticsResult:
    raw_records = transactions_override if transactions_override is not None else load_demo_transactions()

    worker_transactions = [
        rec for rec in raw_records
        if (rec.get("worker_id") == worker_id if isinstance(rec, dict) else getattr(rec, "worker_id", None) == worker_id)
    ]

    return analyze_transactions(worker_transactions, start_date=start_date, end_date=end_date)
