"""
Data Cleaning Foundation for CredBridge Intelligence.
Provides deterministic, explainable validation, duplicate detection, and quality assessment.
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
from intelligence.src.utils.dates import parse_date, is_future_date


VALID_TYPES = {t.value for t in TransactionType}
VALID_CATEGORIES = {c.value for c in TransactionCategory}


def normalize_transactions(records: List[Union[dict, TransactionRecord]]) -> List[TransactionRecord]:
    """
    Normalizes input records (dicts or Pydantic objects) into valid TransactionRecord objects.
    Invalid records that cannot be converted are excluded from the returned list.
    """
    normalized = []
    for record in records:
        if isinstance(record, TransactionRecord):
            normalized.append(record)
        elif isinstance(record, dict):
            try:
                # Ensure date is parsed
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
    Validates transaction dates across input records.
    Detects missing dates, invalid dates, and future dates.
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
    Does not modify financial values; flags them for audit.
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
    Detects duplicate transactions using reference_id (when available)
    or composite keys (date, amount, source, description).
    Does not delete records silently; returns unique records and flagged duplicate details.
    """
    seen_refs: Set[str] = set()
    seen_composites: Set[Tuple] = set()

    cleaned_records = []
    duplicate_records = []

    for idx, rec in enumerate(records):
        if isinstance(rec, TransactionRecord):
            rec_id = rec.id
            ref_id = rec.reference_id
            t_date = str(rec.transaction_date) if rec.transaction_date else None
            amt = rec.amount
            src = rec.source
            desc = rec.description
        else:
            rec_id = rec.get("id", f"record_{idx}")
            ref_id = rec.get("reference_id")
            t_date = str(rec.get("transaction_date")) if rec.get("transaction_date") else None
            amt = rec.get("amount")
            src = rec.get("source")
            desc = rec.get("description")

        is_dup = False
        dup_reason = ""

        if ref_id and ref_id in seen_refs:
            is_dup = True
            dup_reason = f"Duplicate reference_id: {ref_id}"
        elif ref_id:
            seen_refs.add(ref_id)

        composite_key = (t_date, amt, src, desc)
        if not is_dup:
            if composite_key in seen_composites:
                is_dup = True
                dup_reason = f"Duplicate key (date={t_date}, amount={amt}, source={src}, description={desc})"
            else:
                seen_composites.add(composite_key)

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
    Validates whether transaction_type is in VALID_TYPES (CREDIT, DEBIT).
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
    Validates whether category is in VALID_CATEGORIES.
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
    Detects records missing mandatory contract fields.
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
    Deterministic income filter.
    Only includes transactions where transaction_type == CREDIT AND category == GIG_INCOME.
    Explicitly excludes TRANSFER, OTHER, and DEBIT records.
    """
    gig_income = []
    for rec in records:
        t_type = str(rec.transaction_type).upper()
        cat = str(rec.category).upper()

        if t_type == TransactionType.CREDIT.value and cat == TransactionCategory.GIG_INCOME.value:
            gig_income.append(rec)

    return gig_income


def assess_data_quality(records: List[Union[dict, TransactionRecord]]) -> DataQualityResult:
    """
    Evaluates dataset quality and returns a DataQualityResult model.
    """
    total_count = len(records)
    if total_count == 0:
        return DataQualityResult(
            transaction_count=0,
            income_transaction_count=0,
            months_available=0,
            missing_dates=0,
            invalid_amounts=0,
            duplicate_transactions=0,
            invalid_categories=0,
            invalid_transaction_types=0,
            quality_status=QualityStatus.INSUFFICIENT_DATA,
        )

    dates_res = validate_transaction_dates(records)
    amounts_res = validate_transaction_amounts(records)
    dup_res = remove_duplicate_transactions(records)
    types_res = validate_transaction_types(records)
    cat_res = validate_transaction_categories(records)

    normalized = normalize_transactions(records)
    gig_income_recs = get_gig_income_transactions(normalized)

    # Calculate months available from valid gig income records
    months = set()
    for rec in gig_income_recs:
        if rec.transaction_date:
            months.add(rec.transaction_date.strftime("%Y-%m"))

    missing_dates_cnt = dates_res["invalid_count"]
    invalid_amounts_cnt = amounts_res["invalid_count"]
    duplicate_cnt = dup_res["duplicate_count"]
    invalid_types_cnt = types_res["invalid_count"]
    invalid_cat_cnt = cat_res["invalid_count"]

    total_defects = missing_dates_cnt + invalid_amounts_cnt + duplicate_cnt + invalid_types_cnt + invalid_cat_cnt

    if len(gig_income_recs) == 0:
        status = QualityStatus.INSUFFICIENT_DATA
    elif total_defects == 0 and len(months) >= 3:
        status = QualityStatus.GOOD
    elif total_defects <= max(2, int(total_count * 0.15)):
        status = QualityStatus.WARNING
    else:
        status = QualityStatus.POOR

    return DataQualityResult(
        transaction_count=total_count,
        income_transaction_count=len(gig_income_recs),
        months_available=len(months),
        missing_dates=missing_dates_cnt,
        invalid_amounts=invalid_amounts_cnt,
        duplicate_transactions=duplicate_cnt,
        invalid_categories=invalid_cat_cnt,
        invalid_transaction_types=invalid_types_cnt,
        quality_status=status,
    )
