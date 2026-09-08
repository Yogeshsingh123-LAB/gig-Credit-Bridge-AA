"""
Backend Adapter Service connecting FastAPI backend with CredBridge Intelligence Engine.
Enforces worker data isolation and provides analytics service calls.
"""

from datetime import date
from typing import List, Dict, Any, Optional, Union
from sqlalchemy.orm import Session
from app.models.transaction import Transaction
from intelligence.src.models.transaction import TransactionRecord, TransactionType as IntelTxType, TransactionCategory as IntelTxCat
from intelligence.src.models.analytics_result import FinancialAnalyticsResult
from intelligence.src.analytics.financial_analytics import analyze_transactions

def get_worker_financial_summary(
    db_or_worker_id: Any = None,
    worker_id: str = "worker_gig_101",
    start_date: Optional[Union[str, date]] = None,
    end_date: Optional[Union[str, date]] = None,
    transactions_override: Optional[List[Any]] = None,
) -> FinancialAnalyticsResult:
    # Flexible argument resolution for positional calls in tests and service usage
    db = None
    target_worker_id = worker_id

    if isinstance(db_or_worker_id, str):
        target_worker_id = db_or_worker_id
    elif isinstance(db_or_worker_id, Session):
        db = db_or_worker_id

    if transactions_override is not None:
        raw_records = [
            rec for rec in transactions_override
            if (rec.get("worker_id") == target_worker_id if isinstance(rec, dict) else getattr(rec, "worker_id", None) == target_worker_id)
        ]
    elif db is not None:
        db_txs = db.query(Transaction).filter(Transaction.worker_id == target_worker_id).all()
        raw_records = []
        for t in db_txs:
            tx_type = IntelTxType.CREDIT if t.transaction_type.value == "CREDIT" else IntelTxType.DEBIT
            
            cat_val = t.category.value if hasattr(t.category, "value") else str(t.category)
            try:
                intel_cat = IntelTxCat(cat_val)
            except ValueError:
                intel_cat = IntelTxCat.OTHER

            tx_date = t.transaction_date.date() if hasattr(t.transaction_date, "date") else t.transaction_date

            raw_records.append(TransactionRecord(
                id=t.id,
                worker_id=t.worker_id,
                platform_id=t.platform_id,
                transaction_date=tx_date,
                transaction_type=tx_type,
                amount=t.amount,
                category=intel_cat,
                source=t.source,
                description=t.description,
                reference_id=t.reference_id
            ))
    else:
        raw_records = []

    return analyze_transactions(raw_records, start_date=start_date, end_date=end_date)
