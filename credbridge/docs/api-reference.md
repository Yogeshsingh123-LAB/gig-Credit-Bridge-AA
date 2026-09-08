# CredBridge API Reference

FastAPI Swagger Documentation is interactively available at `/docs` and ReDoc at `/redoc`.

## Base URL
`/api/v1`

## API Route Summary

### Authentication (`/api/v1/auth`)
- `POST /register`: Register a new WORKER or LENDER user. (ADMIN registration is strictly blocked).
- `POST /login`: Authenticate email and password; returns JWT bearer access token.
- `GET /me`: Get authenticated user identity and role.

### Profile (`/api/v1/profile`)
- `GET /`: Get current user profile.
- `PUT /worker`: Update worker phone, city, occupation, experience_months.
- `PUT /lender`: Update lender organization_name, designation.

### Gig Platforms & Demo Data (`/api/v1/platforms`)
- `GET /`: List connected gig platforms.
- `POST /connect`: Connect demo gig platform (Uber, Ola, Swiggy, Zomato, etc.).
- `DELETE /{platform_id}`: Disconnect a gig platform.
- `POST /generate-demo-data`: Generates 6-12 months of realistic synthetic income and expense transactions.

### Transactions (`/api/v1/transactions`)
- `GET /`: Filterable, searchable, paginated ledger of worker transactions.
- `POST /`: Add a transaction record (amount > 0, duplicate reference ID check).

### Financial Analytics (`/api/v1/analytics`)
- `GET /financial-summary`: Deterministic cashflow analytics (total income, monthly average, expenses, monthly breakdown, source breakdown, volatility %, trend, data quality score).

### Income Verification (`/api/v1/verification`)
- `POST /start`: Run deterministic income verification audit.
- `GET /latest`: Fetch latest verification audit result.
- `GET /history`: Fetch historical verification audits.

### Financial Readiness Score (`/api/v1/score`)
- `POST /calculate`: Calculate 0–100 Financial Readiness Score.
- `GET /latest`: Fetch latest Financial Readiness Score.

### Credit Passport (`/api/v1/passport`)
- `POST /generate`: Issue new versioned Credit Passport.
- `GET /latest`: Fetch latest active Credit Passport.
- `GET /history`: Fetch passport version history.
- `GET /{passport_id}`: Fetch passport by ID.

### Consent Management (`/api/v1/consent`)
- `POST /grant`: Worker grants time-bound access to a lender.
- `POST /revoke`: Worker revokes lender access immediately.
- `GET /my-consents`: List worker's active and revoked consents.
- `GET /lenders-list`: List registered lenders for worker selection.

### Lender Portal (`/api/v1/lenders`)
- `GET /dashboard`: Lender dashboard metrics.
- `GET /applicants`: List shared applicant passports.
- `GET /applicant/{worker_id}`: View applicant financial evidence (requires active consent).
- `POST /simulator`: Run What-If cashflow simulation.

### Admin Portal (`/api/v1/admin`)
- `GET /dashboard`: System stats and subsystem health.
- `GET /users`: List registered users filtered by role.
- `GET /audit-logs`: Security audit trail logs.
