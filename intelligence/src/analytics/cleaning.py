"""
Data Cleaning & Quality Analysis for CredBridge Intelligence.
Provides deterministic validation, duplicate detection, and 0-100 data quality scoring.
"""

from datetime import date
from typing import List, Dict, Any, Union, Tuple, Set
import pandas as pd

from intelligence.src.models.transaction import (
    TransactionRecord,
    TransactionType,
    TransactionCategory,
)
from intelligence.src.models.data_quality import (
    DataQualityResult,
    QualityStatus,
)
from intelligence.src.models.analytics_result import DataQuality
from intelligence.src.analytics.config import (
    DQ_BASE_SCORE,
    DQ_MISSING_DATE_PENALTY,
    DQ_INVALID_AMOUNT_PENALTY,
    DQ_DUPLICATE_PENALTY,
    DQ_INVALID_CATEGORY_PENALTY,
    DQ_INVALID_TYPE_PENALTY,
    DQ_MIN_MONTHS_RECOMMENDED,
    DQ_SHORT_HISTORY_PENALTY,
)
from intelligence.src.utils.dates import parse_date, is_future_date


VALID_TYPES = {t.value for t in TransactionType}
VALID_CATEGORIES = {c.value for c in TransactionCategory}


def normalize_transactions(records: List[Union[dict, TransactionRecord]]) -> List[TransactionRecord]:
    """
    Normalizes raw input records into validated TransactionRecord objects.
    Records that cannot be converted are excluded.
    """
    normalized = []
    for record in records:
        if isinstance(record, TransactionRecord):
            normalized.append(record)
        elif isinstance(record, dict):
            try:
                rec_copy = dict(record)
                if isinstance(rec_copy.get("transaction_date"), str):
                    parsed_d = parse_date(rec_copy["transaction_date"])
                    if parsed_d:
                        rec_copy["transaction_date"] = parsed_d
                normalized.append(TransactionRecord(**rec_copy))
            except Exception:
                continue
    return normalized


def validate_transaction_dates(
    records: List[Union[dict, TransactionRecord]],
    reference_date: date = None
) -> Dict[str, Any]:
    """
    Validates transaction dates.
    Detects missing, invalid, or future dates.
    """
    missing_dates = []
    invalid_dates = []
    future_dates = []
    valid_records = []

    for idx, rec in enumerate(records):
        d_val = rec.transaction_date if isinstance(rec, TransactionRecord) else rec.get("transaction_date")
        rec_id = rec.id if isinstance(rec, TransactionRecord) else rec.get("id", f"record_{idx}")

        parsed_d = parse_date(d_val)
        if d_val is None:
            missing_dates.append({"record_id": rec_id, "reason": "Date is null or missing"})
        elif parsed_d is None:
            invalid_dates.append({"record_id": rec_id, "raw_value": str(d_val), "reason": "Unparseable date format"})
        elif is_future_date(parsed_d, reference_date):
            future_dates.append({"record_id": rec_id, "date": str(parsed_d), "reason": "Transaction date is in the future"})
        else:
            valid_records.append(rec)

    return {
        "valid_records": valid_records,
        "missing_dates": missing_dates,
        "invalid_dates": invalid_dates,
        "future_dates": future_dates,
        "invalid_count": len(missing_dates) + len(invalid_dates) + len(future_dates),
    }


def validate_transaction_amounts(records: List[Union[dict, TransactionRecord]]) -> Dict[str, Any]:
    """
    Validates transaction amounts.
    Detects null amounts, non-numeric amounts, negative amounts, and zero amounts.
    """
    null_amounts = []
    non_numeric_amounts = []
    negative_amounts = []
    zero_amounts = []
    valid_records = []

    for idx, rec in enumerate(records):
        amt_val = rec.amount if isinstance(rec, TransactionRecord) else rec.get("amount")
        rec_id = rec.id if isinstance(rec, TransactionRecord) else rec.get("id", f"record_{idx}")

        if amt_val is None:
            null_amounts.append({"record_id": rec_id, "reason": "Amount is null"})
            continue

        try:
            amt = float(amt_val)
        except (ValueError, TypeError):
            non_numeric_amounts.append({"record_id": rec_id, "raw_value": str(amt_val), "reason": "Non-numeric amount"})
            continue

        if amt < 0:
            negative_amounts.append({"record_id": rec_id, "amount": amt, "reason": "Negative amount"})
        elif amt == 0:
            zero_amounts.append({"record_id": rec_id, "amount": amt, "reason": "Zero amount"})
        else:
            valid_records.append(rec)

    return {
        "valid_records": valid_records,
        "null_amounts": null_amounts,
        "non_numeric_amounts": non_numeric_amounts,
        "negative_amounts": negative_amounts,
        "zero_amounts": zero_amounts,
        "invalid_count": len(null_amounts) + len(non_numeric_amounts) + len(negative_amounts) + len(zero_amounts),
    }


