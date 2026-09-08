import axios from 'axios';
import {
  User, WorkerProfile, LenderProfile, GigPlatform, Transaction,
  FinancialAnalyticsSummary, IncomeVerification, FinancialReadinessScore,
  CreditPassport, ConsentRecord, LenderApplicantItem, SimulationResult,
  AuditLog, HealthResponse
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001';

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
  register: async (name: string, email: string, password: string, role: 'WORKER' | 'LENDER') => {
    const res = await apiClient.post('/api/v1/auth/register', { name, email, password, role });
    return res.data;
  },
  getMe: async (): Promise<User> => {
    const res = await apiClient.get<User>('/api/v1/auth/me');
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
  }
};
