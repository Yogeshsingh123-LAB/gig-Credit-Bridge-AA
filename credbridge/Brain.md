# 🧠 CredBridge System Architecture & Memory (Brain.md)

> **Core Purpose**: *"Turn gig income into trusted financial evidence."*  
> CredBridge is an evidence verification monorepo platform that enables gig workers (Uber, Swiggy, Zomato, Urban Company, Blinkit, Zepto, etc.) to convert fragmented bank cashflow into standardized, tamper-evident **Verified Gig Income Reports**.

---

## 1. System Invariants & Non-Negotiable Rules

1. **Deterministic Financial Math**:
   - All income calculations, monthly aggregations, and consistency metrics are **100% deterministic**.
   - No generative AI is used for financial calculations or numbers.
2. **Single Source of Truth Snapshot**:
   - The database record, frontend UI, and generated PDF report strictly consume the identical `FinalReportSnapshot` dataclass payload.
3. **Strict Mathematical Reconciliation**:
   - The `ReportValidator` enforces 3 core mathematical invariants before saving or generating reports:
     $$\sum \text{Income Sources} = \text{Total Verified Income}$$
     $$\sum 12 \text{ Monthly Breakdowns} = \text{Total Verified Income}$$
     $$\text{Average Monthly Income} = \frac{\text{Total Verified Income}}{12}$$
   - Any mathematical divergence raises an immediate validation failure.
4. **Fixed 12-Month Calendar Window**:
   - Analysis covers strictly the last 12 calendar months (`range(11, -1, -1)`).
5. **Standardized Formatting**:
   - **Currency**: Indian Rupee notation (`format_inr`, e.g., `₹2,57,100`).
   - **Timestamp**: Authoritative Indian Standard Time (`DD MMM YYYY • HH:MM AM/PM IST`).
6. **Regulatory Compliance & Terminology**:
   - CredBridge is **NOT** a bank, NBFC, or credit bureau.
   - Never use "Official Credit Score" → Use **"Verified Gig Income Report"** and **"Consistency Score"**.
   - Never claim loan approval or guarantee credit.
7. **User Report Privacy**:
   - Technical strings (`Integrity: SHA-256 Protected (...)` and `Signature: Valid (...)`) are omitted from user reports and printouts, presenting a clean, user-friendly verification block with QR code, Report ID, and `Digitally Verifiable` status.

---

## 2. Monorepo Architecture Map

```text
SSIT / CredBridge Monorepo
├── backend/                  # FastAPI REST API (Port 8001)
│   ├── app/
│   │   ├── api/v1/          # REST route handlers (/auth, /reports, /financial/accounts, etc.)
│   │   ├── core/            # Security (JWT, bcrypt), logging, config
│   │   ├── models/          # 13 SQLAlchemy ORM Models (User, WorkerProfile, IncomeReport, etc.)
│   │   ├── services/        # report_validator, pdf_service, worker_workflow_service, crypto_service
│   │   └── scripts/         # Mock data seeding & synthetic generator
│   └── tests/               # 29 Pytest tests (including PDF snapshot regression test)
├── frontend/                 # React 18 + Vite + TypeScript SPA (Port 5173)
│   ├── src/
│   │   ├── layouts/         # WorkerLayout, LenderLayout, AdminLayout, MainLayout
│   │   ├── pages/           # Worker, Lender, and Admin application pages
│   │   ├── services/        # Axios API client
│   │   └── routes/          # Protected routing matrix
│   └── package.json
├── credbridge/               # Mirrored project directory
├── docs/                     # System architecture, API, and demo guides
├── docker-compose.yml        # Multi-container orchestration
├── Brain.md                  # System architecture memory & core invariants
└── README.md                 # Master repository guide
```

---

## 3. Worker Portal Architecture

### 1. Navigation Matrix
The worker portal navigation strictly contains 5 destinations:
1. `Dashboard` (`/worker/dashboard`)
2. `Generate Report` (`/worker/bank-accounts`)
3. `Reports` (`/worker/reports`)
4. `Profile` (`/worker/profile`)
5. `Settings` (`/worker/settings`)
6. `Logout`

*Legacy consent routes (`/worker/consent`, `/worker/data-access`) are seamlessly redirected to `/worker/bank-accounts`.*

### 2. Bank Account Selection & Master Toggle
- Located at `/worker/bank-accounts`.
- Prominent **"Choose All Banks"** master checkbox at top.
- State is dynamically derived: `allSelected = (selectedAccounts.length === accounts.length && accounts.length > 0)`.
- Selecting or deselecting individual accounts automatically updates the master toggle.

### 3. Report Generation Workflow
$$\text{Generate Report} \longrightarrow \text{Choose All Banks / Accounts} \longrightarrow \text{Analyze Income} \longrightarrow \text{Report Ready \& PDF Download}$$

---

## 4. PDF Generation Specifications (Sections 29–34 Compliance)

1. **Title**: Header explicitly renders `VERIFIED GIG INCOME REPORT` with subtitle `CRED BRIDGE`.
2. **Typography**: Uses TrueType font detection (`TTFont`) registering system Arial / Segoe UI / DejaVuSans to natively display the Indian Rupee (`₹`) symbol.
3. **Metadata Block**: Worker Name, Masked Aadhaar, Report ID, Analysis Period (Fixed 12 Months), Issued Date (IST), Verification Status.
4. **Executive Summary**: 3 metric callout boxes for Total Verified Income, Average Monthly Income, and Consistency Score.
5. **Verified Income Sources Table**: Itemized platform breakdown (Category, Transactions, Amount, Share %) plus a reconciled Total row.
6. **12-Month Observed Breakdown Table**: All 12 calendar months itemized (Month, Transactions, Amount) plus a reconciled Total row.
7. **Report Authenticity**: Verifiable QR code linking to verification portal (`/verify-report?id=...`), Report ID, and `Digitally Verifiable` badge.
8. **NumberedCanvas Running Footer**: Two-pass page numbering:
   `CredBridge | Verified Gig Income Report • Report ID: CBR-2026-XXXXXXXX • Page X of Y`

---

## 5. Security & Isolation Matrix

- **Port Configuration**: Backend runs on `http://localhost:8001` (to prevent Windows port 8000 socket collisions).
- **CORS Policy**: Dynamic origin regex permitting Vite frontend on any port (`5173`, `5174`, `5175`).
- **Authentication**:
  - Workers authenticate via DigiLocker Demo Mode (passwordless JWT).
  - Institutional Lenders and Admins authenticate via institutional credentials.
  - Public registration is closed; all accounts are managed through verified channels.
- **Data Isolation**: Workers can access only their own financial reports, accounts, and profile data.

---

## 6. Automated Testing Standards

- **Backend Pytest Suite**: 29 / 29 passing tests (100% success rate).
- **PDF Regression Test**: `test_pdf_snapshot_regression.py` uses `pypdf.PdfReader` to extract and verify that:
  - Exact title `VERIFIED GIG INCOME REPORT` is present.
  - DB Total == Backend Total == PDF Total.
  - DB Average == Backend Average == PDF Average.
  - All 12 calendar months are present and reconciled.
  - Authoritative IST timestamp is present.
  - Technical hash strings (`SHA-256 Protected`, `Signature: Valid`) are omitted from user reports.
