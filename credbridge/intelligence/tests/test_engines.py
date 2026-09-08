import pytest
from datetime import date
from intelligence.src.models.transaction import TransactionRecord, TransactionType, TransactionCategory
from intelligence.src.analytics.financial_analytics import analyze_transactions
from intelligence.src.verification.verification_engine import verify_income
from intelligence.src.scoring.readiness_score_engine import calculate_financial_readiness_score
from intelligence.src.explanations.ai_explanation_engine import generate_ai_explanation
from intelligence.src.analytics.whatif_simulator import run_whatif_simulation, WhatIfSimulationRequest

@pytest.fixture
def sample_analytics():
    txs = []
    # Create 4 months of transactions across Uber and Zomato
    dates = [
        date(2025, 1, 10), date(2025, 1, 20),
        date(2025, 2, 10), date(2025, 2, 20),
        date(2025, 3, 10), date(2025, 3, 20),
        date(2025, 4, 10), date(2025, 4, 20),
    ]
    for i, dt in enumerate(dates):
        txs.append(TransactionRecord(
            id=f"tx_{i}",
            worker_id="w_123",
            platform_id="p_1" if i % 2 == 0 else "p_2",
            transaction_date=dt,
            transaction_type=TransactionType.CREDIT,
            amount=15000.0,
            category=TransactionCategory.GIG_INCOME,
            source="Uber" if i % 2 == 0 else "Zomato",
            reference_id=f"ref_{i}"
        ))
        # Add monthly expenses
        txs.append(TransactionRecord(
            id=f"exp_{i}",
            worker_id="w_123",
            platform_id="p_1",
            transaction_date=dt,
            transaction_type=TransactionType.DEBIT,
            amount=4000.0,
            category=TransactionCategory.FUEL,
            source="Fuel Station",
            reference_id=f"exp_ref_{i}"
        ))
    return analyze_transactions(txs)

def test_income_verification_engine(sample_analytics):
    verification = verify_income(sample_analytics, declared_monthly_income=30000.0)
    assert verification.verification_status == "VERIFIED"
    assert verification.verified_monthly_income == 30000.0
    assert verification.confidence_score >= 70.0
    assert verification.months_analyzed == 4

def test_financial_readiness_score_engine(sample_analytics):
    verification = verify_income(sample_analytics, declared_monthly_income=30000.0)
    score_result = calculate_financial_readiness_score(sample_analytics, verification)
    
    assert 0.0 <= score_result.overall_score <= 100.0
    assert score_result.score_band in ["EXCELLENT", "GOOD", "FAIR", "POOR"]
    assert len(score_result.positive_factors) > 0
    assert "consistency" in score_result.component_scores

def test_ai_explanation_engine_fallback(sample_analytics):
    verification = verify_income(sample_analytics, declared_monthly_income=30000.0)
    score_result = calculate_financial_readiness_score(sample_analytics, verification)
    
    explanation = generate_ai_explanation(sample_analytics, verification, score_result)
    assert "Observed monthly gig earnings average" in explanation
    assert "Financial Readiness Score" in explanation
    assert "30,000.00" in explanation

def test_whatif_simulator_engine(sample_analytics):
    verification = verify_income(sample_analytics, declared_monthly_income=30000.0)
    score_result = calculate_financial_readiness_score(sample_analytics, verification)
    
    req = WhatIfSimulationRequest(
        income_change_pct=20.0,
        expense_change_pct=-10.0,
        additional_income_source="Zepto"
    )
    sim = run_whatif_simulation(sample_analytics, verification, score_result, req)
    
    assert sim.simulated_monthly_income > sim.original_monthly_income
    assert sim.simulated_monthly_expenses < sim.original_monthly_expenses
    assert sim.simulated_net_monthly_income > (sim.original_monthly_income - sim.original_monthly_expenses)
    assert "Simulation for analytical modeling only" in sim.disclaimer
