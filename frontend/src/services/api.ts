import axios from 'axios';
import {
  User, WorkerProfile, LenderProfile, GigPlatform, Transaction,
  FinancialAnalyticsSummary, IncomeVerification, FinancialReadinessScore,
  CreditPassport, ConsentRecord, LenderApplicantItem, SimulationResult,
  AuditLog, HealthResponse, DigiLockerStatus, AAConsentRecord, BankAccountItem,
  AAPlatformItem, ProcessDataResponse, IncomeReportDetail, IncomeReportPdfPayload,
  FinancialRecommendationItem, ReportShareRecord, DataAccessAuditItem
} from '../types';

let rawBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8001';
if (rawBaseUrl.includes(':8000')) {
  rawBaseUrl = rawBaseUrl.replace(':8000', ':8001');
}
const API_BASE_URL = rawBaseUrl;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Add JWT Authorization header interceptor
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const apiService = {
  // Auth
  login: async (email: string, password: string) => {
    const res = await apiClient.post('/api/v1/auth/login', { email, password });
    return res.data;
  },
  loginWithDigiLocker: async (data?: {
    masked_aadhaar?: string;
    name?: string;
    is_new_user?: boolean;
    phone?: string;
    city?: string;
    occupation?: string;
    experience_months?: number;
  }) => {
    const res = await apiClient.post('/api/v1/auth/digilocker', data || {});
    return res.data;
  },
  register: async (name: string, email: string, password: string, role: 'WORKER' | 'LENDER') => {
    const res = await apiClient.post('/api/v1/auth/register', { name, email, password, role });
    return res.data;
  },
  getMe: async (): Promise<User> => {
    const res = await apiClient.get<User>('/api/v1/auth/me');
    return res.data;
  },
  getDemoUsers: async () => {
    const res = await apiClient.get('/api/v1/auth/demo-users');
    return res.data;
  },

  // Profile
  getProfile: async () => {
    const res = await apiClient.get('/api/v1/profile');
    return res.data;
  },
  updateWorkerProfile: async (data: Partial<WorkerProfile>) => {
    const res = await apiClient.put('/api/v1/profile/worker', data);
    return res.data;
  },
  updateLenderProfile: async (data: Partial<LenderProfile>) => {
    const res = await apiClient.put('/api/v1/profile/lender', data);
    return res.data;
  },

  // Platforms & Demo Data
  getPlatforms: async (): Promise<GigPlatform[]> => {
    const res = await apiClient.get('/api/v1/platforms');
    return res.data;
  },
  connectPlatform: async (platform_name: string, account_identifier: string) => {
    const res = await apiClient.post('/api/v1/platforms/connect', { platform_name, account_identifier });
    return res.data;
  },
  generateDemoData: async (months: number = 6) => {
    const res = await apiClient.post('/api/v1/platforms/generate-demo-data', { months });
    return res.data;
  },

  // Transactions
  getTransactions: async (params?: Record<string, any>) => {
    const res = await apiClient.get('/api/v1/transactions', { params });
    return res.data;
  },

  // Analytics
  getFinancialSummary: async (): Promise<FinancialAnalyticsSummary> => {
    const res = await apiClient.get('/api/v1/analytics/financial-summary');
    return res.data;
  },

  // Verification
  startVerification: async (declared_monthly_income: number = 0): Promise<IncomeVerification> => {
    const res = await apiClient.post('/api/v1/verification/start', { declared_monthly_income });
    return res.data;
  },
  getLatestVerification: async (): Promise<IncomeVerification> => {
    const res = await apiClient.get('/api/v1/verification/latest');
    return res.data;
  },

  // Score
  calculateScore: async (): Promise<FinancialReadinessScore> => {
    const res = await apiClient.post('/api/v1/score/calculate');
    return res.data;
  },
  getLatestScore: async (): Promise<FinancialReadinessScore> => {
    const res = await apiClient.get('/api/v1/score/latest');
    return res.data;
  },

  // Passport
  generatePassport: async (): Promise<CreditPassport> => {
    const res = await apiClient.post('/api/v1/passport/generate');
    return res.data;
  },
  getLatestPassport: async (): Promise<CreditPassport> => {
    const res = await apiClient.get('/api/v1/passport/latest');
    return res.data;
  },

  // Consent
  grantConsent: async (lender_id: string, passport_id?: string, duration_days: number = 30) => {
    const res = await apiClient.post('/api/v1/consent/grant', { lender_id, passport_id, duration_days });
    return res.data;
  },
  revokeConsent: async (consent_id: string) => {
    const res = await apiClient.post('/api/v1/consent/revoke', { consent_id });
    return res.data;
  },
  getMyConsents: async (): Promise<ConsentRecord[]> => {
    const res = await apiClient.get('/api/v1/consent/my-consents');
    return res.data;
  },
  getLendersList: async () => {
    const res = await apiClient.get('/api/v1/consent/lenders-list');
    return res.data;
  },

  // Lender Portal
  getLenderDashboard: async () => {
    const res = await apiClient.get('/api/v1/lenders/dashboard');
    return res.data;
  },
  getLenderApplicants: async (): Promise<LenderApplicantItem[]> => {
    const res = await apiClient.get('/api/v1/lenders/applicants');
    return res.data;
  },
  getLenderApplicantDetail: async (worker_id: string) => {
    const res = await apiClient.get(`/api/v1/lenders/applicant/${worker_id}`);
    return res.data;
  },
  runLenderSimulator: async (data: Record<string, any>): Promise<SimulationResult> => {
    const res = await apiClient.post('/api/v1/lenders/simulator', data);
    return res.data;
  },

  // Admin Portal
  getAdminDashboard: async () => {
    const res = await apiClient.get('/api/v1/admin/dashboard');
    return res.data;
  },
  getAdminUsers: async (role?: string) => {
    const res = await apiClient.get('/api/v1/admin/users', { params: { role } });
    return res.data;
  },
  getAdminAuditLogs: async (): Promise<AuditLog[]> => {
    const res = await apiClient.get('/api/v1/admin/audit-logs');
    return res.data;
  },

  // Health
  checkApiHealth: async (): Promise<HealthResponse> => {
    const res = await apiClient.get<HealthResponse>('/api/v1/health');
    return res.data;
  },

  // DigiLocker Identity Flow
  startDigiLocker: async () => {
    const res = await apiClient.post('/api/v1/digilocker/start');
    return res.data;
  },
  verifyDigiLocker: async (sessionId: string, verifiedName?: string) => {
    const res = await apiClient.post('/api/v1/digilocker/verify', { session_id: sessionId, verified_name: verifiedName });
    return res.data;
  },
  getDigiLockerStatus: async (): Promise<DigiLockerStatus> => {
    const res = await apiClient.get<DigiLockerStatus>('/api/v1/digilocker/status');
    return res.data;
  },
  confirmDigiLocker: async () => {
    const res = await apiClient.post('/api/v1/digilocker/confirm');
    return res.data;
  },

  // Account Aggregator (AA) Consent Flow
  getAAConsents: async (): Promise<AAConsentRecord[]> => {
    const res = await apiClient.get<AAConsentRecord[]>('/api/v1/aa/consents');
    return res.data;
  },
  createAAConsent: async (data: {
    purpose?: string;
    data_types?: string[];
    selected_accounts?: string[];
    selected_sources?: string[];
    start_date?: string;
    end_date?: string;
  }) => {
    const res = await apiClient.post('/api/v1/aa/consents', data);
    return res.data;
  },
  approveAAConsent: async (consentId: string) => {
    const res = await apiClient.post(`/api/v1/aa/consents/${consentId}/approve`);
    return res.data;
  },
  revokeAAConsent: async (consentId: string) => {
    const res = await apiClient.post(`/api/v1/aa/consents/${consentId}/revoke`);
    return res.data;
  },

  // Bank Accounts & Platforms
  getFinancialAccounts: async (): Promise<BankAccountItem[]> => {
    try {
      const res = await apiClient.get<BankAccountItem[]>('/api/v1/financial/accounts');
      return res.data;
    } catch {
      const res = await apiClient.get<BankAccountItem[]>('/api/v1/aa/bank-accounts');
      return res.data;
    }
  },
  getBankAccounts: async (): Promise<BankAccountItem[]> => {
    try {
      const res = await apiClient.get<BankAccountItem[]>('/api/v1/financial/accounts');
      return res.data;
    } catch {
      const res = await apiClient.get<BankAccountItem[]>('/api/v1/aa/bank-accounts');
      return res.data;
    }
  },
  selectBankAccounts: async (selectedAccountIds: string[]) => {
    const res = await apiClient.post('/api/v1/aa/bank-accounts/select', {
      selected_account_ids: selectedAccountIds
    });
    return res.data;
  },
  getAAPlatforms: async (): Promise<AAPlatformItem[]> => {
    const res = await apiClient.get<AAPlatformItem[]>('/api/v1/aa/platforms');
    return res.data;
  },

  // Processing & Reports
  processReportData: async (data: {
    account_ids?: string[];
    platforms?: string[];
    start_date?: string;
    end_date?: string;
  }): Promise<ProcessDataResponse> => {
    const res = await apiClient.post<ProcessDataResponse>('/api/v1/reports/process', data);
    return res.data;
  },
  generateIncomeReport: async (data: {
    consent_id?: string;
    account_ids?: string[];
    platforms?: string[];
    start_date?: string;
    end_date?: string;
  }): Promise<IncomeReportDetail> => {
    const res = await apiClient.post<IncomeReportDetail>('/api/v1/reports/generate', data);
    return res.data;
  },
  getIncomeReports: async (): Promise<IncomeReportDetail[]> => {
    const res = await apiClient.get<IncomeReportDetail[]>('/api/v1/reports');
    return res.data;
  },
  getIncomeReportDetail: async (reportId: string): Promise<IncomeReportDetail> => {
    const res = await apiClient.get<IncomeReportDetail>(`/api/v1/reports/${reportId}`);
    return res.data;
  },
  downloadReportPdf: async (reportId: string) => {
    const res = await apiClient.get(`/api/v1/reports/${reportId}/pdf`, {
      responseType: 'blob',
    });
    const blob = new Blob([res.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `CredBridge_Report_${reportId}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
  getIncomeReportPdfData: async (reportId: string): Promise<IncomeReportPdfPayload> => {
    const res = await apiClient.get<IncomeReportPdfPayload>(`/api/v1/reports/${reportId}/pdf-data`);
    return res.data;
  },
  revokeIncomeReport: async (reportId: string) => {
    const res = await apiClient.post(`/api/v1/reports/${reportId}/revoke`);
    return res.data;
  },
  verifyReportPublic: async (reportId: string, hash?: string) => {
    const res = await apiClient.get(`/api/v1/verification/report/${reportId}`, {
      params: hash ? { hash } : undefined
    });
    return res.data;
  },
  verifyDocumentIntegrity: async (reportId: string, canonicalHash?: string, tamperedTest: boolean = false) => {
    const res = await apiClient.post('/api/v1/verification/verify-document', {
      report_id: reportId,
      canonical_hash: canonicalHash,
      tampered_test: tamperedTest
    });
    return res.data;
  },

  // Financial Recommendations
  getFinancialRecommendations: async (): Promise<FinancialRecommendationItem[]> => {
    const res = await apiClient.get<FinancialRecommendationItem[]>('/api/v1/recommendations');
    return res.data;
  },

  // Report Sharing with Explicit Consent
  shareIncomeReport: async (reportId: string, data: {
    recipient_name: string;
    share_scope?: Record<string, boolean>;
    include_raw_transactions?: boolean;
    duration_days?: number;
  }): Promise<ReportShareRecord> => {
    const res = await apiClient.post<ReportShareRecord>(`/api/v1/reports/${reportId}/share`, data);
    return res.data;
  },
  getReportShares: async (reportId: string): Promise<ReportShareRecord[]> => {
    const res = await apiClient.get<ReportShareRecord[]>(`/api/v1/reports/${reportId}/shares`);
    return res.data;
  },
  revokeReportShare: async (shareId: string) => {
    const res = await apiClient.post(`/api/v1/reports/shares/${shareId}/revoke`);
    return res.data;
  },

  // Data Access & Privacy Audit
  getDataAccessAudit: async (): Promise<DataAccessAuditItem[]> => {
    const res = await apiClient.get<DataAccessAuditItem[]>('/api/v1/audit/data-access');
    return res.data;
  }
};
