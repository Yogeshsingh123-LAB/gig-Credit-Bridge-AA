"""
Comprehensive unit test suite for Phase 2 Financial Analytics Engine.
"""

import json
from pathlib import Path
import pytest
from datetime import date

from intelligence.src.models.analytics_result import (
    FinancialAnalyticsResult,
    VolatilityClassification,
    TrendDirection,
)
from intelligence.src.analytics.financial_analytics import analyze_transactions
from backend.app.services.analytics_service import get_worker_financial_summary

FIXTURES_DIR = Path(__file__).parent / "fixtures"


@pytest.fixture
def synthetic_records():
    with open(FIXTURES_DIR / "synthetic_transactions.json", "r") as f:
        return json.load(f)


def test_analyze_transactions_full_flow(synthetic_records):
    res = analyze_transactions(synthetic_records)

    assert isinstance(res, FinancialAnalyticsResult)
    assert res.income.total_income > 0
    assert res.income.average_monthly_income > 0
    assert res.expenses.total_expenses > 0
    assert len(res.monthly_analysis) >= 5
    assert len(res.source_analysis) >= 3

    # Check source percentage sum ~ 100%
    total_pct = sum(s.percentage_of_income for s in res.source_analysis)
    assert pytest.approx(total_pct, 1.0) == 100.0

    # Data quality score check
    assert 0 <= res.data_quality.quality_score <= 100
    assert isinstance(res.data_quality.warnings, list)


def test_worker_data_isolation(synthetic_records):
    # Add records for another worker
    mixed_records = list(synthetic_records) + [
        {
            "id": "tx_other_01",
            "worker_id": "worker_OTHER_999",
            "transaction_date": "2026-08-01",
            "transaction_type": "CREDIT",
            "amount": 999999.0,
            "category": "GIG_INCOME",
            "source": "SecretSource",
            "description": "Other worker private payout",
            "reference_id": "REF_SECRET_01"
        }
    ]

    res_worker_101 = get_worker_financial_summary("worker_gig_101", transactions_override=mixed_records)

    assert res_worker_101.income.total_income < 999999.0
    assert "SecretSource" not in [s.source for s in res_worker_101.source_analysis]

    # Verify that querying worker_OTHER_999 returns only that worker's data
    res_other = get_worker_financial_summary("worker_OTHER_999", transactions_override=mixed_records)
    assert res_other.income.total_income == 999999.0
    assert len(res_other.source_analysis) == 1
    assert res_other.source_analysis[0].source == "SecretSource"


def test_date_range_filtering(synthetic_records):
    # Filter for March 2026 only
    res_march = analyze_transactions(synthetic_records, start_date="2026-03-01", end_date="2026-03-31")

    assert len(res_march.monthly_analysis) == 1
    assert res_march.monthly_analysis[0].month == "2026-03"
    assert res_march.income.total_income == 9300.0  # 4200 + 5100


def test_volatility_classification():
    # Constant income -> LOW volatility
    constant_income = [
        {"id": "1", "worker_id": "w1", "transaction_date": "2026-01-10", "transaction_type": "CREDIT", "amount": 10000.0, "category": "GIG_INCOME", "source": "Uber"},
        {"id": "2", "worker_id": "w1", "transaction_date": "2026-02-10", "transaction_type": "CREDIT", "amount": 10000.0, "category": "GIG_INCOME", "source": "Uber"},
        {"id": "3", "worker_id": "w1", "transaction_date": "2026-03-10", "transaction_type": "CREDIT", "amount": 10000.0, "category": "GIG_INCOME", "source": "Uber"},
    ]
    res_const = analyze_transactions(constant_income)
    assert res_const.volatility.classification == VolatilityClassification.LOW
    assert res_const.volatility.volatility_percentage == 0.0

    # High fluctuation -> HIGH volatility
    volatile_income = [
        {"id": "1", "worker_id": "w1", "transaction_date": "2026-01-10", "transaction_type": "CREDIT", "amount": 2000.0, "category": "GIG_INCOME", "source": "Uber"},
        {"id": "2", "worker_id": "w1", "transaction_date": "2026-02-10", "transaction_type": "CREDIT", "amount": 20000.0, "category": "GIG_INCOME", "source": "Uber"},
        {"id": "3", "worker_id": "w1", "transaction_date": "2026-03-10", "transaction_type": "CREDIT", "amount": 3000.0, "category": "GIG_INCOME", "source": "Uber"},
    ]
    res_vol = analyze_transactions(volatile_income)
    assert res_vol.volatility.classification == VolatilityClassification.HIGH
    assert res_vol.volatility.volatility_percentage > 30.0


def test_trend_direction():
    increasing_records = [
        {"id": "1", "worker_id": "w1", "transaction_date": "2026-01-10", "transaction_type": "CREDIT", "amount": 10000.0, "category": "GIG_INCOME", "source": "Uber"},
        {"id": "2", "worker_id": "w1", "transaction_date": "2026-02-10", "transaction_type": "CREDIT", "amount": 15000.0, "category": "GIG_INCOME", "source": "Uber"},
        {"id": "3", "worker_id": "w1", "transaction_date": "2026-03-10", "transaction_type": "CREDIT", "amount": 20000.0, "category": "GIG_INCOME", "source": "Uber"},
    ]
    res_inc = analyze_transactions(increasing_records)
    assert res_inc.trend.direction == TrendDirection.INCREASING
    assert res_inc.trend.percentage_change == 100.0


def test_empty_transactions():
    res_empty = analyze_transactions([])
    assert res_empty.income.total_income == 0.0
    assert res_empty.expenses.total_expenses == 0.0
    assert res_empty.volatility.classification == VolatilityClassification.INSUFFICIENT_DATA
    assert res_empty.trend.direction == TrendDirection.INSUFFICIENT_DATA
    assert res_empty.data_quality.quality_score == 0
