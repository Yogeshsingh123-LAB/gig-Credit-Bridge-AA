import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { AuthLayout } from '../components/layout/AuthLayout';
import { WorkerLayout } from '../components/layout/WorkerLayout';
import { LenderLayout } from '../components/layout/LenderLayout';

import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';

import { WorkerOverviewPage } from '../pages/worker/WorkerOverviewPage';
import { WorkerDashboardPage } from '../pages/worker/WorkerDashboardPage';
import { WorkerProfilePage } from '../pages/worker/WorkerProfilePage';
import { WorkerPlatformsPage } from '../pages/worker/WorkerPlatformsPage';
import { WorkerTransactionsPage } from '../pages/worker/WorkerTransactionsPage';
import { WorkerVerificationPage } from '../pages/worker/WorkerVerificationPage';
import { WorkerScorePage } from '../pages/worker/WorkerScorePage';
import { WorkerPassportPage } from '../pages/worker/WorkerPassportPage';

import { LenderOverviewPage } from '../pages/lender/LenderOverviewPage';
import { LenderDashboardPage } from '../pages/lender/LenderDashboardPage';
import { LenderApplicantPage } from '../pages/lender/LenderApplicantPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Main Landing Route */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
      </Route>

      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
      </Route>

      {/* Worker Portal Routes */}
      <Route path="worker" element={<WorkerLayout />}>
        <Route index element={<WorkerOverviewPage />} />
        <Route path="dashboard" element={<WorkerDashboardPage />} />
        <Route path="profile" element={<WorkerProfilePage />} />
        <Route path="platforms" element={<WorkerPlatformsPage />} />
        <Route path="transactions" element={<WorkerTransactionsPage />} />
        <Route path="verification" element={<WorkerVerificationPage />} />
        <Route path="score" element={<WorkerScorePage />} />
        <Route path="passport" element={<WorkerPassportPage />} />
      </Route>

      {/* Lender Portal Routes */}
      <Route path="lender" element={<LenderLayout />}>
        <Route index element={<LenderOverviewPage />} />
        <Route path="dashboard" element={<LenderDashboardPage />} />
        <Route path="applicant" element={<LenderApplicantPage />} />
      </Route>

      {/* Fallback to Home */}
      <Route path="*" element={<MainLayout />}>
        <Route path="*" element={<HomePage />} />
      </Route>
    </Routes>
  );
};
