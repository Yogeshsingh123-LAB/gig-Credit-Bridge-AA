# 🧠 CredBridge System Architecture & Intelligence Memory (Brain.md)

> **Core Concept**: *"Turn gig income into trusted financial evidence."*  
> CredBridge is NOT a bank, lender, or credit bureau. It is a deterministic financial analytics, income verification, and consent-driven evidence platform designed for gig workers (Uber, Swiggy, Zomato, Urban Company, Blinkit, Zepto, etc.).

---

## 1. System Philosophy & Non-Negotiable Rules

1. **No AI for Financial Numbers**: Financial calculations (income aggregations, expenses, net cashflow, volatility, readiness scores, simulations) are **100% deterministic** built using Pandas and NumPy.
2. **AI Layer Scope**: The LLM API (if key present) is strictly an **explanation layer** for natural-language commentary on pre-calculated numbers. If the AI service fails or is offline, the system falls back to deterministic template commentary without crashing.
3. **Terminology Compliance**:
   - Never use "Official Credit Score" → Use **"CredBridge Financial Readiness Score"** (0–100).
   - Never use "Loan Approved / Rejected" → Use **"Financial Evidence Support"** or **"Assessment Support"**.
4. **Consent-Enforced Data Isolation**: Worker financial evidence is strictly private. Lenders cannot view any worker data unless an active, non-expired consent record is granted by the worker. Revocation immediately terminates access.

---

## 2. Monorepo Architecture Map

```text
SSIT / CredBridge Monorepo
├── backend/                  # FastAPI REST API (Port 8001)
│   ├── app/
│   │   ├── api/v1/          # 13 REST routers (/auth, /profile, /platforms, /transactions, /analytics, /verification, /score, /passport, /consent, /lenders, /admin, /health)
│   │   ├── core/            # Config, Security (bcrypt + JWT), Logging
│   │   ├── database/        # Engine & SessionLocal
│   │   ├── models/          # 13 SQLAlchemy ORM Models
│   │   ├── schemas/         # Pydantic v2 Request/Response Schemas
│   │   └── services/        # Atomic Business Logic Services
│   └── tests/               # Pytest backend integration tests
├── intelligence/             # Deterministic Pandas/NumPy Engine
│   └── src/
│       ├── aggregations/    # Monthly/Categorical pandas aggregations
│       ├── analytics/       # 0–100 Readiness Score & What-If Simulator
│       ├── cleaning/        # Transaction normalization & quality assessment
│       └── engines/         # Verification & AI explanation fallback engines
├── frontend/                 # React 18 + Vite + TypeScript SPA (Port 5173 / 5174)
│   └── src/
│       ├── context/         # AuthContext JWT session management
│       ├── layouts/         # Responsive layouts (Worker, Lender, Admin) with mobile drawers
│       ├── pages/           # 18 Full SPA Pages
│       └── services/        # Axios API client wrapper
├── docs/                     # Architecture, API & Security Specifications
└── run.bat                   # 1-Click Launch Script
```

---

## 3. Database Schema Blueprint (13 Models)

1. **User**: `id`, `name`, `email` (unique, normalized), `password_hash` (bcrypt), `role` (`WORKER`, `LENDER`, `ADMIN`), `is_active`.
2. **WorkerProfile**: `user_id`, `phone`, `city`, `occupation`, `experience_months`, `profile_completion`.
3. **LenderProfile**: `user_id`, `organization_name`, `designation`.
4. **GigPlatform**: `worker_id`, `platform_name` (Uber, Swiggy, etc.), `account_identifier`, `status`.
5. **Transaction**: `worker_id`, `platform_id`, `amount`, `transaction_type` (`CREDIT`, `DEBIT`), `category` (`GIG_INCOME`, `FUEL`, `MAINTENANCE`, `LIVING`, etc.), `date`, `is_demo`.
6. **IncomeVerification**: `worker_id`, `declared_monthly_income`, `verified_monthly_income`, `confidence_score`, `verification_status` (`VERIFIED`, `PARTIALLY_VERIFIED`, `INSUFFICIENT_DATA`, `REVIEW_REQUIRED`), `verified_at`.
7. **FinancialScore**: `worker_id`, `overall_score` (0–100), `sub_scores` (json), `factors` (json), `calculated_at`.
8. **CreditPassport**: `passport_number` (`CB-PASS-...`), `worker_id`, `verification_id`, `score_id`, `snapshot_data` (json), `generated_at`, `version`.
9. **Consent**: `worker_id`, `lender_id`, `passport_id`, `status` (`ACTIVE`, `REVOKED`, `EXPIRED`), `granted_at`, `expires_at`, `revoked_at`.
10. **AuditLog**: `user_id`, `action`, `resource_type`, `resource_id`, `metadata` (json), `timestamp`.
11. **SystemSetting**: `key`, `value`, `updated_at`.
12. **Notification**: `user_id`, `title`, `message`, `is_read`, `created_at`.
13. **Enums**: `UserRole`, `TransactionType`, `TransactionCategory`, `VerificationStatus`, `ConsentStatus`.

---

## 4. Financial Readiness Score Engine (0–100 Weighted Calculation)

The overall Financial Readiness Score is calculated as:

$$\text{Score} = \sum_{i=1}^6 W_i \times S_i$$

| Component | Weight ($W_i$) | Description |
| :--- | :---: | :--- |
| **Income Consistency** | 25% | Monthly variance and cashflow regularity |
| **Cashflow Stability** | 20% | Coefficient of variation in earnings |
| **Evidence Coverage** | 20% | Months of active gig earnings relative to target (6+ months = 100%) |
| **Data Quality Score** | 15% | Missing fields, timestamp gaps, and transaction completeness |
| **Source Diversification** | 10% | Multi-platform earnings (e.g. Uber + Swiggy) |
| **Expense Sustainability** | 10% | Net savings margin (Net Income / Total Income) |

---

## 5. Security & Isolation Matrix

- **Port Configuration**: Backend runs on `http://localhost:8001` (to prevent Windows port 8000 socket collisions).
- **CORS Policy**: Dynamic origin regex `http://(localhost|127\.0\.0\.1)(:\d+)?` permitting Vite frontend on any port (`5173`, `5174`, `5175`).
- **Authorization**:
  - `Worker`: Can access only their own transactions, verification, scores, passports, and consent rules.
  - `Lender`: Can view applicant passports ONLY when `Consent.status == ACTIVE` and `expires_at > NOW()`. Attempting access without active consent returns `403 Forbidden`.
  - `Admin`: Accesses system audit logs and global metrics. Public registration for `ADMIN` is strictly blocked.

---

## 6. Verification & Test Suite Status

- **Backend & Intelligence Pytest Suite**: 45 / 45 passing tests (100% success rate).
- **Frontend SPA Build**: `npm run build` completed with 0 compilation errors.
- **Seeded Demo Accounts**:
  - Worker: `ravi.worker@example.com` / `Password123!`
  - Lender: `priya.lender@example.com` / `Password123!`
  - Admin: `admin@credbridge.com` / `Admin@123456`
