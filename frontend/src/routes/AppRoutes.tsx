import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { WorkerLayout } from '../layouts/WorkerLayout';
import { LenderLayout } from '../layouts/LenderLayout';
import { AdminLayout } from '../layouts/AdminLayout';

import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';
import { VerifyReportPage } from '../pages/VerifyReportPage';

import { WorkerDashboardPage } from '../pages/worker/WorkerDashboardPage';
import { WorkerGenerateReportPage } from '../pages/worker/WorkerGenerateReportPage';
import { WorkerBankAccountsPage } from '../pages/worker/WorkerBankAccountsPage';
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
import { AdminLendersPage } from '../pages/admin/AdminLendersPage';
import { AdminLenderDetailPage } from '../pages/admin/AdminLenderDetailPage';

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

  const isRoleAllowed = (userRole: UserRole, targetRole: UserRole): boolean => {
    if (targetRole === 'ADMIN') {
      return userRole === 'ADMIN' || userRole === 'PLATFORM_ADMIN';
    }
    if (targetRole === 'LENDER') {
      return userRole === 'LENDER' || userRole === 'LENDER_ADMIN' || userRole === 'LENDER_OFFICER';
    }
    return userRole === targetRole;
  };

  if (!isRoleAllowed(user.role, allowedRole)) {
    if (user.role === 'WORKER') return <Navigate to="/worker/dashboard" replace />;
    if (user.role === 'LENDER' || user.role === 'LENDER_ADMIN' || user.role === 'LENDER_OFFICER') return <Navigate to="/lender/dashboard" replace />;
    if (user.role === 'ADMIN' || user.role === 'PLATFORM_ADMIN') return <Navigate to="/admin/dashboard" replace />;
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
        <Route path="register" element={<Navigate to="/login" replace />} />
        <Route path="signup" element={<Navigate to="/login" replace />} />
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
        <Route path="consent" element={<Navigate to="/worker/bank-accounts" replace />} />
        <Route path="bank-accounts" element={<WorkerBankAccountsPage />} />
        <Route path="generate-report" element={<WorkerGenerateReportPage />} />
        <Route path="reports" element={<WorkerReportsPage />} />
        <Route path="reports/:id" element={<WorkerReportPreviewPage />} />
        <Route path="profile" element={<WorkerProfilePage />} />
        <Route path="settings" element={<WorkerSettingsPage />} />

        {/* Legacy route aliases redirected seamlessly */}
        <Route path="onboarding" element={<Navigate to="/worker/generate-report" replace />} />
        <Route path="score" element={<Navigate to="/worker/dashboard" replace />} />
        <Route path="passport" element={<Navigate to="/worker/reports" replace />} />
        <Route path="platforms" element={<Navigate to="/worker/dashboard" replace />} />
        <Route path="transactions" element={<Navigate to="/worker/dashboard" replace />} />
        <Route path="data-access" element={<Navigate to="/worker/bank-accounts" replace />} />
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
        <Route path="lenders" element={<AdminLendersPage />} />
        <Route path="lenders/:lenderId" element={<AdminLenderDetailPage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="reports" element={<AdminUsersPage />} />
        <Route path="verifications" element={<AdminUsersPage />} />
        <Route path="health" element={<AdminUsersPage />} />
        <Route path="audit-logs" element={<AdminAuditLogsPage />} />
        <Route path="settings" element={<AdminDashboardPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