def remove_duplicate_transactions(records: List[Union[dict, TransactionRecord]]) -> Dict[str, Any]:
    """
    Detects duplicate transactions using composite key:
    worker_id + transaction_date + transaction_type + amount + reference_id
    or (date, amount, source, description) fallback.
    Does not delete records silently; returns clean records and duplicate flag details.
    """
    seen_keys: Set[Tuple] = set()

    cleaned_records = []
    duplicate_records = []

    for idx, rec in enumerate(records):
        if isinstance(rec, TransactionRecord):
            rec_id = rec.id
            w_id = rec.worker_id
            t_date = str(rec.transaction_date) if rec.transaction_date else None
            t_type = rec.transaction_type
            amt = rec.amount
            ref_id = rec.reference_id
            src = rec.source
            desc = rec.description
        else:
            rec_id = rec.get("id", f"record_{idx}")
            w_id = rec.get("worker_id")
            t_date = str(rec.get("transaction_date")) if rec.get("transaction_date") else None
            t_type = rec.get("transaction_type")
            amt = rec.get("amount")
            ref_id = rec.get("reference_id")
            src = rec.get("source")
            desc = rec.get("description")

        # Preferred composite key
        key1 = (w_id, t_date, t_type, amt, ref_id) if ref_id else None
        key2 = (w_id, t_date, t_type, amt, src, desc)

        is_dup = False
        dup_reason = ""

        if key1 and key1 in seen_keys:
            is_dup = True
            dup_reason = f"Duplicate composite key with reference_id: {ref_id}"
        elif key1:
            seen_keys.add(key1)

        if not is_dup:
            if key2 in seen_keys:
                is_dup = True
                dup_reason = f"Duplicate transaction tuple: date={t_date}, type={t_type}, amount={amt}, source={src}"
            else:
                seen_keys.add(key2)

        if is_dup:
            duplicate_records.append({"record_id": rec_id, "reference_id": ref_id, "reason": dup_reason})
        else:
            cleaned_records.append(rec)


    return {
        "cleaned_records": cleaned_records,
        "duplicate_records": duplicate_records,
        "duplicate_count": len(duplicate_records),
    }


def validate_transaction_types(records: List[Union[dict, TransactionRecord]]) -> Dict[str, Any]:
    """
    Validates whether transaction_type is CREDIT or DEBIT.
    """
    invalid_types = []
    valid_records = []

    for idx, rec in enumerate(records):
        t_type = rec.transaction_type if isinstance(rec, TransactionRecord) else rec.get("transaction_type")
        rec_id = rec.id if isinstance(rec, TransactionRecord) else rec.get("id", f"record_{idx}")

        if not t_type or str(t_type).upper() not in VALID_TYPES:
            invalid_types.append({"record_id": rec_id, "type": str(t_type), "reason": "Invalid transaction type"})
        else:
            valid_records.append(rec)

    return {
        "valid_records": valid_records,
        "invalid_types": invalid_types,
        "invalid_count": len(invalid_types),
    }


def validate_transaction_categories(records: List[Union[dict, TransactionRecord]]) -> Dict[str, Any]:
    """
    Validates transaction categories against approved list.
    """
    invalid_categories = []
    valid_records = []

    for idx, rec in enumerate(records):
        cat = rec.category if isinstance(rec, TransactionRecord) else rec.get("category")
        rec_id = rec.id if isinstance(rec, TransactionRecord) else rec.get("id", f"record_{idx}")

        if not cat or str(cat).upper() not in VALID_CATEGORIES:
            invalid_categories.append({"record_id": rec_id, "category": str(cat), "reason": "Invalid category"})
        else:
            valid_records.append(rec)

    return {
        "valid_records": valid_records,
        "invalid_categories": invalid_categories,
        "invalid_count": len(invalid_categories),
    }


def detect_missing_values(records: List[Union[dict, TransactionRecord]]) -> Dict[str, Any]:
    """
    Detects missing mandatory contract fields.
    """
    missing_fields = []
    mandatory = ["id", "worker_id", "transaction_date", "transaction_type", "amount", "category", "source"]

    for idx, rec in enumerate(records):
        rec_id = rec.id if isinstance(rec, TransactionRecord) else rec.get("id", f"record_{idx}")
        rec_missing = []

        for field in mandatory:
            val = getattr(rec, field, None) if isinstance(rec, TransactionRecord) else rec.get(field)
            if val is None or (isinstance(val, str) and not val.strip()):
                rec_missing.append(field)

        if rec_missing:
            missing_fields.append({"record_id": rec_id, "missing_fields": rec_missing})

    return {
        "records_with_missing_values": missing_fields,
        "count": len(missing_fields),
    }


