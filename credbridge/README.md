# CRED BRIDGE ⚡

> *"Turn gig income into trusted financial evidence."*

CredBridge is a production-quality financial verification monorepo platform that helps gig workers (Uber, Swiggy, Zomato, Urban Company, Blinkit, Zepto, etc.) convert fragmented earnings into verified income evidence, financial analytics, an explainable **Financial Readiness Score (0–100)**, and consent-shared **Credit Passports** for lender decision support.

---

## 🚀 Key Features & Capabilities

- **Consolidated Gig Earnings**: Integrates demo platform connections across Uber, Swiggy, Zomato, and Urban Company.
- **Realistic Synthetic Data Generator**: Generates 6–12 months of realistic cashflow transactions labeled as "Demo Data".
- **100% Deterministic Analytics Engine**: Calculates monthly income/expenses, volatility percentage, trend trajectory, and data quality score using Pandas and NumPy.
- **Deterministic Income Verification**: Audits observed vs declared income, coverage percentage, and confidence score (`VERIFIED`, `PARTIALLY_VERIFIED`, `INSUFFICIENT_DATA`, `REVIEW_REQUIRED`).
- **Explainable Financial Readiness Score (0–100)**: Evaluated across 6 weighted components (Consistency 25%, Stability 20%, Coverage 20%, Quality 15%, Diversification 10%, Sustainability 10%) with positive factors and attention areas.
- **Credit Passport**: Versioned financial evidence document snapshotting verified metrics, data quality, and AI fact interpretation.
- **Consent-Based Sharing**: Workers control who views their passport with time-bound active consent and immediate revocation (enforced with HTTP 403 Forbidden).
- **Lender What-If Simulator**: Stress-tests applicant cashflow under hypothetical income/expense variations deterministically.
- **Admin Portal & Security Audit Logs**: Tracks system health, user metrics, and security access logs.
- **Responsive UI Across All Viewports**: Features mobile top header bars, hamburger buttons, and collapsible drawer overlays (tested across 320px–1920px).

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons, Recharts, React Router v6, Axios.
- **Backend**: Python 3.11+, FastAPI, Uvicorn (Port 8001), SQLAlchemy 2.0 ORM, Pydantic v2, Alembic, PostgreSQL / SQLite.
- **Intelligence**: Pandas, NumPy, Python score calculation engines.
- **Testing**: Pytest (45 / 45 passing tests).
- **DevOps**: Docker, Docker Compose, 1-Click Launch Script (`run.bat`).

---

## 📂 Monorepo Structure

```text
credbridge/
├── frontend/             # React 18 + Vite + TypeScript SPA
│   ├── src/
│   │   ├── context/      # AuthContext JWT session management
│   │   ├── layouts/      # Responsive layouts (Worker, Lender, Admin) with mobile drawers
│   │   ├── pages/        # 18 Full SPA Pages
│   │   └── services/     # Axios API client
│   └── package.json
├── backend/              # FastAPI REST API + SQLAlchemy ORM (Port 8001)
│   ├── app/              # API v1 routes (13 endpoints), services, models, schemas
│   ├── alembic/          # Database migrations
│   └── tests/            # Pytest backend integration tests
├── intelligence/         # Pandas & NumPy Analytics & Scoring Engine
│   └── tests/            # Unit tests for scoring & verification
├── docs/                 # Complete architecture, API & setup docs
├── docker-compose.yml    # Containerized orchestration
├── Brain.md              # System Architecture & Technical Memory
├── README.md             # Master documentation
└── run.bat               # 1-Click Application Launcher
```

---

## ⚡ Quick Start

### 1-Click Launch (Windows)
Double-click [`run.bat`](file:///c:/Users/sandi/OneDrive/Desktop/SSIT/run.bat) at the root of the project to automatically start both backend and frontend servers:

```cmd
run.bat
```

- **Backend API**: `http://localhost:8001` (Swagger docs: `http://localhost:8001/docs`)
- **Frontend App**: `http://localhost:5173` (or `http://localhost:5174`)

---

### Manual Execution

#### Terminal 1 — FastAPI Backend (Port 8001)
```bash
cd credbridge/backend
pip install -r requirements.txt
alembic upgrade head
python -m uvicorn app.main:app --port 8001 --reload
```

#### Terminal 2 — React Frontend
```bash
cd credbridge/frontend
npm install
npm run dev
```

#### Running the Full Test Suite
```bash
$env:PYTHONPATH="credbridge;credbridge/backend;."
python -m pytest credbridge/backend/tests credbridge/intelligence/tests
```

---

## 🔑 Pre-Seeded Demo Accounts

| Role | Email Address | Password | Quick Login Action |
| :--- | :--- | :--- | :--- |
| **Worker (Ravi Kumar)** | `ravi.worker@example.com` | `Password123!` | Click **"Worker Demo"** button on Login Page |
| **Lender (Priya Sharma)** | `priya.lender@example.com` | `Password123!` | Click **"Lender Demo"** button on Login Page |
| **Admin** | `admin@credbridge.com` | `Admin@123456` | Click **"Admin Seed"** button on Login Page |

---

## 📄 Compliance & Disclaimer

CredBridge is NOT a bank, lender, or official credit bureau (CIBIL/Experian). CredBridge does NOT approve or reject loans. All Financial Readiness Scores and What-If simulations are analytical evidence tools designed for lender decision support.
