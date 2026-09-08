# CredBridge REST API Specification

All CredBridge API endpoints are versioned and mounted under `/api/v1/`.

## Base URLs
- Local Development: `http://localhost:8000`
- API Prefix: `/api/v1`

## Health & System Endpoints

### 1. Root API Check
- **GET** `/`
- **Response**: `200 OK`
```json
{
  "message": "CredBridge API is running"
}
```

### 2. Service Healthcheck
- **GET** `/api/v1/health`
- **Response**: `200 OK`
```json
{
  "status": "healthy",
  "service": "credbridge-api"
}
```

## Planned API Modules (`/api/v1/`)

| Module Path | Domain Purpose |
|---|---|
| `/api/v1/auth` | User authentication, token issuance (JWT), role management |
| `/api/v1/workers` | Gig worker profiles, platform connection status, bank accounts |
| `/api/v1/transactions` | Raw transaction records, cashflow ingestion streams |
| `/api/v1/verification` | Account Aggregator consent requests & verification flows |
| `/api/v1/analytics` | Underwriting metrics, cashflow velocity, income stability |
| `/api/v1/passport` | Generated Credit Passport metadata & shareable credentials |
| `/api/v1/lenders` | FIU applicant review, credit assessment & underwriting access |

## Standard Error Response Format

```json
{
  "detail": "Descriptive error message",
  "status_code": 400
}
```
