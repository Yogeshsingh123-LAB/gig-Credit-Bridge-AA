# CredBridge Financial Analytics API Contract

## Endpoint

```text
GET /api/v1/analytics/financial-summary
```

### Description
Returns a comprehensive, deterministic financial analysis breakdown for the currently authenticated gig worker.

---

## Headers

| Header | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `Authorization` | `string` | Yes | Bearer JWT token |
| `X-Worker-ID` | `string` | Optional | Context worker ID header (defaults to authenticated worker context) |

---

## Query Parameters

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `start_date` | `string` | No | Start date filter in `YYYY-MM-DD` format |
| `end_date` | `string` | No | End date filter in `YYYY-MM-DD` format |

---

## Security & Data Isolation
The endpoint extracts worker identity from the authenticated JWT / request context. Clients **cannot** query another worker's financial data by passing a custom `worker_id` parameter.

---

## Sample Response

```json
{
  "income": {
    "total_income": 97100.0,
    "average_monthly_income": 16183.33,
    "median_monthly_income": 15500.0,
    "minimum_monthly_income": 9300.0,
    "maximum_monthly_income": 24800.0,
    "income_months": 6,
    "active_income_sources": 4
  },
  "expenses": {
    "total_expenses": 3700.0,
    "average_monthly_expenses": 1850.0,
    "median_monthly_expenses": 1850.0,
    "minimum_monthly_expenses": 1200.0,
    "maximum_monthly_expenses": 2500.0
  },
  "monthly_analysis": [
    {
      "month": "2026-03",
      "income": 9300.0,
      "expenses": 1200.0,
      "net_income": 8100.0,
      "transaction_count": 3
    },
    {
      "month": "2026-04",
      "income": 13500.0,
      "expenses": 2500.0,
      "net_income": 11000.0,
      "transaction_count": 3
    }
  ],
  "source_analysis": [
    {
      "source": "Swiggy",
      "total_income": 44700.0,
      "percentage_of_income": 46.0,
      "transaction_count": 4
    },
    {
      "source": "Uber",
      "total_income": 36300.0,
      "percentage_of_income": 37.4,
      "transaction_count": 4
    }
  ],
  "volatility": {
    "coefficient_of_variation": 0.3125,
    "volatility_percentage": 31.25,
    "classification": "HIGH"
  },
  "trend": {
    "direction": "INCREASING",
    "percentage_change": 166.67,
    "confidence": 1.0
  },
  "data_quality": {
    "total_transactions": 18,
    "valid_transactions": 15,
    "invalid_transactions": 2,
    "duplicate_transactions": 1,
    "missing_values": 2,
    "quality_score": 75,
    "warnings": [
      "Found 1 records with missing or invalid transaction dates.",
      "Found 1 records with non-positive, null, or invalid amounts.",
      "Detected 1 duplicate transaction records."
    ]
  }
}
```
