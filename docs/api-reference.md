# CredBridge API Reference & Integration Contract

**Base API Path**: `/api/v1`  
**Interactive Documentation**: `http://localhost:8001/docs`

---

## 1. Response Standards

CredBridge uses standard HTTP status codes and predictable JSON response structures.

### Standard Error Response
For input validation errors (HTTP 422), authentication failures (HTTP 401), or forbidden access (HTTP 403):
```json
{
  "detail": "Descriptive error message",
  "status_code": 400
}
```

---

## 2. Authentication API Specification

### 2.1 DigiLocker Demo Mode Authentication (Gig Workers)
- **Endpoint**: `POST /api/v1/auth/digilocker`
- **Authentication**: Public
- **Request Body**:
  ```json
  {
    "user_index": 1
  }
  ```
- **Success Response** (`200 OK`):
  ```json
  {
    "access_token": "eyJhbGciOi...",
    "token_type": "bearer",
    "user": {
      "id": 1,
      "name": "Aarav Sharma",
      "email": "aarav.sharma@example.com",
      "role": "WORKER"
    }
  }
  ```

### 2.2 Institutional Staff Login (Lenders & Admins)
- **Endpoint**: `POST /api/v1/auth/login`
- **Authentication**: Public
- **Request Body**:
  ```json
  {
    "email": "priya.lender@example.com",
    "password": "Password123!"
  }
  ```
- **Success Response** (`200 OK`):
  ```json
  {
    "access_token": "eyJhbGciOi...",
    "token_type": "bearer",
    "user": {
      "id": 2,
      "name": "Priya Sharma",
      "email": "priya.lender@example.com",
      "role": "LENDER"
    }
  }
  ```

### 2.3 Get Current User Session
- **Endpoint**: `GET /api/v1/auth/me`
- **Authentication**: Bearer Token
- **Success Response** (`200 OK`):
  ```json
  {
    "id": 1,
    "name": "Aarav Sharma",
    "email": "aarav.sharma@example.com",
    "role": "WORKER",
    "is_active": true,
    "worker_profile": {
      "id": 1,
      "full_name": "Aarav Sharma",
      "city": "Bengaluru",
      "occupation": "Zomato Delivery Partner",
      "phone_number": "9876543210"
    }
  }
  ```

---

## 3. Financial Accounts & Aggregation API

### 3.1 List Connected Accounts
- **Endpoint**: `GET /api/v1/financial/accounts` (alias: `/api/v1/aa/bank-accounts`)
- **Authentication**: Bearer Token (`WORKER`)
- **Success Response** (`200 OK`):
  ```json
  [
    {
      "account_id": "ACC-HDFC-4012",
      "bank_name": "HDFC Bank",
      "account_number": "•••• 4012",
      "masked_account_number": "•••• 4012",
      "account_type": "SAVINGS",
      "is_primary": true,
      "is_active": true
    }
  ]
  ```

### 3.2 Select Accounts for Report Analysis
- **Endpoint**: `POST /api/v1/aa/bank-accounts/select`
- **Authentication**: Bearer Token (`WORKER`)
- **Request Body**:
  ```json
  {
    "selected_account_ids": ["ACC-HDFC-4012"]
  }
  ```
- **Success Response** (`200 OK`):
  ```json
  {
    "status": "success",
    "message": "Accounts selected successfully",
    "selected_count": 1
  }
  ```

---

## 4. Verified Gig Income Report API

### 4.1 Generate 12-Month Report
- **Endpoint**: `POST /api/v1/reports/generate`
- **Authentication**: Bearer Token (`WORKER`)
- **Request Body**:
  ```json
  {
    "account_ids": ["ACC-HDFC-4012"]
  }
  ```
- **Success Response** (`201 Created`):
  ```json
  {
    "report_id": "CBR-2026-FEC2-MNZF-8MK8",
    "worker_name": "Aarav Sharma",
    "analysis_period": "01 Sep 2025 — 31 Aug 2026",
    "months_analyzed": 12,
    "total_verified_gig_income": 257100.0,
    "verified_average_monthly_gig_income": 21425.0,
    "consistency_score": 88.0,
    "status": "ACTIVE",
    "income_sources": [
      {
        "source": "Zomato",
        "category": "Food Delivery",
        "transactions": 142,
        "amount": 165000.0,
        "share": 64.18
      }
    ],
    "monthly_breakdown": [
      {
        "month": "Aug 2026",
        "transactions": 12,
        "amount": 22100.0
      }
    ]
  }
  ```

### 4.2 Download Report PDF
- **Endpoint**: `GET /api/v1/reports/{report_id}/pdf`
- **Authentication**: Bearer Token (`WORKER`, `LENDER`, or `ADMIN`)
- **Success Response** (`200 OK`):
  - `Content-Type`: `application/pdf`
  - `Content-Disposition`: `attachment; filename="CredBridge_Income_Report_{report_id}.pdf"`
