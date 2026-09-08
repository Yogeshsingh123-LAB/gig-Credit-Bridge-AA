"""
Backend service bridge for data cleaning and quality assessment.
Integrates intelligence/src/analytics/cleaning.py with FastAPI service layer.
"""

from typing import List, Dict, Any, Union
from intelligence.src.models.transaction import TransactionRecord
from intelligence.src.models.data_quality import DataQualityResult
from intelligence.src.analytics.cleaning import (
    normalize_transactions,
    remove_duplicate_transactions,
    validate_transaction_dates,
    validate_transaction_amounts,
    assess_data_quality,
)


def clean_and_validate_transactions(
    records: List[Union[dict, TransactionRecord]]
) -> Dict[str, Any]:
    """
    Cleans raw transaction input, checks data quality, flags duplicates, and returns validated records.
    """
    dq_result = assess_data_quality(records)
    dup_res = remove_duplicate_transactions(records)
    dates_res = validate_transaction_dates(dup_res["cleaned_records"])
    amounts_res = validate_transaction_amounts(dates_res["valid_records"])

    normalized = normalize_transactions(amounts_res["valid_records"])

    return {
        "valid_transactions": normalized,
        "data_quality": dq_result,
        "duplicate_info": dup_res,
        "date_info": dates_res,
        "amount_info": amounts_res,
    }
