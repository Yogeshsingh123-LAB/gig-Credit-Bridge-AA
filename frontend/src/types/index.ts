export type UserRole = 'WORKER' | 'LENDER' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  worker_profile?: WorkerProfile;
}

export interface WorkerProfile {
  id: string;
  user_id: string;
  name?: string;
  email?: string;
  role?: string;
  phone?: string;
  city?: string;
  occupation?: string;
  experience_months: number;
  profile_completion: number;
  identity_status?: string;
  identity_source?: string;
  masked_aadhaar?: string;
  identity_name?: string;
}

export interface LenderProfile {
  id: string;
  user_id: string;
  name: string;
  email: string;
  role: string;
  organization_name?: string;
  designation?: string;
}

export interface GigPlatform {
  id: string;
  platform_name: string;
  account_identifier: string;
  connection_status: 'CONNECTED' | 'DISCONNECTED' | 'PENDING';
  connected_at: string;
}

export interface Transaction {
  id: string;
  platform_id?: string;
  transaction_date: string;
  transaction_type: 'CREDIT' | 'DEBIT';
  amount: number;
  category: string;
  source: string;
  description?: string;
  reference_id: string;
  created_at: string;
}

export interface MonthlyAnalysis {
  month: string;
  income: number;
  expenses: number;
  net_income: number;
  transaction_count: number;
  sources: string[];
}

export interface SourceAnalysis {
  source: string;
  total_income: number;
  percentage_of_income: number;
  transaction_count: number;
}

export interface FinancialAnalyticsSummary {
  income: {
    total_income: number;
    average_monthly_income: number;
    median_monthly_income: number;
    minimum_monthly_income: number;
    maximum_monthly_income: number;
    income_months: number;
    active_income_sources: number;
  };
  expenses: {
    total_expenses: number;
    average_monthly_expenses: number;
    median_monthly_expenses: number;
  };
  monthly_analysis: MonthlyAnalysis[];
  source_analysis: SourceAnalysis[];
  volatility: {
    coefficient_of_variation?: number;
    volatility_percentage?: number;
    classification: 'LOW' | 'MODERATE' | 'HIGH' | 'INSUFFICIENT_DATA';
  };
  trend: {
    direction: 'INCREASING' | 'STABLE' | 'DECREASING' | 'INSUFFICIENT_DATA';
    percentage_change?: number;
    confidence: number;
  };
  data_quality: {
    total_transactions: number;
    valid_transactions: number;
    quality_score: number;
    warnings: string[];
  };
}

export interface IncomeVerification {
  id: string;
  worker_id: string;
  declared_monthly_income: number;
  observed_average_monthly_income: number;
  verified_monthly_income: number;
  total_income_observed: number;
  months_analyzed: number;
  income_sources_count: number;
  income_coverage_percentage: number;
  volatility_percentage: number;
  confidence_score: number;
  verification_status: 'VERIFIED' | 'PARTIALLY_VERIFIED' | 'INSUFFICIENT_DATA' | 'REVIEW_REQUIRED';
  verification_summary: string;
  created_at: string;
}

export interface FinancialReadinessScore {
  id: string;
  worker_id: string;
  overall_score: number;
  score_band: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
  positive_factors: string[];
  attention_areas: string[];
  calculation_summary: string;
  component_scores: Record<string, number>;
  created_at: string;
}

export interface CreditPassport {
  id: string;
  passport_number: string;
  version: string;
  generated_at: string;
  expires_at?: string;
  income_summary: any;
  verification_summary: any;
  financial_score: any;
  risk_indicators: string[];
  income_sources: any[];
  data_quality: any;
  explanation?: string;
  status: 'ACTIVE' | 'EXPIRED' | 'REVOKED';
}

export interface ConsentRecord {
  id: string;
  lender_id: string;
  lender_organization?: string;
  lender_name?: string;
  passport_id: string;
  granted_at: string;
  expires_at?: string;
  revoked_at?: string;
  status: 'ACTIVE' | 'EXPIRED' | 'REVOKED';
}

export interface LenderApplicantItem {
  consent_id: string;
  worker_id: string;
  worker_name: string;
  city?: string;
  occupation?: string;
  granted_at: string;
  passport_number: string;
  readiness_score: number;
  score_band: string;
  verification_status: string;
}

export interface SimulationResult {
  worker_id: string;
  scenario: any;
  original_monthly_income: number;
  simulated_monthly_income: number;
  income_delta: number;
  original_monthly_expenses: number;
  simulated_monthly_expenses: number;
  expense_delta: number;
  simulated_net_monthly_income: number;
  original_readiness_score: number;
  simulated_readiness_score: number;
  score_delta: number;
  simulated_score_band: string;
  simulated_verification_status: string;
  disclaimer: string;
}

