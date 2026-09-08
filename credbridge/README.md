# CRED BRIDGE ⚡

> *"Turn gig income into trusted financial evidence."*

CredBridge is a production-quality financial verification platform designed for gig economy workers (Uber, Swiggy, Zomato, Urban Company, Blinkit, Zepto, etc.). It converts fragmented digital earnings into standardized, mathematically reconciled **Verified Gig Income Reports**, financial analytics, and verifiable proof for lender underwriting support.

---

## 🚀 Key Features & Capabilities

- **Passwordless DigiLocker Authentication**: Pre-configured Demo Mode featuring 10 realistic synthetic Indian gig worker profiles with verified KYC and transaction histories.
- **Simplified Worker Portal**: Clean, focused interface with strictly 5 navigation destinations:
  `Dashboard`, `Generate Report`, `Reports`, `Profile`, `Settings`, `Logout`.
- **Master "Choose All Banks" Selector**: Dynamic multi-account selection with real-time derived state synchronization.
- **Fixed 12-Month Calendar Analysis**: Analyzes exactly 12 calendar months of cashflow data, separating gig platform payouts from personal UPI transfers and operating expenses.
- **Single Source of Truth & Mathematical Reconciliation**:
  - $\sum \text{Verified Sources} = \text{Total Verified Income}$
  - $\sum 12 \text{ Monthly Breakdowns} = \text{Total Verified Income}$
  - $\text{Average Monthly Income} = \frac{\text{Total Verified Income}}{12}$
  - Enforced server-side through `ReportValidator` prior to persistence and PDF rendering.
- **Standardized Verified Gig Income Report (PDF)**:
  - **Indian Currency Standards**: Formatted in Indian Rupee notation (`₹`, Lakhs, e.g. `₹2,57,100`).
  - **Authoritative IST Timestamps**: Unified timestamping (`DD MMM YYYY • HH:MM AM/PM IST`).
  - **TrueType Font Rendering**: Native typography avoiding standard PostScript glyph limitations.
  - **Verified Income Sources & 12-Month Breakdown Tables**: Itemized tabular evidence with totals.
  - **Report Authenticity**: Verifiable QR code, Report ID (`CBR-2026-XXXXXXXX`), and `Digitally Verifiable` issuer stamp.
  - **NumberedCanvas Running Footer**: Two-pass footer (`CredBridge | Verified Gig Income Report • Report ID: CBR-2026-XXXXXXXX • Page X of Y`).
- **Lender Portal & What-If Cashflow Simulator**: Allows financial institutions to stress-test applicant cashflow under hypothetical income/expense variations deterministically.
- **Admin Audit Trail & Metrics**: Comprehensive system monitoring and immutable security audit logs.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons, Recharts, React Router v6, Axios (Port 5173).
- **Backend**: Python 3.11+, FastAPI, Uvicorn (Port 8001), SQLAlchemy 2.0 ORM, Pydantic v2, PostgreSQL / SQLite.
- **PDF Engine**: ReportLab with TrueType font detection, NumberedCanvas, and dynamic QR generation.
- **Testing**: Pytest automated test suite (29 / 29 passing tests).
- **DevOps**: Docker, Docker Compose, 1-Click Launch Script (`run.bat`).

---

## 📂 Monorepo Structure

```text
SSIT / CredBridge Monorepo
├── backend/                  # FastAPI REST API + SQLAlchemy ORM (Port 8001)
│   ├── app/
│   │   ├── api/v1/          # REST route handlers (/auth, /reports, /financial/accounts, etc.)
│   │   ├── models/          # SQLAlchemy ORM Models (User, WorkerProfile, IncomeReport, etc.)
│   │   ├── services/        # Business logic, PDF rendering & ReportValidator
│   │   └── scripts/         # Mock data seeding & synthetic generator
│   └── tests/               # Pytest suite with PDF snapshot regression tests
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

## ⚡ Quick Start

### 1-Click Launch (Windows)
Double-click `run.bat` at the root of the project to launch:
- **Backend**: FastAPI on `http://localhost:8001`
- **Frontend**: Vite on `http://localhost:5173`

```cmd
run.bat
```

### Manual Launch

#### Terminal 1 — Backend (Port 8001)
```bash
cd backend
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --port 8001 --reload
```
- API Docs (Swagger): `http://localhost:8001/docs`
- Health Check: `http://localhost:8001/api/v1/health`

#### Terminal 2 — Frontend (Port 5173)
```bash
cd frontend
npm install
npm run dev
```
- Web Application: `http://localhost:5173`

---

## 🧪 Running Automated Tests

```bash
cd backend
$env:PYTHONPATH = ".;../credbridge"
.\.venv\Scripts\python.exe -m pytest tests -v
```
All 29 integration tests and regression tests pass, including:
- PDF snapshot validation (`test_report_pdf_matches_snapshot`)
- Mathematical reconciliation assertions
- Authentication and role-based access controls
- Bank account selection and report generation lifecycle

---

## 🔑 Pre-Seeded Demo Accounts

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

### 2. Institutional Access
Click **"Lender / Institutional Access →"** on the `/login` screen:

| Role | Email Address | Password | Quick Fill Action |
| :--- | :--- | :--- | :--- |
| **Institutional Lender** | `priya.lender@example.com` | `Password123!` | Click **"Use Demo Lender"** |
| **System Administrator** | `admin@credbridge.internal` | `AdminPassword123!` | Click **"Use Demo Admin"** |

---

## 📄 Compliance & Regulatory Disclaimer

CredBridge is an independent financial evidence verification infrastructure and is **NOT** a bank, Non-Banking Financial Company (NBFC), or credit rating bureau (e.g., CIBIL, Experian, Equifax). CredBridge does **NOT** issue credit guarantees, underwrite loans, or approve/reject financing applications. All metrics and reports are deterministic analytical evidence tools provided for lender decision support.
