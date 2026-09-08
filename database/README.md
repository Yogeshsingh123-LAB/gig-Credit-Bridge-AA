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
