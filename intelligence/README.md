# CredBridge Intelligence Engine

> **Phase 1 — Foundation: Data Processing, Cleaning, Aggregations & Financial Analytics**

The `intelligence` module provides the core data processing, data quality validation, and deterministic financial statistics engine for CredBridge.

---

## 1. Purpose

Gig economy workers often lack traditional salary slips or standard credit bureau histories. The Intelligence Engine processes raw transaction streams (e.g. Swiggy, Uber, Zomato, Urban Company payouts and bank statements) to calculate:
- Standardized Data Quality Metrics
- Monthly Gig Income Aggregations & Expense Totals
- Source & Category Breakdowns
- Total, Average, Median, Min, and Max Monthly Income
- Income Volatility (Coefficient of Variation)
- Historical Trend Classification (Increasing, Stable, Decreasing)
- Income Generation Consistency

---

## 2. Dependency Strategy & Installation

Dependencies are isolated in `intelligence/requirements.txt`:

```bash
pip install -r intelligence/requirements.txt
```

Core dependencies:
- `pandas`: Data manipulation and groupings
- `numpy`: Vectorized financial statistics
- `pydantic`: Schema validation and data contracts
- `pytest`: Unit testing framework

---

## 3. Directory Structure

```text
intelligence/
├── README.md
├── requirements.txt
├── src/
│   ├── __init__.py
│   ├── models/
│   │   ├── transaction.py        # TransactionRecord contract
│   │   ├── data_quality.py       # DataQualityResult schema
│   │   └── analytics_result.py   # FinancialAnalyticsResult schema
│   ├── analytics/
│   │   ├── cleaning.py           # Normalization, validation, duplicate detection
│   │   ├── aggregation.py        # Monthly & categorical aggregations
│   │   └── statistics.py         # Mean, median, CV %, trend, consistency
│   └── utils/
│       └── dates.py              # Date parsing & YYYY-MM helpers
├── tests/
│   ├── fixtures/
│   │   └── synthetic_transactions.json
│   ├── test_data_cleaning.py
│   ├── test_aggregations.py
│   └── test_statistics.py
├── verification/                 # [FUTURE PHASE]
├── scoring/                      # [FUTURE PHASE]
├── passport/                     # [FUTURE PHASE]
├── explanation/                  # [FUTURE PHASE]
└── simulator/                    # [FUTURE PHASE]
```

---

## 4. Standard Transaction Data Contract

Input transaction records must conform to `TransactionRecord`:

```python
class TransactionRecord(BaseModel):
    id: str
    worker_id: str
    transaction_date: date
    transaction_type: str        # CREDIT or DEBIT
    amount: float
    category: str                # GIG_INCOME, FUEL, FOOD, MAINTENANCE, TRANSFER, OTHER
    source: str                  # Swiggy, Uber, Zomato, etc.
    description: Optional[str]
    reference_id: Optional[str]
```

---

## 5. Development Safety Rules

1. **Deterministic Calculations Only**: All financial metrics must be computed via Python/Pandas/NumPy. No LLM or AI scoring in calculation paths.
2. **Safe Volatility Handling**: Never return `NaN` or `Infinity`. Volatility calculations with $< 2$ months of data yield `{ "value": null, "status": "INSUFFICIENT_DATA" }`.
3. **Strict Gig Income Filter**: Only `CREDIT` + `GIG_INCOME` transactions are counted toward income. Transfers, debits, and unclassified categories are excluded.
4. **No Automated Loan Approvals**: Use analytical terms (*Financial Readiness*, *Observed Income*, *Consistency*), never loan decisioning terms.

---

## 6. Running Tests

Execute the Pytest suite from the repository root:

```bash
python -m pytest intelligence/tests
```
