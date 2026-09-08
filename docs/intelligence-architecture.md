# CredBridge Intelligence Architecture Specification

## 1. Purpose of the Intelligence Layer
The **CredBridge Intelligence Engine** processes fragmented financial streams (bank account aggregator statements, gig platform payouts, digital wallet logs) to construct a transparent, explainable financial profile for gig economy workers (rideshare drivers, delivery partners, freelancers, home service providers).

The core pipeline operates deterministically:

```text
Raw Transaction Data
       ↓
Data Cleaning & Quality Assessment
       ↓
Monthly & Categorical Aggregations
       ↓
Financial Statistics (Income, Volatility, Trend, Consistency)
       ↓
[Phase 2] Income Verification Engine
       ↓
[Phase 2] Financial Readiness Score
       ↓
[Phase 2] Credit Passport Credentials
       ↓
[Phase 3] AI Explanation Layer
       ↓
[Phase 3] What-If Simulator
```

---

## 2. Transaction Data Contract
Ingestion uses a standardized `TransactionRecord` Pydantic model:

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `str` | Unique transaction ID |
| `worker_id` | `str` | Gig worker identifier |
| `transaction_date` | `date` | Transaction date |
| `transaction_type` | `str` | `CREDIT` or `DEBIT` |
| `amount` | `float` | Monetary value |
| `category` | `str` | `GIG_INCOME`, `FUEL`, `FOOD`, `MAINTENANCE`, `TRANSFER`, `OTHER` |
| `source` | `str` | Platform / Institution (e.g. Swiggy, Uber, Zomato) |
| `description` | `Optional[str]` | Transaction note / narrative |
| `reference_id` | `Optional[str]` | Gateway or bank reference ID |

---

## 3. Data Cleaning Pipeline
The cleaning engine enforces financial integrity without silent deletion:

1. **Date Validation**: Identifies missing, invalid, or future dates.
2. **Amount Validation**: Detects null, negative, zero, or non-numeric values.
3. **Duplicate Detection**: Identifies duplicate `reference_id` or composite `(date, amount, source, description)` matches.
4. **Income Filtering**:
   ```python
   transaction_type == "CREDIT" AND category == "GIG_INCOME"
   ```
   *Note: Personal transfers, debit transactions, and unclassified categories are strictly excluded from income totals.*

---

## 4. Monthly Aggregations
Transactions are grouped by calendar month (`YYYY-MM`):
- `month`: Calendar month string.
- `income`: Sum of gig income transactions credited.
- `transaction_count`: Number of valid gig income credits.
- `sources`: List of distinct platforms contributing to income.

---

## 5. Financial Statistics & Deterministic Math
All calculations are 100% deterministic using Python, Pandas, and NumPy.

### A. Average & Median Monthly Income
$$\text{Average Income} = \frac{1}{N} \sum_{i=1}^{N} \text{Income}_i$$
$$\text{Median Income} = \text{median}(\{\text{Income}_1, \dots, \text{Income}_N\})$$

### B. Income Volatility (Coefficient of Variation)
$$\text{CV} = \left( \frac{\sigma}{\mu} \right) \times 100$$
- Returns `VolatilityResult(value=None, status="INSUFFICIENT_DATA")` when $N < 2$, $\mu \le 0$, or on missing observations.
- Never returns `NaN` or `Infinity`.

### C. Income Trend Classification
Evaluates historical trajectory without making predictive claims:
- `INCREASING`: Normalized relative linear slope $> +3.0\%$ per month.
- `DECREASING`: Normalized relative linear slope $< -3.0\%$ per month.
- `STABLE`: Slope within $[-3.0\%, +3.0\%]$.
- `INSUFFICIENT_DATA`: Less than 2 months of observations.

### D. Income Consistency
$$\text{Consistency \%} = \left( \frac{\text{Months with Income}}{\text{Total Months Analyzed}} \right) \times 100$$

---

## 6. Data Quality Result (`DataQualityResult`)
Generates structural integrity metrics:
- `quality_status`: `GOOD`, `WARNING`, `POOR`, or `INSUFFICIENT_DATA`.
- Tracks `missing_dates`, `invalid_amounts`, `duplicate_transactions`, `invalid_categories`, and `invalid_transaction_types`.

---

## 7–10. Future Modules (Phases 2 & 3)
- **Income Verification (`intelligence/verification/`)**: Account aggregator consent matching.
- **Financial Readiness Score (`intelligence/scoring/`)**: Multi-factor non-bureau readiness score.
- **Credit Passport (`intelligence/passport/`)**: Cryptographic credential generator.
- **AI Explanation Layer (`intelligence/explanation/`)**: Generates human language summaries of deterministic results.
- **What-If Simulator (`intelligence/simulator/`)**: Scenario planning tool for workers.

---

## 11. Explainability & Financial Safety Rules
1. **Separation of Concerns**: Math and LLMs are decoupled. LLMs explain results; they never compute metrics.
2. **Traceability**: Every output metric links directly to source transaction IDs and date ranges.
3. **Financial Terminology Safety**: CredBridge is an analytics provider, NOT a lender or credit bureau.
   - ❌ Forbidden terms: *Loan Approved*, *Loan Rejected*, *Guaranteed Credit*, *Credit Bureau Score*.
   - ✅ Approved terms: *Observed Income*, *Income Volatility*, *Income Consistency*, *Financial Evidence*, *Financial Readiness*.
