import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';
import { WorkerOverviewPage } from '../pages/worker/WorkerOverviewPage';
import { WorkerDashboardPage } from '../pages/worker/WorkerDashboardPage';
import { WorkerPassportPage } from '../pages/worker/WorkerPassportPage';
import { LenderOverviewPage } from '../pages/lender/LenderOverviewPage';
import { LenderDashboardPage } from '../pages/lender/LenderDashboardPage';
import { LenderApplicantPage } from '../pages/lender/LenderApplicantPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="worker" element={<WorkerOverviewPage />} />
        <Route path="worker/dashboard" element={<WorkerDashboardPage />} />
        <Route path="worker/passport" element={<WorkerPassportPage />} />
        <Route path="lender" element={<LenderOverviewPage />} />
        <Route path="lender/dashboard" element={<LenderDashboardPage />} />
        <Route path="lender/applicant" element={<LenderApplicantPage />} />
        <Route path="*" element={<HomePage />} />
      </Route>
    </Routes>
  );
};
