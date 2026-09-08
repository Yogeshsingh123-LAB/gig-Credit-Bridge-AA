# CredBridge ⚡

> **Consent-based financial verification infrastructure for gig economy workers.**

CredBridge provides a transparent, explainable financial profile that empowers lenders to assess gig workers (delivery partners, rideshare drivers, home service providers, freelancers) who lack traditional salary slips or conventional credit bureau footprints.

---

## 1. Project Purpose
The core concept of CredBridge is:
```
Gig Worker → Financial Data → Income Verification → Financial Analysis → Credit Passport → Lender Assessment
```
CredBridge does **NOT** directly approve or reject loans. It aggregates consent-driven financial streams, assesses cashflow velocity and stability, and generates a standardized **Credit Passport** for financial institutions.

---

## 2. Technology Stack

### Frontend
- **Framework**: React 18 + Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Icons**: Lucide React

### Backend
- **Framework**: Python 3.11 + FastAPI
- **Server**: Uvicorn
- **Validation**: Pydantic v2 & Pydantic Settings
- **ORM**: SQLAlchemy 2.0
- **Database**: PostgreSQL (supports Supabase, Neon, Docker Postgres via `DATABASE_URL`)

### Development & DevOps
- **DevOps**: Docker & Docker Compose
- **Environment**: `.env` configuration
- **Architecture**: REST API (/api/v1/)

---

## 3. Project Structure

```
credbridge/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   │   ├── worker/
│   │   │   └── lender/
│   │   ├── layouts/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── types/
│   │   ├── utils/
│   │   ├── assets/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── public/
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── .env.example
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── v1/
│   │   ├── core/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── database/
│   │   └── main.py
│   ├── requirements.txt
│   ├── .env.example
│   └── Dockerfile
│
├── database/
│   └── README.md
│
├── docs/
│   ├── architecture.md
│   └── api.md
│
├── .gitignore
├── README.md
└── docker-compose.yml
```

---

## 4. Environment Variables

### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:8000
```

### Backend (`backend/.env`)
```env
DATABASE_URL=postgresql://username:password@host:5432/database
SECRET_KEY=change-me-in-production
FRONTEND_URL=http://localhost:5173
```

---

## 5. How to Run the Project

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)

### Backend Setup & Execution
1. Navigate to the `backend/` directory:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv .venv
   # Windows PowerShell:
   .venv\Scripts\Activate.ps1
   # macOS/Linux:
   source .venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Copy environment template:
   ```bash
   cp .env.example .env
   ```
5. Run the FastAPI development server:
   ```bash
   uvicorn app.main:app --reload
   ```
   * The API server will run at `http://localhost:8000`.
   * Swagger documentation: `http://localhost:8000/docs`.

### Frontend Setup & Execution
1. Open a new terminal and navigate to the `frontend/` directory:
   ```bash
   cd frontend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Copy environment template:
   ```bash
   cp .env.example .env
   ```
4. Run the Vite development server:
   ```bash
   npm run dev
   ```
   * The React application will run at `http://localhost:5173`.

### Optional Docker Compose Execution
```bash
docker-compose up --build
```

---

## 6. Current Development Status

- ✅ **Step 1 Complete**: Base repository structure created.
- ✅ **Frontend Shell**: React 18, Vite, TypeScript, Tailwind CSS, and React Router configured.
- ✅ **Backend Core**: FastAPI app with CORS middleware, root status endpoint (`GET /`), and health check (`GET /api/v1/health`).
- ✅ **API Services**: Axios service layer connecting frontend to backend health check.
- ✅ **Database Foundation**: SQLAlchemy engine and session initialization ready for PostgreSQL.
- ✅ **Route Placeholders**: Routing prepared for Worker & Lender portals (`/login`, `/worker/*`, `/lender/*`).

---

## 7. Future Planned Modules (`/api/v1/`)

1. **Authentication (`/auth`)**: JWT auth, password hashing, RBAC.
2. **Gig Worker Profiles (`/workers`)**: Profile management & platform linking.
3. **Transaction Ingestion (`/transactions`)**: Bank & platform cashflow streams.
4. **AA Verification (`/verification`)**: RBI Account Aggregator consent gateway integration.
5. **Analytics Engine (`/analytics`)**: Cashflow stability, daily income velocity, volatility metrics.
6. **Credit Passport (`/passport`)**: Standardized score, verification badge & exportable credentials.
7. **Lender Assessment (`/lenders`)**: Institutional underwriter views & applicant review.
