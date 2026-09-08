# CredBridge End-to-End Demo Flow

This guide walks through the current end-to-end CredBridge workflow covering DigiLocker authentication, bank account selection, 12-month income analysis, standardized report generation, and PDF verification.

---

## 1. Worker Authentication via DigiLocker Demo Mode
1. Open the frontend application at `http://localhost:5173/login`.
2. Notice the **DigiLocker DEMO MODE** identity selector.
3. Select any of the **10 pre-loaded synthetic gig worker identities** (e.g., `01. Aarav Sharma — Zomato Delivery Partner (Bengaluru)` or `02. Rajesh Patel — Uber Driver (Mumbai)`).
4. Click **"Verify & Continue with DigiLocker"**.
5. The system performs a passwordless authentication handshake, generates a secure JWT token, and redirects directly to `/worker/dashboard`.

---

## 2. Worker Portal Navigation & Overview
1. Inspect the simplified worker navigation sidebar:
   - **Dashboard** (`/worker/dashboard`)
   - **Generate Report** (`/worker/bank-accounts`)
   - **Reports** (`/worker/reports`)
   - **Profile** (`/worker/profile`)
   - **Settings** (`/worker/settings`)
   - **Logout**
2. On `/worker/dashboard`, observe:
   - Verified Identity Card (Aadhaar masked, verification status, city, occupation)
   - Monthly Income Trend chart (Recharts)
   - Latest Verified Report card with authoritative IST timestamp (`DD MMM YYYY • HH:MM AM/PM IST`)
   - Quick navigation cards.

---

## 3. Bank Account Selection & Report Generation Flow
1. Click **"Generate Report"** in the sidebar (or navigate to `/worker/bank-accounts`).
2. Notice the prominent **"Choose All Banks"** master toggle at the top of the account list.
3. Toggle **"Choose All Banks"** to select/deselect all accounts at once, or choose individual accounts (e.g., HDFC Bank, ICICI Bank).
4. Click **"Analyze Income & Generate Report"**.
5. CredBridge executes the automated 4-step pipeline:
   - Retrieves authorized financial data across selected bank accounts
   - Filters and classifies gig platform credits (Zomato, Swiggy, Uber, Urban Company) while excluding personal UPI transfers and operating expenses
   - Reconciles fixed 12 calendar months of cashflow data deterministically
   - Validates mathematical formulas ($\sum \text{Sources} = \text{Total}$, $\sum 12 \text{ Months} = \text{Total}$, $\text{Average} = \text{Total}/12$) via `ReportValidator`
   - Issues a standardized **Verified Gig Income Report** (`CBR-2026-XXXXXXXX`).

---

## 4. Report Inspection & PDF Download
1. On `/worker/reports`, view the newly generated report in the report registry:
   - **Report ID**: e.g., `CBR-2026-FEC2-MNZF-8MK8`
   - **Report Type**: Standardized Verified Gig Income Report
   - **Analysis Period**: Fixed 12 Months
   - **Generated Timestamp**: Formatted in IST (e.g., `09 Sep 2026 • 04:05 PM IST`)
   - **Consistency Score**: 0–100 rating
   - **Status**: `ACTIVE`
2. Click **"Download PDF"** to retrieve the verified ReportLab PDF document:
   - **Exact Title**: `VERIFIED GIG INCOME REPORT`
   - **Currency Standard**: Formatted in Indian Rupee notation (`₹`, Lakhs, e.g. `₹2,57,100`)
   - **Verified Income Sources Table**: Itemized platform breakdown and reconciled total
   - **12-Month Observed Breakdown Table**: Complete 12 calendar month breakdown and reconciled total
   - **Report Authenticity**: QR code linking to verification portal, Report ID, and `Digitally Verifiable` status
   - **NumberedCanvas Footer**: Two-pass running footer `CredBridge | Verified Gig Income Report • Report ID: CBR-2026-XXXXXXXX • Page X of Y`
   - **Privacy Protection**: Omission of raw technical SHA-256 and HMAC key strings from user-facing document.
3. Click on the report row to view the in-browser preview at `/worker/reports/:id`.

---

## 5. Institutional & Lender Workflow
1. Logout of the worker account and open `http://localhost:5173/login`.
2. Click **"Lender / Institutional Access →"** at the bottom of the card.
3. Click **"Use Demo Lender"** (fills `priya.lender@example.com` / `Password123!`) and click **"Sign in as Institution"**.
4. Navigate to `/lender/applicants`:
   - Inspect verified applicants, observed gig earnings, consistency scores, and cashflow stability.
5. Open `/lender/simulator`:
   - Run What-If stress tests adjusting income change percentage, expense growth, and platform shifts deterministically.

---

## 6. System Administration & Audit Trails
1. Return to institutional login and click **"Use Demo Admin"** (`admin@credbridge.internal` / `AdminPassword123!`).
2. Navigate to `/admin/dashboard`:
   - Inspect global active workers, verified income volume, and system health status.
3. Navigate to `/admin/audit-logs`:
   - Review immutable audit log records tracking report generation, identity verifications, and data access events.
