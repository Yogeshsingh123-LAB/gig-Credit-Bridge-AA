import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { AuthLayout } from '../components/layout/AuthLayout';
import { WorkerLayout } from '../components/layout/WorkerLayout';
import { LenderLayout } from '../components/layout/LenderLayout';

import { ProtectedRoute } from './ProtectedRoute';
import { RoleRoute } from './RoleRoute';

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

import { AdminOverviewPage } from '../pages/admin/AdminOverviewPage';
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Landing Route */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
      </Route>

      {/* Auth Public Routes */}
      <Route element={<AuthLayout />}>
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
      </Route>

      {/* Protected Routes & Role Guards */}
      <Route element={<ProtectedRoute />}>
        {/* Worker Portal Guard */}
        <Route element={<RoleRoute allowedRoles={['WORKER']} />}>
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
        </Route>

        {/* Lender Portal Guard */}
        <Route element={<RoleRoute allowedRoles={['LENDER']} />}>
          <Route path="lender" element={<LenderLayout />}>
            <Route index element={<LenderOverviewPage />} />
            <Route path="dashboard" element={<LenderDashboardPage />} />
            <Route path="applicant" element={<LenderApplicantPage />} />
          </Route>
        </Route>

        {/* Admin Portal Guard */}
        <Route element={<RoleRoute allowedRoles={['ADMIN']} />}>
          <Route path="admin" element={<MainLayout />}>
            <Route index element={<AdminOverviewPage />} />
            <Route path="dashboard" element={<AdminDashboardPage />} />
          </Route>
        </Route>
      </Route>

      {/* Fallback to Home */}
      <Route path="*" element={<MainLayout />}>
        <Route path="*" element={<HomePage />} />
      </Route>
    </Routes>
  );
};
