from dataclasses import dataclass, field
from typing import Dict, Any, List, Optional
from intelligence.src.models.analytics_result import FinancialAnalyticsResult
from intelligence.src.verification.verification_engine import verify_income, IncomeVerificationResult
from intelligence.src.scoring.readiness_score_engine import calculate_financial_readiness_score, FinancialScoreResult

@dataclass
class WhatIfSimulationRequest:
    income_change_pct: float = 0.0 # e.g. +20.0 for 20% increase, -10.0 for 10% decrease
    expense_change_pct: float = 0.0 # e.g. +10.0 for 10% expense increase
    additional_monthly_income: float = 0.0 # flat amount e.g. +₹5000/mo
    additional_income_source: Optional[str] = None # e.g. "Zepto"
    improved_consistency_months: int = 0 # add simulated consistent active months

@dataclass
class WhatIfSimulationResult:
    scenario: Dict[str, Any]
    original_monthly_income: float
    simulated_monthly_income: float
    income_delta: float
    original_monthly_expenses: float
    simulated_monthly_expenses: float
    expense_delta: float
    simulated_net_monthly_income: float
    original_readiness_score: float
    simulated_readiness_score: float
    score_delta: float
    simulated_score_band: str
    simulated_verification_status: str
    disclaimer: str = "Simulation for analytical modeling only. Not a prediction of future earnings or a lending decision."

def run_whatif_simulation(
    analytics: FinancialAnalyticsResult,
    verification: IncomeVerificationResult,
    score: FinancialScoreResult,
    request: WhatIfSimulationRequest
) -> WhatIfSimulationResult:
    """
    Calculates deterministic hypothetical financial scenarios without altering underlying database data.
    """
    orig_inc = analytics.avg_monthly_income
    orig_exp = analytics.avg_monthly_expenses

    # 1. Income adjustment
    inc_mult = 1.0 + (request.income_change_pct / 100.0)
    sim_inc = (orig_inc * inc_mult) + request.additional_monthly_income
    sim_inc = max(0.0, sim_inc)

    # 2. Expense adjustment
    exp_mult = 1.0 + (request.expense_change_pct / 100.0)
    sim_exp = max(0.0, orig_exp * exp_mult)

    sim_net = sim_inc - sim_exp

    # 3. Simulate hypothetical sub-scores for Financial Readiness Score
    sim_consistency = min(100.0, score.component_scores.get("consistency", 50.0) + (request.improved_consistency_months * 10.0))
    
    # Diversification bonus if new source added
    diversification_bonus = 25.0 if request.additional_income_source else 0.0
    sim_diversification = min(100.0, score.component_scores.get("diversification", 50.0) + diversification_bonus)

    # Sustainability score based on new net margin
    if sim_inc > 0:
        sim_margin = sim_net / sim_inc
        if sim_margin >= 0.30:
            sim_sustainability = 100.0
        elif sim_margin >= 0.10:
            sim_sustainability = 75.0
        elif sim_margin >= 0.0:
            sim_sustainability = 50.0
        else:
            sim_sustainability = 25.0
    else:
        sim_sustainability = 0.0

    # Re-calculate simulated weighted readiness score
    weights = {
        "consistency": 0.25,
        "stability": 0.20,
        "coverage": 0.20,
        "quality": 0.15,
        "diversification": 0.10,
        "sustainability": 0.10
    }
    
    sim_score_val = (
        sim_consistency * weights["consistency"] +
        score.component_scores.get("stability", 50.0) * weights["stability"] +
        score.component_scores.get("coverage", 50.0) * weights["coverage"] +
        score.component_scores.get("quality", 50.0) * weights["quality"] +
        sim_diversification * weights["diversification"] +
        sim_sustainability * weights["sustainability"]
    )
    sim_score_val = round(min(100.0, max(0.0, sim_score_val)), 1)

    if sim_score_val >= 80.0:
        sim_band = "EXCELLENT"
    elif sim_score_val >= 65.0:
        sim_band = "GOOD"
    elif sim_score_val >= 50.0:
        sim_band = "FAIR"
    else:
        sim_band = "POOR"

    # Simulated verification status
    if verification.verification_status == "VERIFIED":
        sim_status = "VERIFIED"
    elif request.improved_consistency_months >= 2:
        sim_status = "VERIFIED"
    else:
        sim_status = verification.verification_status

    return WhatIfSimulationResult(
        scenario={
            "income_change_pct": request.income_change_pct,
            "expense_change_pct": request.expense_change_pct,
            "additional_monthly_income": request.additional_monthly_income,
            "additional_income_source": request.additional_income_source,
            "improved_consistency_months": request.improved_consistency_months
        },
        original_monthly_income=round(orig_inc, 2),
        simulated_monthly_income=round(sim_inc, 2),
        income_delta=round(sim_inc - orig_inc, 2),
        original_monthly_expenses=round(orig_exp, 2),
        simulated_monthly_expenses=round(sim_exp, 2),
        expense_delta=round(sim_exp - orig_exp, 2),
        simulated_net_monthly_income=round(sim_net, 2),
        original_readiness_score=score.overall_score,
        simulated_readiness_score=sim_score_val,
        score_delta=round(sim_score_val - score.overall_score, 1),
        simulated_score_band=sim_band,
        simulated_verification_status=sim_status,
        disclaimer="Simulation for analytical modeling only. Not a prediction of future earnings or a lending decision."
    )
