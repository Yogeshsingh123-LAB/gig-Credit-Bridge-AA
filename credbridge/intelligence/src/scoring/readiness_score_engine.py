from dataclasses import dataclass, field
from typing import List, Dict, Any
from intelligence.src.models.analytics_result import FinancialAnalyticsResult
from intelligence.src.verification.verification_engine import IncomeVerificationResult

@dataclass
class FinancialScoreResult:
    overall_score: float # 0 to 100
    score_band: str # EXCELLENT, GOOD, FAIR, POOR
    positive_factors: List[str] = field(default_factory=list)
    attention_areas: List[str] = field(default_factory=list)
    component_scores: Dict[str, float] = field(default_factory=dict)
    calculation_summary: str = ""
    calculation_version: str = "v1.0"

def calculate_financial_readiness_score(
    analytics: FinancialAnalyticsResult,
    verification: IncomeVerificationResult,
    weights: Dict[str, float] = None
) -> FinancialScoreResult:
    """
    Deterministic Financial Readiness Score Engine (0-100).
    Calculates weighted sub-scores without using any protected demographics or LLM APIs.
    """
    if weights is None:
        weights = {
            "consistency": 0.25,
            "stability": 0.20,
            "coverage": 0.20,
            "quality": 0.15,
            "diversification": 0.10,
            "sustainability": 0.10
        }

    positive_factors = []
    attention_areas = []

    # 1. Income Consistency (25%)
    # Based on number of months with active income and trend stability
    months = analytics.income_months_count
    if months >= 6:
        consistency_score = 100.0
        positive_factors.append("Strong income consistency over 6+ months of transaction history.")
    elif months >= 3:
        consistency_score = 75.0
        positive_factors.append("Consistent monthly income present over 3-5 months.")
    elif months >= 1:
        consistency_score = 45.0
        attention_areas.append("Short transaction history (less than 3 active income months).")
    else:
        consistency_score = 0.0
        attention_areas.append("No active income months detected.")

    # 2. Income Stability (20%)
    # Inverse of volatility
    vol = analytics.income_volatility_pct
    if vol <= 15.0:
        stability_score = 100.0
        positive_factors.append("Low monthly income volatility demonstrates high income stability.")
    elif vol <= 30.0:
        stability_score = 75.0
        positive_factors.append("Moderate monthly income volatility observed across platforms.")
    elif vol <= 50.0:
        stability_score = 50.0
        attention_areas.append("Moderate to high income volatility observed across recent months.")
    else:
        stability_score = 25.0
        attention_areas.append("High monthly income volatility may affect earnings predictability.")

    # 3. Income Coverage & Verification (20%)
    coverage_score = min(100.0, verification.confidence_score)
    if verification.verification_status == "VERIFIED":
        positive_factors.append("Income fully verified with high confidence score.")
    elif verification.verification_status == "PARTIALLY_VERIFIED":
        attention_areas.append("Income partially verified; additional history will improve confidence.")
    elif verification.verification_status == "REVIEW_REQUIRED":
        attention_areas.append("Income verification requires manual review due to data quality flags.")

    # 4. Data Quality (15%)
    quality_score = analytics.data_quality.quality_score
    if quality_score >= 85.0:
        positive_factors.append("High data quality score with complete transaction metadata.")
    elif quality_score < 60.0:
        attention_areas.append("Lower data quality score due to missing fields or duplicate entries.")

    # 5. Income Diversification (10%)
    sources = len(analytics.source_breakdown)
    if sources >= 3:
        diversification_score = 100.0
        positive_factors.append(f"Diversified earnings stream across {sources} gig platforms.")
    elif sources == 2:
        diversification_score = 75.0
        positive_factors.append("Income sourced from 2 gig platforms.")
    elif sources == 1:
        diversification_score = 50.0
        attention_areas.append("Income concentrated in a single primary gig platform.")
    else:
        diversification_score = 0.0

    # 6. Financial Sustainability (10%)
    # Net income ratio: (total income - total expenses) / total income
    if analytics.total_income > 0:
        net_margin = (analytics.total_income - analytics.total_expenses) / analytics.total_income
        if net_margin >= 0.30:
            sustainability_score = 100.0
            positive_factors.append("Strong monthly net margin (>30% earnings retained after expenses).")
        elif net_margin >= 0.10:
            sustainability_score = 75.0
            positive_factors.append("Positive net monthly savings buffer.")
        elif net_margin >= 0.0:
            sustainability_score = 50.0
            attention_areas.append("Tight monthly net margin (expenses match earnings closely).")
        else:
            sustainability_score = 25.0
            attention_areas.append("Negative monthly net margin (expenses exceed observed income).")
    else:
        sustainability_score = 0.0

    component_scores = {
        "consistency": round(consistency_score, 1),
        "stability": round(stability_score, 1),
        "coverage": round(coverage_score, 1),
        "quality": round(quality_score, 1),
        "diversification": round(diversification_score, 1),
        "sustainability": round(sustainability_score, 1)
    }

    # Weighted calculation
    overall_score = (
        consistency_score * weights["consistency"] +
        stability_score * weights["stability"] +
        coverage_score * weights["coverage"] +
        quality_score * weights["quality"] +
        diversification_score * weights["diversification"] +
        sustainability_score * weights["sustainability"]
    )
    overall_score = round(min(100.0, max(0.0, overall_score)), 1)

    # Score Band
    if overall_score >= 80.0:
        band = "EXCELLENT"
    elif overall_score >= 65.0:
        band = "GOOD"
    elif overall_score >= 50.0:
        band = "FAIR"
    else:
        band = "POOR"

    summary = f"CredBridge Financial Readiness Score of {overall_score}/100 ({band} band) calculated deterministically based on income stability, coverage, data quality, and financial sustainability."

    return FinancialScoreResult(
        overall_score=overall_score,
        score_band=band,
        positive_factors=positive_factors,
        attention_areas=attention_areas,
        component_scores=component_scores,
        calculation_summary=summary,
        calculation_version="v1.0"
    )
