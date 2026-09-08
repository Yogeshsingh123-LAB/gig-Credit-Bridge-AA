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

## Database Module Roadmap (Planned / Future Phases)

The following modules represent planned database entities for future phases. None of these business tables are created in Phase 1 foundation:

1. **Users** `[Planned / Future Phase]`
   - Core authentication identities, roles (Worker, Lender, Admin), hashed credentials, MFA settings.
2. **Worker Profiles** `[Planned / Future Phase]`
   - Worker demographics, gig platform links, primary payment details, consent records.
3. **Lender Profiles** `[Planned / Future Phase]`
   - Financial institution metadata, underwriting preferences, risk criteria.
4. **Gig Platforms** `[Planned / Future Phase]`
   - Linked platforms (Uber, Swiggy, Zomato, DoorDash, Upwork) and OAuth consent tokens.
5. **Transactions** `[Planned / Future Phase]`
   - Ingested bank statements, platform payout receipts, expense classifications.
6. **Income Verifications** `[Planned / Future Phase]`
   - Verification engine audit logs, payout-to-deposit matching metrics, fraud flags.
7. **Financial Readiness Scores** `[Planned / Future Phase]`
   - Computed cash flow stability, debt service coverage ratio (DSCR), volatility scores.
8. **Credit Passports** `[Planned / Future Phase]`
   - Verifiable credit passport certificates, cryptographic hashes, QR validation payloads.
9. **Passport Shares** `[Planned / Future Phase]`
   - Worker-controlled lender access tokens, share expiration timers, view counts.
10. **Audit Logs** `[Planned / Future Phase]`
    - Immutable access logs, consent grant/revoke audit trails, data inspection logs.
