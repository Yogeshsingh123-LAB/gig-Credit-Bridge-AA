# Backend Intelligence & Analytics Integration Guide

This directory documents how Member 2's FastAPI backend service layer integrates with Member 3's core `intelligence/` engine.

## Architecture Flow

```text
FastAPI API Endpoints (/api/v1/analytics)
            ↓
Backend Analytics Services (app/services/analytics/)
            ↓
Core Intelligence Engine (intelligence/src/analytics/)
```

## Available Services

1. **`clean_and_validate_transactions(records)`**
   - Validates dates, amounts, transaction types, categories, and reference IDs.
   - Detects duplicate records without silent deletion.
   - Returns dataset health summary (`DataQualityResult`).

2. **`compute_monthly_aggregates(records)`**
   - Aggregates income and expenses per month (YYYY-MM).
   - Generates platform source distributions (Swiggy, Uber, Zomato, etc.).

3. **`analyze_financial_performance(records)`**
   - Computes statistical metrics: mean, median, min, max, volatility (CV %), trend trajectory, and consistency percentage.
   - Returns a structured `FinancialAnalyticsResult` model.

## Design Guarantees

- **100% Deterministic**: No LLM, AI model, or random calculations.
- **Financial Safety**: No credit scoring, automatic approval, or loan decisions.
- **Isolated Engine**: Python logic resides inside `intelligence/src/` for clean testability and reusability.
