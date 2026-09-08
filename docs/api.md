# CredBridge REST API Specification

All CredBridge API endpoints are versioned and mounted under `/api/v1/`.

---

## Base URLs
- **Local Development**: `http://localhost:8001`
- **Interactive Swagger Documentation**: `http://localhost:8001/docs`
- **API Prefix**: `/api/v1`

---

## Health & System Endpoints

### 1. Root Check
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
  "status": "ok",
  "service": "credbridge-api"
}
```

---

## Authentication & Identity Endpoints

### 1. Get DigiLocker Demo Users
- **GET** `/api/v1/auth/demo-users`
- **Response**: `200 OK`
Returns the 10 pre-seeded synthetic gig worker identities.

### 2. Authenticate with DigiLocker
- **POST** `/api/v1/auth/digilocker`
- **Request Body**:
```json
{
  "user_index": 1
}
```
- **Response**: `200 OK`
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

### 3. Institutional Staff Login (Lenders & Admins)
- **POST** `/api/v1/auth/login`
- **Request Body**:
```json
{
  "email": "priya.lender@example.com",
  "password": "Password123!"
}
```
- **Response**: `200 OK`

### 4. Current User Profile
- **GET** `/api/v1/auth/me`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `200 OK`

---

## Bank Accounts & Ingestion Endpoints

### 1. Get Connected Bank Accounts
- **GET** `/api/v1/financial/accounts` (or `/api/v1/aa/bank-accounts`)
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `200 OK`
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

### 2. Select Accounts for Analysis
- **POST** `/api/v1/aa/bank-accounts/select`
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
```json
{
  "selected_account_ids": ["ACC-HDFC-4012", "ACC-ICICI-8821"]
}
```
- **Response**: `200 OK`

---

## Income Reports & Verification Endpoints

### 1. Generate 12-Month Verified Gig Income Report
- **POST** `/api/v1/reports/generate`
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
```json
{
  "account_ids": ["ACC-HDFC-4012"]
}
```
- **Response**: `201 Created`
Returns the standardized `IncomeReportDetail` snapshot with mathematical reconciliation.

### 2. List Worker Reports
- **GET** `/api/v1/reports`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `200 OK`
Returns an array of generated reports with metadata, authoritative IST timestamps, and consistency scores.

### 3. Get Report Detail
- **GET** `/api/v1/reports/{report_id}`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `200 OK`

### 4. Download Standardized Report PDF
- **GET** `/api/v1/reports/{report_id}/pdf`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `200 OK` (`application/pdf`)
Returns the generated ReportLab PDF adhering to Sections 29–34 formatting, TrueType font rendering, Indian currency format, and NumberedCanvas page numbering.

### 5. Public Report Verification
- **GET** `/api/v1/verify/report/{report_id}`
- **Response**: `200 OK`
Validates report status, digital signature validity, and authenticity without exposing raw private bank records.

---

## Standard Error Response Format

```json
{
  "detail": "Descriptive error message",
  "status_code": 400
}
```