def get_gig_income_transactions(records: List[TransactionRecord]) -> List[TransactionRecord]:
    """
    Deterministic income filter:
    Strictly transaction_type == CREDIT AND category == GIG_INCOME.
    """
    gig_income = []
    for rec in records:
        t_type = str(rec.transaction_type).upper()
        cat = str(rec.category).upper()

        if t_type == TransactionType.CREDIT.value and cat == TransactionCategory.GIG_INCOME.value:
            gig_income.append(rec)

    return gig_income


def compute_data_quality(records: List[Union[dict, TransactionRecord]]) -> DataQuality:
    """
    Computes transparent data quality score (0-100) and warning notes for Phase 2.
    """
    total_count = len(records)
    warnings = []

    if total_count == 0:
        return DataQuality(
            total_transactions=0,
            valid_transactions=0,
            invalid_transactions=0,
            duplicate_transactions=0,
            missing_values=0,
            quality_score=0,
            warnings=["No transaction records provided for analysis."],
        )

    dates_res = validate_transaction_dates(records)
    amounts_res = validate_transaction_amounts(records)
    dup_res = remove_duplicate_transactions(records)
    missing_res = detect_missing_values(records)
    types_res = validate_transaction_types(records)
    cat_res = validate_transaction_categories(records)

    invalid_cnt = dates_res["invalid_count"] + amounts_res["invalid_count"] + types_res["invalid_count"] + cat_res["invalid_count"]
    dup_cnt = dup_res["duplicate_count"]
    missing_cnt = missing_res["count"]
    valid_cnt = max(0, total_count - invalid_cnt - dup_cnt)

    score = DQ_BASE_SCORE

    if dates_res["invalid_count"] > 0:
        penalty = min(30, dates_res["invalid_count"] * DQ_MISSING_DATE_PENALTY)
        score -= penalty
        warnings.append(f"Found {dates_res['invalid_count']} records with missing or invalid transaction dates.")

    if amounts_res["invalid_count"] > 0:
        penalty = min(30, amounts_res["invalid_count"] * DQ_INVALID_AMOUNT_PENALTY)
        score -= penalty
        warnings.append(f"Found {amounts_res['invalid_count']} records with non-positive, null, or invalid amounts.")

    if dup_cnt > 0:
        penalty = min(20, dup_cnt * DQ_DUPLICATE_PENALTY)
        score -= penalty
        warnings.append(f"Detected {dup_cnt} duplicate transaction records.")

    if cat_res["invalid_count"] > 0:
        penalty = min(15, cat_res["invalid_count"] * DQ_INVALID_CATEGORY_PENALTY)
        score -= penalty
        warnings.append(f"Found {cat_res['invalid_count']} records with unrecognized transaction categories.")

    # Calculate months spanned by clean gig income
    normalized = normalize_transactions(dup_res["cleaned_records"])
    gig_recs = get_gig_income_transactions(normalized)
    months = {rec.transaction_date.strftime("%Y-%m") for rec in gig_recs if rec.transaction_date}

    if len(months) < DQ_MIN_MONTHS_RECOMMENDED:
        score -= DQ_SHORT_HISTORY_PENALTY
        warnings.append(f"Income data is available for only {len(months)} month(s). Recommended history is at least {DQ_MIN_MONTHS_RECOMMENDED} months.")

    final_score = max(0, min(100, int(score)))

    return DataQuality(
        total_transactions=total_count,
        valid_transactions=valid_cnt,
        invalid_transactions=invalid_cnt,
        duplicate_transactions=dup_cnt,
        missing_values=missing_cnt,
        quality_score=final_score,
        warnings=warnings,
    )


def assess_data_quality(records: List[Union[dict, TransactionRecord]]) -> DataQualityResult:
    """
    Phase 1 backward-compatible DataQualityResult provider.
    """
    dq = compute_data_quality(records)

    total_count = dq.total_transactions
    if total_count == 0:
        status = QualityStatus.INSUFFICIENT_DATA
    elif dq.quality_score >= 85:
        status = QualityStatus.GOOD
    elif dq.quality_score >= 60:
        status = QualityStatus.WARNING
    else:
        status = QualityStatus.POOR

    dates_res = validate_transaction_dates(records)
    amounts_res = validate_transaction_amounts(records)
    cat_res = validate_transaction_categories(records)
    types_res = validate_transaction_types(records)

    normalized = normalize_transactions(records)
    gig_recs = get_gig_income_transactions(normalized)
    months = {rec.transaction_date.strftime("%Y-%m") for rec in gig_recs if rec.transaction_date}

    return DataQualityResult(
        transaction_count=total_count,
        income_transaction_count=len(gig_recs),
        months_available=len(months),
        missing_dates=dates_res["invalid_count"],
        invalid_amounts=amounts_res["invalid_count"],
        duplicate_transactions=dq.duplicate_transactions,
        invalid_categories=cat_res["invalid_count"],
        invalid_transaction_types=types_res["invalid_count"],
        quality_status=status,
    )
