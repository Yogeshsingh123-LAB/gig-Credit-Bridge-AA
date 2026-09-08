import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { WorkerLayout } from '../layouts/WorkerLayout';
import { LenderLayout } from '../layouts/LenderLayout';
import { AdminLayout } from '../layouts/AdminLayout';

import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { VerifyReportPage } from '../pages/VerifyReportPage';

import { WorkerDashboardPage } from '../pages/worker/WorkerDashboardPage';
import { WorkerGenerateReportPage } from '../pages/worker/WorkerGenerateReportPage';
import { WorkerReportsPage } from '../pages/worker/WorkerReportsPage';
import { WorkerReportPreviewPage } from '../pages/worker/WorkerReportPreviewPage';
import { WorkerConsentPage } from '../pages/worker/WorkerConsentPage';
import { WorkerProfilePage } from '../pages/worker/WorkerProfilePage';
import { WorkerSettingsPage } from '../pages/worker/WorkerSettingsPage';

import { LenderDashboardPage } from '../pages/lender/LenderDashboardPage';
import { LenderApplicantsPage } from '../pages/lender/LenderApplicantsPage';
import { LenderApplicantDetailPage } from '../pages/lender/LenderApplicantDetailPage';
import { LenderSimulatorPage } from '../pages/lender/LenderSimulatorPage';

import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';
import { AdminUsersPage } from '../pages/admin/AdminUsersPage';
import { AdminAuditLogsPage } from '../pages/admin/AdminAuditLogsPage';

import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

const ProtectedRoute: React.FC<{ allowedRole: UserRole; children: React.ReactNode }> = ({ allowedRole, children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">Verifying session...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== allowedRole) {
    if (user.role === 'WORKER') return <Navigate to="/worker/dashboard" replace />;
    if (user.role === 'LENDER') return <Navigate to="/lender/dashboard" replace />;
    if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        {/* Public Report Verification Routes */}
        <Route path="verify/report" element={<VerifyReportPage />} />
        <Route path="verify/report/:reportId" element={<VerifyReportPage />} />
        <Route path="lender/verify-report" element={<VerifyReportPage />} />
      </Route>

      {/* Simplified Worker Portal Routes */}
      <Route
        path="/worker"
        element={
          <ProtectedRoute allowedRole="WORKER">
            <WorkerLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<WorkerDashboardPage />} />
        <Route path="generate-report" element={<WorkerGenerateReportPage />} />
        <Route path="reports" element={<WorkerReportsPage />} />
        <Route path="reports/:id" element={<WorkerReportPreviewPage />} />
        <Route path="consent" element={<WorkerConsentPage />} />
        <Route path="profile" element={<WorkerProfilePage />} />
        <Route path="settings" element={<WorkerSettingsPage />} />

        {/* Legacy route aliases redirected seamlessly */}
        <Route path="onboarding" element={<Navigate to="/worker/generate-report" replace />} />
        <Route path="score" element={<Navigate to="/worker/dashboard" replace />} />
        <Route path="passport" element={<Navigate to="/worker/reports" replace />} />
        <Route path="platforms" element={<Navigate to="/worker/dashboard" replace />} />
        <Route path="transactions" element={<Navigate to="/worker/dashboard" replace />} />
        <Route path="data-access" element={<Navigate to="/worker/consent" replace />} />
        <Route path="recommendations" element={<Navigate to="/worker/dashboard" replace />} />
        <Route path="verification" element={<Navigate to="/worker/generate-report" replace />} />
      </Route>

      {/* Lender Portal Routes */}
      <Route
        path="/lender"
        element={
          <ProtectedRoute allowedRole="LENDER">
            <LenderLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<LenderDashboardPage />} />
        <Route path="applicants" element={<LenderApplicantsPage />} />
        <Route path="applicant/:id" element={<LenderApplicantDetailPage />} />
        <Route path="applicant/:id/simulator" element={<LenderSimulatorPage />} />
      </Route>

      {/* Admin Portal Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRole="ADMIN">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="audit-logs" element={<AdminAuditLogsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
