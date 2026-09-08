# CredBridge Frontend

Financial verification infrastructure for the gig economy.

## Stack
- **Framework**: React 18
- **Language**: TypeScript
- **Bundler**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Icons**: Lucide React

## Project Structure

```text
src/
├── assets/
├── components/
│   ├── common/      (EmptyState, LoadingState, ErrorState)
│   ├── layout/      (Navbar, Sidebar, Topbar, Footer, MobileNavigation, MainLayout, AuthLayout, WorkerLayout, LenderLayout)
│   └── ui/          (Button, Input, Card, Badge, Modal, Table, PageHeader)
├── pages/
│   ├── HomePage.tsx
│   ├── auth/        (LoginPage, RegisterPage)
│   ├── worker/      (Overview, Dashboard, Profile, Platforms, Transactions, Verification, Score, Passport)
│   └── lender/      (Overview, Dashboard, Applicant)
├── routes/          (AppRoutes.tsx)
├── services/        (api.ts)
├── types/           (auth.ts, worker.ts, lender.ts, transaction.ts, common.ts)
└── utils/
```

## Development

```bash
npm install
npm run dev
```

## Environment Setup

Copy `.env.example` to `.env`:

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```
