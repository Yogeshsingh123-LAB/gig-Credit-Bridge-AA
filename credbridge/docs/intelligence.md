# CredBridge Intelligence Engine

The CredBridge Intelligence Engine computes deterministic analytics, income verification audits, Financial Readiness Scores, AI natural-language explanations, and What-If simulations.

## Key Principles

1. **100% Deterministic Financial Numbers**: All numeric calculations (income averages, expenses, volatility coefficient of variation, trends, readiness scores, and simulations) are calculated using Python/Pandas/NumPy.
2. **AI Role Limited to Summarization**: LLM API is used ONLY for text summaries and natural language insights. AI NEVER calculates numbers or makes lending decisions.
3. **Graceful Fallback**: If an LLM API key is missing or unavailable, the system seamlessly uses deterministic template explanations.
4. **No Protected Class Discrimination**: Scores are strictly calculated based on financial cashflow variables (consistency, stability, coverage, quality, diversification, sustainability). Demographics such as gender, race, caste, religion, or political affiliation are NEVER used.

## Financial Readiness Score Weights (0–100)

- **Income Consistency**: 25% (active income months vs gap months)
- **Income Stability**: 20% (monthly income volatility index)
- **Income Coverage**: 20% (verification history length & coverage %)
- **Data Quality**: 15% (data quality & metadata score 0-100)
- **Income Diversification**: 10% (earnings spread across multiple gig platforms)
- **Financial Sustainability**: 10% (net income / expense margin)

Score Bands:
- `EXCELLENT`: 80 – 100
- `GOOD`: 65 – 79
- `FAIR`: 50 – 64
- `POOR`: 0 – 49
