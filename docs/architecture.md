# CredBridge System Architecture

CredBridge is a financial verification monorepo platform for gig workers in India. It bridges the gap between gig economy workers who lack traditional payslips and lenders seeking verifiable, tamper-evident financial evidence.

---

## 1. Core Data Flow

```text
[ Gig Worker ]
      │
      ▼ (1. Passwordless DigiLocker Verification)
[ Identity Layer ] (Aadhaar KYC Verification, Masked UID)
      │
      ▼ (2. Bank Account Selection - "Choose All Banks")
[ Financial Data Ingestion ] (Authorized Bank Account Aggregation)
      │
      ▼ (3. Deterministic Cashflow Classification)
[ Income Classifier & Filter ] (Separates Gig Credits from Personal Transfers)
      │
      ▼ (4. Single Source Snapshot & Validation)
[ ReportValidator ] (Mathematical Reconciliation: Total == Sum(Sources) == Sum(Months))
      │
      ▼ (5. Verified Report & PDF Generation)
[ Verified Gig Income Report ] (ReportLab PDF, Indian INR Format, IST Timestamps, QR Authenticity)
      │
      ▼ (6. Read-Only Underwriting & Assessment)
[ Lender / FIU Portal ] (Applicant Review & What-If Stress Testing Simulator)
```

---

## 2. System Layers

### 1. Frontend Layer (`frontend/`)
- Built with React 18, Vite, TypeScript, Tailwind CSS, and React Router v6 (Port 5173).
- Communicates with the backend using an Axios API service layer (`frontend/src/services/api.ts`).
- Provides distinct user experiences for Workers (`/worker/*`), Lenders (`/lender/*`), and Admins (`/admin/*`).
- Features a streamlined Worker Portal with strictly 5 navigation destinations: `Dashboard`, `Generate Report`, `Reports`, `Profile`, and `Settings`.
- Offers a dynamic **"Choose All Banks"** master toggle on the account selection interface.

### 2. Backend API Layer (`backend/`)
- Built with Python FastAPI, Uvicorn, Pydantic v2, and SQLAlchemy 2.0 ORM (Port 8001).
- Standardized REST endpoints organized under versioned route modules (`/api/v1/`).
- Enforces strict mathematical reconciliation rules via `ReportValidator`:
  - $\sum \text{Income Sources} = \text{Total Verified Income}$
  - $\sum 12 \text{ Monthly Breakdowns} = \text{Total Verified Income}$
  - $\text{Average Monthly Income} = \frac{\text{Total Verified Income}}{12}$
- Implements TrueType font-based ReportLab PDF generation with NumberedCanvas running page footers and verifiable QR codes.

### 3. Database Layer (`database/`)
- Uses PostgreSQL configured dynamically via `DATABASE_URL` with automatic local SQLite fallback.
- SQLAlchemy ORM models handle schema definition, relationships, and audit tracking.

---

## 3. Key Invariants & Standards

1. **Deterministic Analytics**: All financial aggregations, monthly totals, and consistency metrics are computed using deterministic logic (no generative AI on financial numbers).
2. **Standardized Formatting**:
   - **Currency**: Indian Rupee notation (`format_inr`, e.g., `₹2,57,100`).
   - **Timestamp**: Authoritative Indian Standard Time (`DD MMM YYYY • HH:MM AM/PM IST`).
3. **Single Source of Truth**: The database, frontend preview, and generated PDF report consume the identical `FinalReportSnapshot` payload.
4. **User Report Privacy**: Raw cryptographic hashes and signature keys are omitted from user-facing reports and printouts, while preserving digital verification via QR code and Report ID.
