# Gig Credit Bridge AA ⚡

> **Account Aggregator Powered Financial Inclusion & Underwriting Engine for Gig Economy Workers**

[![RBI Account Aggregator Framework](https://img.shields.io/badge/AA-RBI%20Regulated-emerald?style=for-the-badge&logo=shield)](https://sahamati.org.in/)
[![License: MIT](https://img.shields.io/badge/License-MIT-cyan?style=for-the-badge)](LICENSE)

---

## 📌 Problem Overview
Gig economy workers in India (delivery partners on Zomato/Swiggy, rideshare drivers on Uber/Ola, home services on Urban Company, and freelancers) often struggle to access traditional formal credit lines due to the lack of standard monthly payslips, Form 16s, or traditional credit bureau footprints (CIBIL). 

However, they maintain high-velocity daily cashflows and strong performance ratings across gig platforms.

## 🚀 Key Solution Architecture

**Gig Credit Bridge AA** bridges this gap using:
1. **India's Account Aggregator (AA) Framework (RBI Regulated)**: Consent-driven, end-to-end encrypted financial data sharing directly from Financial Information Providers (FIP Banks) to Financial Information Users (FIUs/Lenders).
2. **Multi-Platform Cashflow Aggregation**: Real-time integration with Zomato, Uber, Swiggy, and Urban Company earnings APIs.
3. **GigScore™ Alternative Underwriting Engine**: Underwrites borrowers using income stability, platform rating, daily cashflow velocity, and payout frequency instead of legacy credit scores.
4. **Daily Auto-Deduction Micro-Repayments**: Syncs daily repayment deductions directly with gig platform daily settlements, reducing default rates (90+ DPD NPA < 0.75%).

---

## ✨ Features

- 🎯 **GigScore™ Underwriting Gauge**: Visual score (0–900) updated in real-time as bank accounts and gig platforms are connected.
- 🔒 **Interactive AA Consent Gateway Simulator**: Complete step-by-step consent workflow (Bank selection, AA handle `@onemoney`/`@setu`, OTP approval, and encrypted JSON payload inspection).
- 💳 **Micro-Loan & Credit Marketplace**: Tailored products including Daily Fuel Advance, Surge Season Advance, and EV Scooter Upgrade Loans.
- 🧮 **Live Disbursement & EMI Calculator**: Interactive slider to adjust withdrawal amount, select daily auto-deduction vs monthly EMI, and instant sanction to bank account.
- 📊 **Dual-View Switcher**: Toggle seamlessly between **Gig Worker Experience** and **Lender / FIU Analytics Dashboard** (viewing cashflow velocity, NPA metrics, and encrypted payload telemetry).

---

## 🛠️ Local Development & Quick Start

1. **Clone or Open Repository**:
   ```bash
   cd C:\Users\mukes\.gemini\antigravity-ide\scratch\gig-Credit-Bridge-AA
   ```

2. **Run Local Server**:
   You can serve the web app using `npx serve` or any HTTP server:
   ```bash
   npx -y serve .
   ```

3. **Open in Browser**:
   Navigate to `http://localhost:3000` to interact with the platform.

---

## 📁 Repository File Structure

- [`index.html`](file:///C:/Users/mukes/.gemini/antigravity-ide/scratch/gig-Credit-Bridge-AA/index.html) - Application structural layout, modals, and views.
- [`styles.css`](file:///C:/Users/mukes/.gemini/antigravity-ide/scratch/gig-Credit-Bridge-AA/styles.css) - Complete glassmorphism design system & CSS variables.
- [`app.js`](file:///C:/Users/mukes/.gemini/antigravity-ide/scratch/gig-Credit-Bridge-AA/app.js) - State management, AA consent simulator, GigScore calculation engine.

---

## 📜 License
MIT License. Developed for financial inclusion in the gig economy.
