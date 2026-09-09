# CRED BRIDGE ⚡

> *"Turn gig income into trusted financial evidence."*

CredBridge is a production-grade financial evidence verification platform designed for gig economy workers (Uber, Swiggy, Zomato, Urban Company, Blinkit, Zepto, etc.). It converts fragmented digital platform payouts into standardized, mathematically reconciled **Verified Gig Income Reports**, deterministic cashflow analytics, and verifiable proof for institutional lender underwriting.

---

## 🚀 Key Features & Capabilities

### 1. 👷 Worker Portal
- **Passwordless DigiLocker Authentication**: Pre-configured Demo Mode featuring 10 realistic synthetic Indian gig worker profiles with verified KYC and transaction histories.
- **Streamlined 5-Destination Navigation**: Clean, focused interface (`Dashboard`, `Generate Report`, `Reports`, `Profile`, `Settings`, `Logout`).
- **Master "Choose All Banks" Selector**: Dynamic multi-account selection with real-time derived state synchronization.
- **Fixed 12-Month Calendar Analysis**: Analyzes exactly 12 calendar months of cashflow data, separating gig platform payouts from personal UPI transfers and operating expenses.
- **Standardized Verified Gig Income Report (PDF)**:
  - **Indian Currency Standards**: Formatted in Indian Rupee notation (`₹`, Lakhs, e.g., `₹2,57,100`).
  - **Authoritative IST Timestamps**: Unified timestamping (`DD MMM YYYY • HH:MM AM/PM IST`).
  - **TrueType Typography**: Native font rendering displaying the Indian Rupee symbol accurately.
  - **Itemized Tables**: Verified Income Sources table and 12-Month Observed Breakdown table with totals.
  - **Tamper-Evident Authenticity**: Verifiable QR code linking to `/verify-report?id=...`, Report ID (`CBR-2026-XXXXXXXX`), and `Digitally Verifiable` badge.
  - **NumberedCanvas Two-Pass Running Footer**: `CredBridge | Verified Gig Income Report • Report ID: CBR-2026-XXXXXXXX • Page X of Y`.

### 2. 🏦 Lender Portal & Underwriting Support
- **Sticky Top Navigation**: Seamless horizontal navigation bar with search, notification badge, and profile menu.
- **Shared Applicant Tracking**: Real-time review of consented gig worker financial profiles and reports.
- **Deterministic What-If Cashflow Simulator**: Allows financial institutions to stress-test applicant cashflow under hypothetical income/expense variations deterministically (0% generative AI hallucinations).
- **Consistency Scoring**: Proprietary multi-platform regularity and income stability metrics.

### 3. 🛡️ Admin Portal & System Governance
- **Sticky Top Navigation Header**: Clean horizontal navbar featuring the official CredBridge logo with `ADMIN PORTAL` badge.
- **User Management**: Inspect and manage worker and institutional users with full verification status.
- **Lender Management & Credential Issuance**: Admin can appoint new institutional lenders and generate their secure credentials.
- **Immutable Security Audit Logs**: Comprehensive audit trail capturing authentication, report generation, and data access events.
- **System Health Monitor**: Real-time status of API latency, database connections, and background workers.
- **System Configuration**: Fine-tune security, data retention, and verification parameters.

---

## 📐 Core Invariants & Mathematical Reconciliation

CredBridge strictly enforces deterministic financial calculations:

1. **Strict Mathematical Reconciliation**:
   $$\sum \text{Verified Sources} = \text{Total Verified Income}$$
   $$\sum 12 \text{ Monthly Breakdowns} = \text{Total Verified Income}$$
   $$\text{Average Monthly Income} = \frac{\text{Total Verified Income}}{12}$$
   *Enforced server-side via `ReportValidator` before persistence and PDF rendering.*

2. **Single Source of Truth**:
   The database record, frontend UI, and generated PDF report consume the identical `FinalReportSnapshot` payload.

3. **Regulatory Compliance & Terminology**:
   CredBridge is **NOT** a bank, NBFC, or credit rating agency. All metrics and reports are deterministic analytical evidence tools provided for lender decision support.

---

## 🛠️ Technology Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS | Modular SPA running on `http://localhost:5173` |
| **Icons & UI** | Lucide React, Recharts | Plus Jakarta Sans typography, custom design system |
| **Backend** | Python 3.11+, FastAPI, Uvicorn | High-performance async REST API on `http://localhost:8001` |
| **ORM & DB** | SQLAlchemy 2.0, Pydantic v2, SQLite / PostgreSQL | 13 relational ORM models with strict validation |
| **PDF Engine** | ReportLab, `pypdf`, `qrcode` | Vector-precise PDF engine with TrueType font rendering |
| **Testing** | Pytest | 29 passing automated integration and regression tests |
| **DevOps** | Docker, Docker Compose, Windows Batch Scripts | 1-click startup via `run.bat` |

