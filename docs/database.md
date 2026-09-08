# CredBridge Database Schema Documentation

CredBridge uses PostgreSQL in production and local SQLite for zero-config fallback. All models use primary keys, foreign key constraints, indexes, and created/updated timestamps.

---

## Database Tables

1. **`users`**: Stores user identity, normalized email, bcrypt password hash, role (`WORKER`, `LENDER`, `ADMIN`), identity provider (`DIGILOCKER`, `LOCAL`), and active status.
2. **`worker_profiles`**: Linked 1:1 with `users`. Contains full name, phone number, city, occupation, masked Aadhaar, and masked PAN.
3. **`lender_profiles`**: Linked 1:1 with `users`. Contains organization name and designation.
4. **`financial_accounts`**: Connected bank accounts for gig income aggregation (bank name, account number, masked account number, account type, primary flag).
5. **`income_reports`**: Standardized Verified Gig Income Reports with report ID (`CBR-2026-XXXXXXXX`), analysis period (fixed 12 months), total verified income, monthly breakdown, verified income sources, consistency score, canonical hash, and digital signature.
6. **`aa_consents`**: Account Aggregator consent records tracking account authorization handles and status (`ACTIVE`, `REVOKED`, `EXPIRED`).
7. **`gig_platforms`**: Gig platform connections for workers (Uber, Swiggy, Zomato, Urban Company, Blinkit, Zepto) with connection status.
8. **`transactions`**: Individual cashflow transactions with worker ID, platform ID, transaction date, type (`CREDIT`, `DEBIT`), category, source, and description.
9. **`income_verifications`**: Historical income verification audits, declared vs observed monthly income, and confidence scores.
10. **`financial_scores`**: 0–100 Financial Readiness Scores, score bands, sub-component breakdowns, positive factors, and attention areas.
11. **`credit_passports`**: Versioned Credit Passports snapshotting income summaries, financial scores, and AI explanations.
12. **`consents` / `report_shares`**: Time-bound consent records permitting lenders to view worker reports. Statuses: `ACTIVE`, `EXPIRED`, `REVOKED`.
13. **`audit_logs`**: Immutable security and access audit logs for authentication, bank account selections, report generations, and PDF downloads.
14. **`system_settings`**: Key-value configuration settings for the platform.
15. **`notifications`**: System notifications for workers and lenders.
