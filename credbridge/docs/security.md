# CredBridge Security Implementation

Security and worker privacy are core pillars of CredBridge architecture.

## Security Controls

1. **Authentication & Password Hashing**: Passwords are strictly hashed using bcrypt with salt. Plaintext passwords, bank passwords, platform credentials, or card CVVs are NEVER stored.
2. **JWT Authorization**: Authenticated routes verify signed JWT tokens containing user ID and role (`WORKER`, `LENDER`, `ADMIN`).
3. **Strict Worker Data Isolation**: All database queries involving worker financial data enforce ownership using the authenticated user identity extracted from the JWT token.
4. **Consent-Based Lender Access**: Lenders cannot view worker financial evidence without an ACTIVE, unexpired consent record granted explicitly by the worker. Revoking consent immediately terminates lender access (403 Forbidden).
5. **Admin Access Restrictions**: Admin account creation is restricted to database seeding or CLI scripts. Admin registration is strictly blocked on public APIs.
6. **Security Audit Trails**: Important actions (logins, registrations, profile updates, demo data generation, verification audits, score calculations, passport generation, consent grants/revocations) are logged into the `audit_logs` table. Sensitive secrets, JWT tokens, and passwords are NEVER logged.
