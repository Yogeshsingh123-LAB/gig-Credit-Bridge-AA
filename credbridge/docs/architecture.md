# CredBridge Architecture Documentation

CredBridge is a full-stack financial verification platform designed to convert fragmented gig worker income into verified financial evidence, a Financial Readiness Score (0–100), an explainable Credit Passport, and lender-ready analytical reports.

## High-Level Architecture Diagram

```
                 CRED BRIDGE MONOREPO
                          │
      ┌───────────────────┼───────────────────┐
      │                   │                   │
   FRONTEND            BACKEND           INTELLIGENCE
 (React 18, Vite,     (FastAPI,         (Pandas, NumPy,
  TypeScript,         SQLAlchemy 2,      Deterministic
  Tailwind CSS,       Pydantic v2,       Scoring & AI
  Recharts)           JWT Auth)          Interpreter)
      │                   │                   │
      └───────────────────┼───────────────────┘
                          │
                 PostgreSQL / SQLite
```

---

## Technical Stack

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons, Recharts, React Router v6, Axios.
- **Backend**: Python 3.11+, FastAPI, Uvicorn, SQLAlchemy 2.0 ORM, Pydantic v2, Alembic, PostgreSQL / SQLite test fallback.
- **Authentication**: JWT signed access tokens, bcrypt password hashing, role-based access control (`WORKER`, `LENDER`, `ADMIN`).
- **Intelligence**: Pandas, NumPy, Python deterministic score calculation engines, structured LLM prompt interpreter with template fallback.
- **Testing**: Pytest (Python backend/intelligence tests), Vitest/TSC frontend build checks.
- **DevOps**: Docker, Docker Compose, `.env` configuration.