---

## 📂 Repository Structure

```text
SSIT / CredBridge Monorepo
├── backend/                  # FastAPI REST API + SQLAlchemy ORM (Port 8001)
│   ├── app/
│   │   ├── api/v1/          # REST route handlers (/auth, /reports, /financial/accounts, /admin, etc.)
│   │   ├── core/            # Security (JWT, bcrypt), config, logging
│   │   ├── models/          # 13 SQLAlchemy ORM Models (User, WorkerProfile, IncomeReport, etc.)
│   │   ├── services/        # ReportValidator, PDFService, WorkerWorkflowService
│   │   └── scripts/         # Mock data seeding & synthetic generator
│   └── tests/               # Pytest suite with PDF snapshot regression tests
├── frontend/                 # React 18 + Vite + TypeScript SPA (Port 5173)
│   ├── public/              # Brand logos and static assets
│   ├── src/
│   │   ├── components/      # CredBridgeLogo, ErrorBoundary, Shared UI components
│   │   ├── context/         # AuthContext with role-based routing
│   │   ├── layouts/         # WorkerLayout, LenderLayout, AdminLayout, MainLayout
│   │   ├── pages/           # Worker, Lender, Admin, and Public landing pages
│   │   ├── routes/          # Protected routing matrix
│   │   └── services/        # Axios API client
│   └── package.json
├── credbridge/               # Mirrored project package
├── docs/                     # System architecture, API, and demo guides
├── docker-compose.yml        # Multi-container orchestration
├── run.bat                   # 1-Click launcher script for Windows
└── README.md                 # Master repository guide
```

---

## ⚡ Quick Start

### 1-Click Launch (Windows)
Double-click `run.bat` at the root of the project to automatically start both backend and frontend:

```cmd
run.bat
```
- **Frontend**: `http://localhost:5173`
- **Backend API**: `http://localhost:8001`
- **API Docs (Swagger)**: `http://localhost:8001/docs`

### Manual Launch

#### 1. Backend (Port 8001)
```bash
cd backend
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --port 8001 --reload
```

#### 2. Frontend (Port 5173)
```bash
cd frontend
npm install
npm run dev
```

---

## 🔑 Pre-Seeded Demo Credentials

### 1. Gig Workers (DigiLocker Demo Mode)
Select any of the 10 pre-loaded identities directly from the `/login` screen:
1. **Aarav Sharma** — Zomato Delivery Partner (Bengaluru)
2. **Rajesh Patel** — Uber Driver (Mumbai)
3. **Sunita Verma** — Swiggy Food Partner (Delhi NCR)
4. **Vikram Singh** — Urban Company Home Salon Specialist (Hyderabad)
5. **Sneha Kulkarni** — Zepto Last-Mile Associate (Pune)
6. **Mohammed Rizwan** — Blinkit Store Picker / Dispatcher (Chennai)
7. **Ananya Das** — Swiggy Instamart Rider (Kolkata)
8. **Deepak Yadav** — Uber Auto Driver (Jaipur)
9. **Pooja Nair** — Urban Company Appliance Repair Tech (Kochi)
10. **Manoj Tiwari** — Zomato Delivery Associate (Ahmedabad)

### 2. Institutional & Admin Access
Click **"Lender / Institutional Access →"** on the `/login` screen:

| Role | Email Address | Password | Quick Fill Action |
| :--- | :--- | :--- | :--- |
| **Institutional Lender** | `priya.lender@example.com` | `Password123!` | Click **"Use Demo Lender"** |
| **System Administrator** | `admin@credbridge.internal` | `AdminPassword123!` | Click **"Use Demo Admin"** |

---

## 🧪 Testing & Verification

Run the comprehensive automated test suite:

```bash
cd backend
$env:PYTHONPATH = ".;../credbridge"
.\.venv\Scripts\python.exe -m pytest tests -v
```

All 29 integration and regression tests pass, verifying:
- PDF snapshot validation (`test_report_pdf_matches_snapshot`)
- Mathematical reconciliation invariants
- Authentication and role-based access control
- Bank account selection and report lifecycle

---

## 📄 Compliance & Regulatory Disclaimer

CredBridge is an independent financial evidence verification infrastructure and is **NOT** a bank, Non-Banking Financial Company (NBFC), or credit rating bureau (e.g., CIBIL, Experian, Equifax). CredBridge does **NOT** issue credit guarantees, underwrite loans, or approve/reject financing applications. All metrics and reports are deterministic analytical evidence tools provided for lender decision support.
