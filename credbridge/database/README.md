# CredBridge Database Architecture & Schema

## Overview

CredBridge uses **PostgreSQL** (with dynamic local **SQLite** fallback for rapid development) managed via **SQLAlchemy 2.0 ORM** and **Alembic** migrations.

The database URL is configured via environment variable `DATABASE_URL`:
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/credbridge
```
*If PostgreSQL is unavailable at launch, the backend seamlessly falls back to local SQLite without crashing.*

---

## Active Schema Entities

1. **`users`**:
   - `id`, `name`, `email`, `password_hash`, `role` (`WORKER`, `LENDER`, `ADMIN`), `identity_provider` (`DIGILOCKER`, `LOCAL`), `is_active`, `is_demo`.
2. **`worker_profiles`**:
   - `id`, `user_id`, `full_name`, `phone_number`, `city`, `occupation`, `aadhaar_masked`, `pan_masked`.
3. **`lender_profiles`**:
   - `id`, `user_id`, `organization_name`, `designation`.
4. **`financial_accounts`**:
   - `id`, `worker_id`, `bank_name`, `account_number`, `masked_account_number`, `account_type`, `is_primary`, `is_active`.
5. **`income_reports`**:
   - `id`, `report_id` (`CBR-2026-XXXXXXXX`), `worker_id`, `analysis_start_date`, `analysis_end_date`, `months_analyzed` (12), `total_verified_gig_income`, `verified_average_monthly_gig_income`, `consistency_score`, `accounts_analyzed` (JSON), `income_sources` (JSON), `monthly_breakdown` (JSON), `canonical_hash`, `signature`, `signature_algorithm`, `status` (`ACTIVE`, `REVOKED`), `issued_at`.
6. **`aa_consents`**:
   - `id`, `worker_id`, `consent_handle`, `fiu_id`, `status` (`ACTIVE`, `REVOKED`, `EXPIRED`), `accounts_covered` (JSON), `created_at`.
7. **`report_shares`**:
   - `id`, `report_id`, `worker_id`, `lender_id`, `status`, `expires_at`, `created_at`.
8. **`audit_logs`**:
   - `id`, `user_id`, `action`, `resource_type`, `resource_id`, `metadata` (JSON), `timestamp`.

---

## Migration Commands (Alembic)

```bash
# Autogenerate migration revision
alembic revision --autogenerate -m "migration description"

# Apply pending migrations
alembic upgrade head
```
