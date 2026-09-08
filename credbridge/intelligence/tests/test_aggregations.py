"""
Unit tests for monthly and categorical aggregations.
"""

import json
from pathlib import Path
import pytest

from intelligence.src.analytics.cleaning import normalize_transactions
from intelligence.src.analytics.aggregation import (
    aggregate_monthly_income,
    aggregate_monthly_expenses,
    aggregate_income_by_source,
    aggregate_income_by_category,
)

FIXTURES_DIR = Path(__file__).parent / "fixtures"


@pytest.fixture
def normalized_synthetic():
    with open(FIXTURES_DIR / "synthetic_transactions.json", "r") as f:
        records = json.load(f)
    return normalize_transactions(records)


def test_aggregate_monthly_income(normalized_synthetic):
    monthly_aggs = aggregate_monthly_income(normalized_synthetic)
    assert len(monthly_aggs) >= 5

    months = [m.month for m in monthly_aggs]
    assert months == sorted(months)

    march_agg = next((m for m in monthly_aggs if m.month == "2026-03"), None)
    assert march_agg is not None
    assert march_agg.income == 9300.0
    assert march_agg.transaction_count == 2
    assert "Swiggy" in march_agg.sources
    assert "Uber" in march_agg.sources


def test_aggregate_monthly_expenses(normalized_synthetic):
    expenses = aggregate_monthly_expenses(normalized_synthetic)
    assert "2026-03" in expenses
    assert expenses["2026-03"] == 1200.0
    assert "2026-04" in expenses
    assert expenses["2026-04"] == 2500.0


def test_aggregate_income_by_source(normalized_synthetic):
    source_totals = aggregate_income_by_source(normalized_synthetic)
    assert "Swiggy" in source_totals
    assert "Uber" in source_totals
    assert "Zomato" in source_totals
    assert "Urban Company" in source_totals
    assert source_totals["Swiggy"] > 0


def test_aggregate_income_by_category(normalized_synthetic):
    category_totals = aggregate_income_by_category(normalized_synthetic)
    assert "GIG_INCOME" in category_totals
    assert "FUEL" in category_totals
    assert "MAINTENANCE" in category_totals


def test_empty_aggregations():
    assert aggregate_monthly_income([]) == []
    assert aggregate_monthly_expenses([]) == {}
    assert aggregate_income_by_source([]) == {}
    assert aggregate_income_by_category([]) == {}
