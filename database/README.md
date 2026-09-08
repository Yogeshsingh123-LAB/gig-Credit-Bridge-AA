<<<<<<< HEAD
# CredBridge Database Architecture & Migration Roadmap

## Overview

CredBridge uses **PostgreSQL** (compatible with local PostgreSQL, **Supabase**, and **Neon**) managed via **SQLAlchemy 2.x** and **Alembic** migrations.

The database URL is configured via environment variable `DATABASE_URL`:
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/credbridge
```

---

## Migration Commands (Alembic)

To autogenerate a migration revision after defining model changes:
```bash
alembic revision --autogenerate -m "description of migration"
```

To apply pending migrations to the database:
```bash
alembic upgrade head
```

---

## Database Module Roadmap

1. **Users** (Implemented in Phase 2)
   - Core authentication identities, roles (Worker, Lender, Admin), hashed credentials.
2. **Worker Profiles** (Implemented in Phase 2)
   - Worker demographics, gig platform links, primary payment details.
3. **Lender Profiles** (Implemented in Phase 2)
   - Financial institution metadata, underwriting preferences.
4. **Gig Platforms** `[Planned / Future Phase]`
   - Linked platforms (Uber, Swiggy, Zomato, Urban Company) and consent tokens.
5. **Transactions** `[Planned / Future Phase]`
   - Ingested bank statements, platform payout receipts, expense classifications.
6. **Income Verifications** `[Planned / Future Phase]`
   - Verification engine audit logs, payout-to-deposit matching metrics, fraud flags.
7. **Financial Readiness Scores** `[Planned / Future Phase]`
   - Computed cash flow stability, DSCR, volatility scores.
8. **Credit Passports** `[Planned / Future Phase]`
   - Verifiable credit passport certificates, cryptographic hashes, QR validation payloads.
=======
# CredBridge Database Documentation

## Database Technology
- **Engine**: PostgreSQL 15+
- **ORM**: SQLAlchemy 2.0+ (Python)
- **Migrations**: Alembic (to be configured in future steps)

## Configuration
The backend database connection is configured strictly via the `DATABASE_URL` environment variable.

### Format
`postgresql://<username>:<password>@<host>:<port>/<dbname>`

### Supported Providers
1. **Local Docker PostgreSQL**: `postgresql://credbridge_user:credbridge_password@localhost:5432/credbridge_db`
2. **Supabase**: `postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres`
3. **Neon PostgreSQL**: `postgresql://[user]:[password]@[ep-name].aws.neon.tech/neondb`

## Setup & Initialization
In Step 1, the database session helper is initialized under `backend/app/database/session.py`. 
SQLAlchemy's `Base.metadata.create_all(bind=engine)` will be executed when models are introduced in later steps.
>>>>>>> origin/main
