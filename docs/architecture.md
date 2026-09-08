# CredBridge System Architecture

CredBridge is a consent-based financial verification platform for gig workers in India. It bridges the gap between gig economy workers who lack traditional payslips and lenders seeking verifiable financial profiles.

## Core Data Flow

```
[ Gig Worker ]
      │
      ▼ (1. Consent Authorization)
[ Account Aggregator / Data Provider ] (RBI Regulated FIP / Platform APIs)
      │
      ▼ (2. Encrypted Financial Data Stream)
[ Verification Engine ] (Cashflow verification, income stability & anomaly detection)
      │
      ▼ (3. Financial Analytics)
[ Analytics & GigScore Module ] (Daily cashflow velocity, volatility, payout stability)
      │
      ▼ (4. Structured Profile)
[ Credit Passport ] (Explainable, standardized risk profile & consent audit trails)
      │
      ▼ (5. Read-Only Assessment API)
[ Lender / FIU Dashboard ]
```

## System Layers

### 1. Frontend Layer (`frontend/`)
- Built with React 18, Vite, TypeScript, Tailwind CSS, and React Router v6.
- Communicates with the backend using an Axios API service layer (`frontend/src/services/api.ts`).
- Provides distinct user experiences for Workers (`/worker/*`) and Lenders (`/lender/*`).

### 2. Backend API Layer (`backend/`)
- Built with Python FastAPI, Uvicorn, Pydantic v2, and SQLAlchemy.
- Standardized REST endpoints organized under versioned route modules (`/api/v1/`).
- Handles CORS, request validation, authentication, and core domain business logic.

### 3. Database Layer (`database/`)
- Uses PostgreSQL configured dynamically via `DATABASE_URL`.
- Compatible with local PostgreSQL instances as well as cloud PostgreSQL services (Supabase, Neon, AWS RDS).
- SQLAlchemy ORM models handle database abstraction.

### 4. Integration Architecture (Future Roadmap)
- RBI Account Aggregator framework (Setu / OneMoney / Sahamati APIs) for FIU data fetches.
- Gig platform partner integrations (Zomato, Swiggy, Uber, Urban Company) for cashflow verification.
