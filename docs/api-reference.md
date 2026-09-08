# CredBridge API Reference & Frontend Integration Contract (Phase 2)

**Base API Path**: `/api/v1`

All authentication and role authorization endpoints are mounted under `/api/v1/auth`.

---

## 1. Response Standards

CredBridge uses standard HTTP status codes and predictable JSON response structures.

### Standard Error Response
For input validation errors (HTTP 422), authentication failures (HTTP 401), or forbidden access (HTTP 403):
```json
{
  "status": "error",
  "message": "Human-readable description of error",
  "details": []
}
```

---

## 2. Authentication API Specification

### 2.1 Register User
- **Endpoint**: `POST /api/v1/auth/register`
- **Authentication**: Public
- **Allowed Roles**: `WORKER`, `LENDER` *(Public registration for `ADMIN` is strictly forbidden and returns HTTP 400)*
- **Request Body**:
  ```json
  {
    "name": "Demo Worker",
    "email": "worker@example.com",
    "password": "password123",
    "role": "WORKER"
  }
  ```
- **Success Response** (`201 Created`):
  ```json
  {
    "id": "e2b2ead4-cee7-447b-b17a-d915f9264be4",
    "name": "Demo Worker",
    "email": "worker@example.com",
    "role": "WORKER",
    "is_active": true,
    "worker_profile": {
      "id": "a1b2c3d4-...",
      "phone": null,
      "city": null,
      "occupation": null,
      "experience_months": 0
    },
    "lender_profile": null
  }
  ```

---

### 2.2 Login (Obtain Access Token)
- **Endpoint**: `POST /api/v1/auth/login`
- **Authentication**: Public
- **Request Body**:
  ```json
  {
    "email": "worker@example.com",
    "password": "password123"
  }
  ```
- **Success Response** (`200 OK`):
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer"
  }
  ```

---

### 2.3 Get Current User Profile
- **Endpoint**: `GET /api/v1/auth/me`
- **Authentication**: Required (`Bearer <access_token>`)
- **Headers**:
  ```http
  Authorization: Bearer <access_token>
  ```
- **Success Response** (`200 OK`):
  ```json
  {
    "id": "e2b2ead4-cee7-447b-b17a-d915f9264be4",
    "name": "Demo Worker",
    "email": "worker@example.com",
    "role": "WORKER",
    "is_active": true,
    "worker_profile": {
      "id": "a1b2c3d4-...",
      "phone": null,
      "city": null,
      "occupation": null,
      "experience_months": 0
    },
    "lender_profile": null
  }
  ```

---

## 3. Role Authorization Matrix

| Endpoint | WORKER Role | LENDER Role | ADMIN Role | Unauthenticated |
| :--- | :--- | :--- | :--- | :--- |
| `GET /api/v1/auth/me` | `200 OK` | `200 OK` | `200 OK` | `401 Unauthorized` |
| `GET /api/v1/auth/test-worker` | `200 OK` | `403 Forbidden` | `403 Forbidden` | `401 Unauthorized` |
| `GET /api/v1/auth/test-lender` | `403 Forbidden` | `200 OK` | `403 Forbidden` | `401 Unauthorized` |
| `GET /api/v1/auth/test-admin` | `403 Forbidden` | `403 Forbidden` | `200 OK` | `401 Unauthorized` |

---

## 4. Admin Seeding Script
To safely seed an initial ADMIN user without exposing public endpoints:
```bash
cd backend
python scripts/create_admin.py --name "System Admin" --email "admin@credbridge.io" --password "adminpassword123"
```
