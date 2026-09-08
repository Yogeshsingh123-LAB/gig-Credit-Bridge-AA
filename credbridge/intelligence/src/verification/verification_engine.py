from dataclasses import dataclass, field
from typing import List, Dict, Any, Optional
from intelligence.src.models.analytics_result import FinancialAnalyticsResult

@dataclass
class IncomeVerificationResult:
    declared_monthly_income: float
    observed_average_monthly_income: float
    verified_monthly_income: float
    total_income_observed: float
    months_analyzed: int
    income_sources_count: int
    income_coverage_percentage: float
    volatility_percentage: float
    confidence_score: float
    verification_status: str # VERIFIED, PARTIALLY_VERIFIED, INSUFFICIENT_DATA, REVIEW_REQUIRED
    verification_summary: str
    calculation_version: str = "v1.0"
    risk_flags: List[str] = field(default_factory=list)

def verify_income(
    analytics_result: FinancialAnalyticsResult,
    declared_monthly_income: float = 0.0
) -> IncomeVerificationResult:
    """
    Deterministic Income Verification Engine.
    Analyzes observed income, coverage, stability, and data quality to produce a verified income figure and status.
    """
    observed_avg = analytics_result.avg_monthly_income
    months_analyzed = analytics_result.income_months_count
    sources_count = len(analytics_result.source_breakdown)
    volatility = analytics_result.income_volatility_pct
    data_quality_score = analytics_result.data_quality.quality_score
    total_income = analytics_result.total_income

    risk_flags = []
    
    # Coverage calculation (percentage of expected active months with income)
    expected_months = max(months_analyzed, 1)
    # Coverage is active months with income vs total duration, clamped 0-100%
    coverage_pct = min(100.0, (months_analyzed / max(expected_months, 3)) * 100.0) if months_analyzed > 0 else 0.0

    # Confidence score calculation (0-100)
    # Factors: history length (40%), data quality (30%), volatility (20%), source diversity (10%)
    history_factor = min(1.0, months_analyzed / 6.0) * 40.0
    quality_factor = (data_quality_score / 100.0) * 30.0
    
    # Volatility score: lower volatility = higher score
    if volatility <= 15.0:
        vol_factor = 20.0
    elif volatility <= 30.0:
        vol_factor = 12.0
    else:
        vol_factor = 5.0
        risk_flags.append("High income volatility observed across months.")

    diversity_factor = min(1.0, sources_count / 3.0) * 10.0

    confidence_score = round(min(100.0, max(0.0, history_factor + quality_factor + vol_factor + diversity_factor)), 1)

    # Discrepancy check if declared monthly income is provided
    discrepancy_flag = False
    if declared_monthly_income > 0:
        diff_pct = abs(declared_monthly_income - observed_avg) / declared_monthly_income * 100.0
        if diff_pct > 50.0:
            discrepancy_flag = True
            risk_flags.append(f"Significant discrepancy ({diff_pct:.1f}%) between declared (₹{declared_monthly_income:,.2f}) and observed (₹{observed_avg:,.2f}) income.")

    # Status Determination Rules
    if data_quality_score < 50.0 or discrepancy_flag:
        verification_status = "REVIEW_REQUIRED"
        verified_income = round(min(observed_avg, declared_monthly_income) if declared_monthly_income > 0 else observed_avg, 2)
        summary = "Income verification requires manual review due to data quality or declared income discrepancy."
    elif months_analyzed >= 3 and coverage_pct >= 70.0 and confidence_score >= 70.0:
        verification_status = "VERIFIED"
        verified_income = round(observed_avg, 2)
        summary = f"Income verified across {months_analyzed} months with high confidence ({confidence_score}%)."
    elif months_analyzed >= 1 and total_income > 0:
        verification_status = "PARTIALLY_VERIFIED"
        verified_income = round(observed_avg * 0.85, 2) # Conservative discount for partial history
        summary = f"Income partially verified across {months_analyzed} month(s). Longer transaction history recommended for full verification."
    else:
        verification_status = "INSUFFICIENT_DATA"
        verified_income = 0.0
        summary = "Insufficient transaction history to perform income verification."

    return IncomeVerificationResult(
        declared_monthly_income=declared_monthly_income,
        observed_average_monthly_income=round(observed_avg, 2),
        verified_monthly_income=verified_income,
        total_income_observed=round(total_income, 2),
        months_analyzed=months_analyzed,
        income_sources_count=sources_count,
        income_coverage_percentage=round(coverage_pct, 1),
        volatility_percentage=round(volatility, 1),
        confidence_score=confidence_score,
        verification_status=verification_status,
        verification_summary=summary,
        calculation_version="v1.0",
        risk_flags=risk_flags
    )
