# CredBridge API Reference Specification (Phase 1)

**Base API Path**: `/api/v1`

---

## 1. Response Standards

CredBridge uses standard HTTP status codes and predictable JSON response structures.

### Standard Success Response
```json
{
  "status": "ok",
  "data": {}
}
```

### Standard Error Response
For input validation errors (HTTP 422) or unhandled exceptions (HTTP 500), the API returns a safe error structure without exposing stack traces or internal database credentials:

```json
{
  "status": "error",
  "message": "Human-readable description of error",
  "details": []
}
```

---

## 2. Phase 1 Active Endpoints

### `GET /`
- **Description**: Root server diagnostic endpoint.
- **Status Code**: `200 OK`
- **Response Body**:
  ```json
  {
    "message": "CredBridge API is running"
  }
  ```

### `GET /api/v1/health`
- **Description**: Independent system health check for monitoring and frontend integration.
- **Status Code**: `200 OK`
- **Response Body**:
  ```json
  {
    "status": "ok",
    "service": "credbridge-api"
  }
  ```

---

## 3. Interactive Documentation

When running locally, interactive API documentation is automatically available at:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`
- **OpenAPI Schema**: `http://localhost:8000/api/v1/openapi.json`
