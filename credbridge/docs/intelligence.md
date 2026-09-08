# CredBridge Intelligence & Analytics Service Documentation (Phase 2)

> **Financial analytics are informational and do not constitute a lending decision, credit score, or official bank guarantee.**

---

## 1. Overview
The **CredBridge Intelligence Service** processes authenticated transaction data for gig economy workers (delivery partners, rideshare drivers, home service providers, freelancers) to produce standardized, deterministic, and explainable financial insights.

---

## 2. Core Architectural Guarantees

1. **Strict Determinism**: 100% of income, expense, volatility, trend, and data-quality metrics are computed via deterministic Python, Pandas, and NumPy logic.
2. **AI Decoupling**: AI and LLMs are NOT used for numeric calculations or credit score decisioning.
3. **Data Isolation**: All analytics operations require an authenticated `worker_id` context and filter records strictly belonging to that worker.

---

## 3. Data Ingestion Contract (`TransactionRecord`)

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `str` | Unique transaction ID |
| `worker_id` | `str` | Gig worker identifier |
| `transaction_date` | `date` | Date of transaction |
| `transaction_type` | `str` | `CREDIT` or `DEBIT` |
| `amount` | `float` | Monetary value |
| `category` | `str` | `GIG_INCOME`, `FUEL`, `FOOD`, `MAINTENANCE`, `TRANSFER`, `OTHER` |
| `source` | `str` | Platform / Institution (Swiggy, Uber, Zomato, etc.) |
| `description` | `Optional[str]` | Transaction note |
| `reference_id` | `Optional[str]` | Gateway or bank reference ID |

---

## 4. Key Financial Metrics & Formulas

### A. Income Definition
Only transactions matching:
```text
transaction_type == CREDIT AND category == GIG_INCOME
```
are counted toward gig income. Personal transfers, debits, refunds, and unclassified credits are strictly excluded.

### B. Expense Definition
Transactions matching:
```text
transaction_type == DEBIT
```
are aggregated into expenses.

### C. Monthly Net Income
$$\text{Net Income}_{\text{month}} = \text{Gig Income}_{\text{month}} - \text{Expenses}_{\text{month}}$$

### D. Income Volatility (Coefficient of Variation)
$$\text{CV} = \frac{\sigma}{\mu}, \quad \text{Volatility \%} = \text{CV} \times 100$$
- `LOW`: $\text{CV \%} < 15.0\%$
- `MODERATE`: $15.0\% \le \text{CV \%} \le 30.0\%$
- `HIGH`: $\text{CV \%} > 30.0\%$
- `INSUFFICIENT_DATA`: $<2$ months of income history or mean $\le 0$.

### E. Trend Analysis
Normalized relative linear slope per month:
- `INCREASING`: Normalized relative slope $> +3.0\%$ / month.
- `DECREASING`: Normalized relative slope $< -3.0\%$ / month.
- `STABLE`: Slope within $[-3.0\%, +3.0\%]$.
- `INSUFFICIENT_DATA`: $<2$ months of observations.

### F. Data Quality Score (0–100)
Transparency score representing dataset completeness:
- Deducts penalties for missing dates (-10), non-positive amounts (-10), duplicate records (-5), unrecognized categories (-5), and short history $<3$ months (-15).

---

## 5. Security & Safety Principles
- CredBridge is an **analytics provider**, NOT a lender.
- Metric outputs must avoid lending decision terminology (*Loan Approved*, *Credit Score*). Use analytical terms (*Observed Income*, *Income Volatility*, *Income Consistency*, *Data Quality Score*).
