"""
Main Financial Analytics Service Entrypoint for CredBridge Intelligence (Phase 2).
Provides deterministic, reproducible financial analysis from transaction records.
"""

from datetime import date
from typing import List, Union, Optional
import numpy as np
import pandas as pd

from intelligence.src.models.transaction import TransactionRecord, TransactionType
from intelligence.src.models.analytics_result import (
    FinancialAnalyticsResult,
    IncomeAnalysis,
    ExpenseAnalysis,
    MonthlyAnalysis,
    SourceAnalysis,
    VolatilityAnalysis,
    VolatilityClassification,
    TrendAnalysis,
    TrendDirection,
)
from intelligence.src.analytics.config import (
    VOLATILITY_LOW_THRESHOLD,
    VOLATILITY_MODERATE_THRESHOLD,
    TREND_CHANGE_THRESHOLD,
)
from intelligence.src.analytics.cleaning import (
    normalize_transactions,
    remove_duplicate_transactions,
    get_gig_income_transactions,
    compute_data_quality,
)
from intelligence.src.utils.dates import parse_date


def analyze_transactions(
    transactions: List[Union[dict, TransactionRecord]],
    start_date: Optional[Union[str, date]] = None,
    end_date: Optional[Union[str, date]] = None,
) -> FinancialAnalyticsResult:
    """
    Main deterministic entrypoint for financial analysis.
    Processes transaction data into a typed FinancialAnalyticsResult object.
    Does NOT depend on FastAPI or LLMs.
    """
    # 1. Evaluate overall Data Quality before date window filtering
    dq_result = compute_data_quality(transactions)

    # 2. Normalize transaction objects
    normalized = normalize_transactions(transactions)

    # 3. Deduplicate
    dup_info = remove_duplicate_transactions(normalized)
    cleaned = dup_info["cleaned_records"]

    # 4. Optional Date Range Filtering
    p_start = parse_date(start_date) if start_date else None
    p_end = parse_date(end_date) if end_date else None

    filtered_records = []
    for rec in cleaned:
        d = rec.transaction_date
        if d:
            if p_start and d < p_start:
                continue
            if p_end and d > p_end:
                continue
        filtered_records.append(rec)

    if not filtered_records:
        return FinancialAnalyticsResult(data_quality=dq_result)

    # 5. Separate Income (CREDIT + GIG_INCOME) and Expenses (DEBIT)
    gig_income_recs = get_gig_income_transactions(filtered_records)
    expense_recs = [r for r in filtered_records if str(r.transaction_type).upper() == TransactionType.DEBIT.value]

    # 6. Monthly Aggregations
    monthly_data = {}

    for rec in filtered_records:
        if not rec.transaction_date:
            continue
        m_str = rec.transaction_date.strftime("%Y-%m")
        if m_str not in monthly_data:
            monthly_data[m_str] = {"income": 0.0, "expenses": 0.0, "tx_count": 0}

        monthly_data[m_str]["tx_count"] += 1
        if str(rec.transaction_type).upper() == TransactionType.CREDIT.value and str(rec.category).upper() == "GIG_INCOME":
            monthly_data[m_str]["income"] += rec.amount
        elif str(rec.transaction_type).upper() == TransactionType.DEBIT.value:
            monthly_data[m_str]["expenses"] += rec.amount

    monthly_analysis_list = []
    sorted_months = sorted(monthly_data.keys())

    for m_str in sorted_months:
        inc = round(monthly_data[m_str]["income"], 2)
        exp = round(monthly_data[m_str]["expenses"], 2)
        net = round(inc - exp, 2)
        cnt = monthly_data[m_str]["tx_count"]

        monthly_analysis_list.append(
            MonthlyAnalysis(
                month=m_str,
                income=inc,
                expenses=exp,
                net_income=net,
                transaction_count=cnt,
            )
        )

    # 7. Income Analysis
    total_inc = sum(r.amount for r in gig_income_recs)
    monthly_incomes = [m.income for m in monthly_analysis_list if m.income > 0]
    all_monthly_incomes = [m.income for m in monthly_analysis_list]

    if monthly_incomes:
        avg_inc = float(np.mean(monthly_incomes))
        med_inc = float(np.median(monthly_incomes))
        min_inc = float(min(monthly_incomes))
        max_inc = float(max(monthly_incomes))
    else:
        avg_inc = med_inc = min_inc = max_inc = 0.0

    active_sources = sorted(list({r.source for r in gig_income_recs if r.source}))

    income_analysis = IncomeAnalysis(
        total_income=round(total_inc, 2),
        average_monthly_income=round(avg_inc, 2),
        median_monthly_income=round(med_inc, 2),
        minimum_monthly_income=round(min_inc, 2),
        maximum_monthly_income=round(max_inc, 2),
        income_months=len(monthly_incomes),
        active_income_sources=len(active_sources),
    )

    # 8. Expense Analysis
    total_exp = sum(r.amount for r in expense_recs)
    monthly_expenses = [m.expenses for m in monthly_analysis_list if m.expenses > 0]

    if monthly_expenses:
        avg_exp = float(np.mean(monthly_expenses))
        med_exp = float(np.median(monthly_expenses))
        min_exp = float(min(monthly_expenses))
        max_exp = float(max(monthly_expenses))
    else:
        avg_exp = med_exp = min_exp = max_exp = 0.0

    expense_analysis = ExpenseAnalysis(
        total_expenses=round(total_exp, 2),
        average_monthly_expenses=round(avg_exp, 2),
        median_monthly_expenses=round(med_exp, 2),
        minimum_monthly_expenses=round(min_exp, 2),
        maximum_monthly_expenses=round(max_exp, 2),
    )

    # 9. Source Analysis
    source_map = {}
    for r in gig_income_recs:
        src = r.source or "OTHER"
        if src not in source_map:
            source_map[src] = {"income": 0.0, "count": 0}
        source_map[src]["income"] += r.amount
        source_map[src]["count"] += 1

    source_analysis_list = []
    for src in sorted(source_map.keys()):
        s_inc = source_map[src]["income"]
        s_cnt = source_map[src]["count"]
        pct = (s_inc / total_inc * 100.0) if total_inc > 0 else 0.0

        source_analysis_list.append(
            SourceAnalysis(
                source=src,
                total_income=round(s_inc, 2),
                percentage_of_income=round(pct, 1),
                transaction_count=s_cnt,
            )
        )

    # 10. Volatility Analysis
    if len(all_monthly_incomes) >= 2 and avg_inc > 0:
        std_dev = float(np.std(all_monthly_incomes, ddof=1))
        cv = std_dev / avg_inc
        vol_pct = cv * 100.0

        if vol_pct < VOLATILITY_LOW_THRESHOLD:
            vol_class = VolatilityClassification.LOW
        elif vol_pct <= VOLATILITY_MODERATE_THRESHOLD:
            vol_class = VolatilityClassification.MODERATE
        else:
            vol_class = VolatilityClassification.HIGH

        volatility = VolatilityAnalysis(
            coefficient_of_variation=round(cv, 4),
            volatility_percentage=round(vol_pct, 2),
            classification=vol_class,
        )
    else:
        volatility = VolatilityAnalysis(
            coefficient_of_variation=None,
            volatility_percentage=None,
            classification=VolatilityClassification.INSUFFICIENT_DATA,
        )

    # 11. Trend Analysis
    n_months = len(all_monthly_incomes)
    if n_months >= 2 and avg_inc > 0:
        x = np.arange(n_months)
        slope, _ = np.polyfit(x, all_monthly_incomes, 1)

        first_inc = all_monthly_incomes[0]
        last_inc = all_monthly_incomes[-1]
        pct_change = ((last_inc - first_inc) / first_inc * 100.0) if first_inc > 0 else 0.0

        rel_slope_pct = (slope / avg_inc) * 100.0

        if rel_slope_pct > TREND_CHANGE_THRESHOLD:
            direction = TrendDirection.INCREASING
        elif rel_slope_pct < -TREND_CHANGE_THRESHOLD:
            direction = TrendDirection.DECREASING
        else:
            direction = TrendDirection.STABLE

        confidence = min(1.0, round(0.5 + (n_months * 0.1), 2))

        trend = TrendAnalysis(
            direction=direction,
            percentage_change=round(pct_change, 2),
            confidence=confidence,
        )
    else:
        trend = TrendAnalysis(
            direction=TrendDirection.INSUFFICIENT_DATA,
            percentage_change=None,
            confidence=0.0,
        )

    return FinancialAnalyticsResult(
        income=income_analysis,
        expenses=expense_analysis,
        monthly_analysis=monthly_analysis_list,
        source_analysis=source_analysis_list,
        volatility=volatility,
        trend=trend,
        data_quality=dq_result,
    )
