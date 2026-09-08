# CredBridge End-to-End Demo Flow

To demonstrate the full CredBridge application, follow this exact workflow:

1. **Worker Registration**:
   - Navigate to `/register`
   - Select "Gig Worker" role
   - Enter name `Ravi Kumar`, email `ravi.worker@example.com`, password `Password123!`

2. **Generate Synthetic Financial Data**:
   - Navigate to `/worker/platforms`
   - Click **"Generate Demo Financial Data"**
   - 6 months of realistic synthetic income (Uber, Zomato, Swiggy) and expense transactions are generated.

3. **Inspect Dashboard & Transactions**:
   - Open `/worker/dashboard`: View total income, monthly averages, Recharts bar charts, platform breakdown.
   - Open `/worker/transactions`: Search, filter by type (CREDIT/DEBIT), category, and pagination.

4. **Run Income Verification**:
   - Open `/worker/verification`
   - Enter declared monthly income ₹30,000 and click **"Run Income Verification"**.
   - Verified status (`VERIFIED` / `PARTIALLY_VERIFIED`), confidence score, and observed vs declared breakdown appear.

5. **Calculate Financial Readiness Score**:
   - Open `/worker/score`
   - Click **"Recalculate Score"**.
   - View 0–100 Readiness Score gauge, score band, 6 sub-component breakdown scores, positive factors, and attention areas.

6. **Generate Credit Passport**:
   - Open `/worker/passport`
   - Click **"Generate New Version"**.
   - Review portable Credit Passport document preview.

7. **Grant Consent to Lender**:
   - Open `/worker/consent`
   - Select a registered Lender organization and click **"Grant Access Consent"**.

8. **Lender Assessment & Simulator**:
   - Logout and sign in as Lender (`priya.lender@example.com` / `Password123!`).
   - Open `/lender/applicants`: Click **"View Evidence & Simulator"** for Ravi Kumar.
   - Inspect verified income, readiness score, risk indicators, and AI explanation.
   - Click **"Launch What-If Simulator"**: Adjust income change %, expense change %, new platform addition, and inspect simulated score delta.

9. **Consent Revocation Enforcement**:
   - Sign back in as Worker `ravi.worker@example.com`.
   - Open `/worker/consent` and click **"Revoke Access Immediately"**.
   - Sign back in as Lender: Access to Ravi Kumar's financial evidence is immediately blocked (403 Forbidden).

10. **Admin Dashboard & Audit Logs**:
    - Sign in as Admin (`admin@credbridge.com` / `Admin@123456`).
    - Open `/admin/dashboard`: Inspect system metrics, verified worker count, system health status.
    - Open `/admin/audit-logs`: Inspect security audit log trail.
