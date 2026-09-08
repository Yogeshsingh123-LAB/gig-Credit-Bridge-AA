"""
Unit tests for financial statistics, volatility, trend, and consistency calculations.
"""

import json
from pathlib import Path
import pytest

from intelligence.src.models.analytics_result import MonthlyAggregate, IncomeTrend
from intelligence.src.analytics.cleaning import normalize_transactions
from intelligence.src.analytics.aggregation import aggregate_monthly_income
from intelligence.src.analytics.statistics import (
    calculate_total_income,
    calculate_average_monthly_income,
    calculate_median_monthly_income,
    calculate_min_monthly_income,
    calculate_max_monthly_income,
    calculate_income_volatility,
    calculate_income_trend,
    calculate_income_consistency,
    compute_financial_analytics,
)

FIXTURES_DIR = Path(__file__).parent / "fixtures"


@pytest.fixture
def normalized_synthetic():
    with open(FIXTURES_DIR / "synthetic_transactions.json", "r") as f:
        records = json.load(f)
    return normalize_transactions(records)


def test_basic_statistics(normalized_synthetic):
    monthly_aggs = aggregate_monthly_income(normalized_synthetic)

    tot = calculate_total_income(normalized_synthetic)
    avg = calculate_average_monthly_income(monthly_aggs)
    med = calculate_median_monthly_income(monthly_aggs)
    min_inc = calculate_min_monthly_income(monthly_aggs)
    max_inc = calculate_max_monthly_income(monthly_aggs)

    assert tot > 0
    assert min_inc <= avg <= max_inc
    assert min_inc <= med <= max_inc


def test_income_volatility():
    # Test safe handling of single month
    single_month = [MonthlyAggregate(month="2026-01", income=10000.0, transaction_count=5, sources=["Uber"])]
    vol_single = calculate_income_volatility(single_month)
    assert vol_single.value is None
    assert vol_single.status == "INSUFFICIENT_DATA"

    # Test multi-month calculation
    multi_months = [
        MonthlyAggregate(month="2026-01", income=10000.0, transaction_count=5, sources=["Uber"]),
        MonthlyAggregate(month="2026-02", income=12000.0, transaction_count=6, sources=["Uber"]),
        MonthlyAggregate(month="2026-03", income=11000.0, transaction_count=5, sources=["Uber"]),
    ]
    vol_multi = calculate_income_volatility(multi_months)
    assert vol_multi.value is not None
    assert vol_multi.status == "CALCULATED"
    assert vol_multi.value > 0

    # Test zero mean / empty
    assert calculate_income_volatility([]).status == "INSUFFICIENT_DATA"


def test_income_trend():
    # Empty or single month
    assert calculate_income_trend([]) == IncomeTrend.INSUFFICIENT_DATA

    # Increasing trend
    increasing = [
        MonthlyAggregate(month="2026-01", income=10000.0, transaction_count=5, sources=[]),
        MonthlyAggregate(month="2026-02", income=12000.0, transaction_count=5, sources=[]),
        MonthlyAggregate(month="2026-03", income=15000.0, transaction_count=5, sources=[]),
        MonthlyAggregate(month="2026-04", income=18000.0, transaction_count=5, sources=[]),
    ]
    assert calculate_income_trend(increasing) == IncomeTrend.INCREASING

    # Decreasing trend
    decreasing = [
        MonthlyAggregate(month="2026-01", income=20000.0, transaction_count=5, sources=[]),
        MonthlyAggregate(month="2026-02", income=15000.0, transaction_count=5, sources=[]),
        MonthlyAggregate(month="2026-03", income=10000.0, transaction_count=5, sources=[]),
    ]
    assert calculate_income_trend(decreasing) == IncomeTrend.DECREASING

    # Stable trend
    stable = [
        MonthlyAggregate(month="2026-01", income=10000.0, transaction_count=5, sources=[]),
        MonthlyAggregate(month="2026-02", income=10100.0, transaction_count=5, sources=[]),
        MonthlyAggregate(month="2026-03", income=9950.0, transaction_count=5, sources=[]),
    ]
    assert calculate_income_trend(stable) == IncomeTrend.STABLE


def test_income_consistency():
    months = [
        MonthlyAggregate(month="2026-01", income=10000.0, transaction_count=5, sources=[]),
        MonthlyAggregate(month="2026-02", income=0.0, transaction_count=0, sources=[]),
        MonthlyAggregate(month="2026-03", income=12000.0, transaction_count=5, sources=[]),
    ]
    cons = calculate_income_consistency(months)
    assert cons.months_analyzed == 3
    assert cons.months_with_income == 2
    assert cons.consistency_percentage == pytest.approx(66.67, 0.1)


def test_compute_financial_analytics(normalized_synthetic):
    with open(FIXTURES_DIR / "synthetic_transactions.json", "r") as f:
        raw_records = json.load(f)

    result = compute_financial_analytics(raw_records)

    assert result.total_income > 0
    assert result.average_monthly_income > 0
    assert len(result.monthly_income) > 0
    assert result.data_quality.transaction_count == len(raw_records)
    assert "Swiggy" in result.income_sources
