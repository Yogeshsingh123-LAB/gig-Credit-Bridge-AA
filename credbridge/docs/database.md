# CredBridge Database Schema Documentation

CredBridge uses PostgreSQL in production and SQLite for zero-config local testing. All models use UUID primary keys, foreign key constraints, indexes, and created/updated timestamps.

## Database Tables

1. `users`: Stores user identity, normalized email, bcrypt password hash, role (`WORKER`, `LENDER`, `ADMIN`), and active status.
2. `worker_profiles`: Linked 1:1 with `users`. Contains phone, city, occupation, experience_months, profile_completion.
3. `lender_profiles`: Linked 1:1 with `users`. Contains organization_name, designation.
4. `gig_platforms`: Gig platform connections for workers (Uber, Ola, Swiggy, Zomato, Blinkit, Zepto, Amazon, Urban Company) with connection status.
5. `transactions`: Individual cashflow transactions with worker_id, platform_id, transaction_date, transaction_type (`CREDIT`, `DEBIT`), amount (>0), category, source, description, reference_id.
6. `income_verifications`: Snapshot of income verification audit results, declared vs observed monthly income, verified monthly figure, coverage, volatility, confidence score (0-100), and status (`VERIFIED`, `PARTIALLY_VERIFIED`, `INSUFFICIENT_DATA`, `REVIEW_REQUIRED`).
7. `financial_scores`: 0-100 Financial Readiness Score, score band (`EXCELLENT`, `GOOD`, `FAIR`, `POOR`), sub-component breakdown scores, positive factors, and attention areas.
8. `credit_passports`: Versioned Credit Passports containing unique passport_number, income summary, verification summary, financial score, risk indicators, income sources, data quality, and AI explanation.
9. `consents`: Time-bound active consent records permitting lenders to view worker passports. Statuses: `ACTIVE`, `EXPIRED`, `REVOKED`.
10. `audit_logs`: Security and access audit logs for authentication, profile edits, demo generation, verification, scoring, passport creation, and consent grants/revocations.
11. `system_settings`: Key-value configuration settings for the platform.
12. `notifications`: System notifications for users.