export interface AuditLog {
  id: string;
  user_id?: string;
  action: string;
  entity_type?: string;
  entity_id?: string;
  details?: any;
  ip_address?: string;
  created_at: string;
}

export interface HealthResponse {
  status: string;
  app: string;
  version: string;
}

export interface DigiLockerStatus {
  identity_status: 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'FAILED';
  verification_source: string;
  masked_aadhaar: string;
  verified_name: string;
  verified_at?: string;
}

export interface AAConsentRecord {
  id: string;
  consent_handle: string;
  purpose: string;
  data_types: string[];
  selected_accounts: string[];
  selected_sources: string[];
  start_date?: string;
  end_date?: string;
  consent_status: 'REQUESTED' | 'ACTIVE' | 'USED' | 'EXPIRED' | 'REVOKED' | 'FAILED';
  provider: string;
  granted_at: string;
  expires_at?: string;
  revoked_at?: string;
}

export interface BankAccountItem {
  id: string;
  bank_name: string;
  account_mask: string;
  account_type: string;
  fip_id: string;
  fip_name?: string;
  balance_indicative: number;
  currency: string;
  is_selected: boolean;
}

export interface AAPlatformItem {
  name: string;
  detected: boolean;
  category: string;
  description: string;
}

export interface ClassifiedTransactionItem {
  transaction_id: string;
  date: string;
  amount: number;
  source: string;
  description: string;
  matched_platform?: string;
  classification: string;
  confidence: number;
  reason: string;
  included_in_report: boolean;
}

export interface ProcessDataResponse {
  start_date: string;
  end_date: string;
  total_gig_income: number;
  average_monthly_gig_income: number;
  months_analyzed: number;
  monthly_breakdown: Array<{ month: string; amount: number }>;
  platform_breakdown: Array<{ platform: string; amount: number; percentage: number }>;
  verification_confidence: number;
  data_quality: {
    total_transactions: number;
    matching_transactions: number;
    excluded_transactions: number;
    unknown_transactions: number;
    excluded_breakdown: Record<string, number>;
    quality_score: number;
  };
  sample_classifications: ClassifiedTransactionItem[];
  all_classifications_count: number;
}

export interface IncomeReportDetail {
  id: string;
  report_id?: string;
  report_number: string;
  worker_name: string;
  analysis_start_date: string;
  analysis_end_date: string;
  analysis_period?: string;
  verified_average_monthly_gig_income: number;
  total_verified_gig_income: number;
  months_analyzed?: number;
  income_trend?: string;
  income_consistency?: string;
  monthly_breakdown: Array<{ month: string; amount: number }>;
  platform_breakdown: Array<{ platform: string; amount: number; percentage: number }>;
  verification_confidence: number;
  accounts_analyzed: string[];
  platforms_selected: string[];
  data_quality: {
    total_transactions: number;
    matching_transactions: number;
    excluded_transactions: number;
    unknown_transactions: number;
    excluded_breakdown?: Record<string, number>;
    quality_score: number;
  };
  methodology: string;
  generated_at: string;
  issued_at?: string;
  expires_at?: string;
  canonical_hash?: string;
  signature?: string;
  calculation_version: string;
  data_source: string;
  status: string;
  report_status?: string;
}

export interface IncomeReportPdfPayload {
  title: string;
  report_number: string;
  worker_name: string;
  masked_aadhaar: string;
  analysis_period: string;
  verified_average_monthly_gig_income: string;
  total_verified_gig_income: string;
  verification_confidence: string;
  accounts_analyzed: string[];
  platforms_selected: string[];
  monthly_breakdown: Array<{ month: string; amount: number }>;
  platform_breakdown: Array<{ platform: string; amount: number; percentage: number }>;
  data_quality: any;
  methodology: string;
  disclaimer: string;
  generated_at: string;
}

export interface FinancialRecommendationItem {
  id: string;
  title: string;
  category: string;
  indicative_range: string;
  fit_reasons: string[];
  disclaimer: string;
  eligible_for_exploration: boolean;
}

export interface ReportShareRecord {
  id: string;
  recipient_name: string;
  share_scope: Record<string, boolean>;
  include_raw_transactions: boolean;
  status: 'ACTIVE' | 'REVOKED' | 'EXPIRED';
  granted_at: string;
  expires_at?: string;
  revoked_at?: string;
}

export interface DataAccessAuditItem {
  id: string;
  timestamp: string;
  action: string;
  description: string;
  details: any;
  status: string;
}
