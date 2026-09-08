"""
Unit tests for data cleaning, validation, and quality assessment.
"""

import json
from pathlib import Path
import pytest
from datetime import date

from intelligence.src.models.transaction import TransactionRecord, TransactionType, TransactionCategory
from intelligence.src.models.data_quality import QualityStatus
from intelligence.src.analytics.cleaning import (
    normalize_transactions,
    validate_transaction_dates,
    validate_transaction_amounts,
    remove_duplicate_transactions,
    validate_transaction_types,
    validate_transaction_categories,
    detect_missing_values,
    get_gig_income_transactions,
    assess_data_quality,
)

FIXTURES_DIR = Path(__file__).parent / "fixtures"


@pytest.fixture
def synthetic_records():
    with open(FIXTURES_DIR / "synthetic_transactions.json", "r") as f:
        return json.load(f)


def test_normalize_transactions(synthetic_records):
    normalized = normalize_transactions(synthetic_records)
    assert len(normalized) > 0
    for rec in normalized:
        assert isinstance(rec, TransactionRecord)
        assert isinstance(rec.transaction_date, date)


def test_remove_duplicate_transactions(synthetic_records):
    res = remove_duplicate_transactions(synthetic_records)
    assert res["duplicate_count"] >= 1
    assert any(dup["reference_id"] == "REF_20260818_UC_02" for dup in res["duplicate_records"])
    assert len(res["cleaned_records"]) < len(synthetic_records)


def test_validate_transaction_amounts():
    bad_records = [
        {"id": "1", "amount": 100.0},
        {"id": "2", "amount": None},
        {"id": "3", "amount": -50.0},
        {"id": "4", "amount": 0.0},
        {"id": "5", "amount": "invalid_number"},
    ]
    res = validate_transaction_amounts(bad_records)
    assert len(res["null_amounts"]) == 1
    assert len(res["negative_amounts"]) == 1
    assert len(res["zero_amounts"]) == 1
    assert len(res["non_numeric_amounts"]) == 1
    assert len(res["valid_records"]) == 1


def test_validate_transaction_dates():
    bad_dates = [
        {"id": "1", "transaction_date": "2026-05-10"},
        {"id": "2", "transaction_date": None},
        {"id": "3", "transaction_date": "invalid-date-string"},
        {"id": "4", "transaction_date": "2099-01-01"},
    ]
    ref_d = date(2026, 9, 1)
    res = validate_transaction_dates(bad_dates, reference_date=ref_d)
    assert len(res["missing_dates"]) == 1
    assert len(res["invalid_dates"]) == 1
    assert len(res["future_dates"]) == 1
    assert len(res["valid_records"]) == 1


def test_get_gig_income_transactions(synthetic_records):
    normalized = normalize_transactions(synthetic_records)
    gig_income = get_gig_income_transactions(normalized)

    for rec in gig_income:
        assert rec.transaction_type == TransactionType.CREDIT.value
        assert rec.category == TransactionCategory.GIG_INCOME.value

    types_and_cats = {(r.transaction_type, r.category) for r in gig_income}
    assert (TransactionType.CREDIT.value, TransactionCategory.TRANSFER.value) not in types_and_cats
    assert (TransactionType.DEBIT.value, TransactionCategory.FUEL.value) not in types_and_cats


def test_detect_missing_values():
    incomplete = [
        {"id": "1", "worker_id": "w1", "transaction_date": "2026-01-01", "transaction_type": "CREDIT", "amount": 100, "category": "GIG_INCOME", "source": "Uber"},
        {"id": "2", "worker_id": "", "transaction_date": "2026-01-01", "transaction_type": "CREDIT", "amount": 100, "category": "GIG_INCOME", "source": ""},
    ]
    res = detect_missing_values(incomplete)
    assert res["count"] == 1
    assert "worker_id" in res["records_with_missing_values"][0]["missing_fields"]
    assert "source" in res["records_with_missing_values"][0]["missing_fields"]


def test_assess_data_quality(synthetic_records):
    dq = assess_data_quality(synthetic_records)
    assert dq.transaction_count == len(synthetic_records)
    assert dq.duplicate_transactions >= 1
    assert dq.invalid_amounts >= 1
    assert dq.missing_dates >= 1
    assert dq.quality_status in [QualityStatus.GOOD, QualityStatus.WARNING, QualityStatus.POOR, QualityStatus.INSUFFICIENT_DATA]


def test_empty_dataset_quality():
    dq = assess_data_quality([])
    assert dq.transaction_count == 0
    assert dq.quality_status == QualityStatus.INSUFFICIENT_DATA
