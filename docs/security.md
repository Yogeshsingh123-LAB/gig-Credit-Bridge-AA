# CredBridge Security & Privacy Implementation

Security, deterministic verification, and worker privacy are core pillars of the CredBridge monorepo architecture.

---

## Core Security & Privacy Controls

1. **DigiLocker Passwordless Authentication**:
   - Workers authenticate via DigiLocker identity verification.
   - CredBridge never prompts for, stores, or transmits DigiLocker passwords, bank passwords, or OTPs.
2. **Data Minimization & Masking**:
   - Government identifiers (Aadhaar) are strictly masked (`XXXXXXXX1234`).
   - Financial bank account numbers are masked (`•••• 4012`).
3. **Password Security (Institutional)**:
   - Institutional accounts (Lenders, Admins) hash passwords with bcrypt + salt.
   - Plaintext credentials or CVVs are never processed or persisted.
4. **JWT Authorization & Role-Based Access (RBAC)**:
   - All protected API routes enforce signed JSON Web Tokens (JWT) containing subject ID and role (`WORKER`, `LENDER`, `ADMIN`).
5. **Strict Worker Data Isolation**:
   - Workers can access only their own financial reports, accounts, and profile data.
   - Cross-worker queries return `403 Forbidden` or `404 Not Found`.
6. **Single Source of Truth & Mathematical Integrity**:
   - All income reports are validated server-side by `ReportValidator` enforcing strict mathematical invariants ($\text{Total} = \sum \text{Sources} = \sum \text{Months}$, $\text{Average} = \text{Total}/12$).
7. **User Report Privacy**:
   - Raw cryptographic hashes and signature keys are omitted from user-facing reports and browser print views.
   - Authenticity is verified seamlessly via QR code linking to `/verify-report?id=...` and authentic issuer credentials.
8. **Security Audit Trails**:
   - Significant events (authentication, bank account selections, report generations, and PDF downloads) are recorded in immutable audit logs.
   - Secrets, tokens, and raw credentials are never written to log sinks.
