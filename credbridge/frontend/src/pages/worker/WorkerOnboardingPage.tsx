import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck, CheckCircle2, Lock, ArrowRight, ArrowLeft,
  Building2, Layers, Calendar, RefreshCw, AlertCircle,
  FileCheck, User, Info, Smartphone, Eye, Sparkles
} from 'lucide-react';
import { apiService } from '../../services/api';
import { BankAccountItem, AAPlatformItem } from '../../types';

type Step = 
  | 'IDENTITY' 
  | 'CONFIRM_INFO' 
  | 'CONSENT_CENTER' 
  | 'AA_CONSENT' 
  | 'SELECT_ACCOUNTS' 
  | 'SELECT_PLATFORMS' 
  | 'SELECT_PERIOD' 
  | 'ANALYZING';

export const WorkerOnboardingPage: React.FC = () => {
  const navigate = useNavigate();

  // Wizard state
  const [currentStep, setCurrentStep] = useState<Step>('IDENTITY');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1: DigiLocker State
  const [digiLockerSession, setDigiLockerSession] = useState<string | null>(null);
  const [digiLockerVerified, setDigiLockerVerified] = useState<boolean>(false);
  const [verifiedName, setVerifiedName] = useState<string>('Ravi Kumar Sharma');
  const [maskedAadhaar, setMaskedAadhaar] = useState<string>('XXXXXXXX4821');

  // Step 5: Bank Accounts State
  const [accounts, setAccounts] = useState<BankAccountItem[]>([]);
  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([]);

  // Step 6: Gig Platforms State
  const [platforms, setPlatforms] = useState<AAPlatformItem[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['Uber', 'Zomato']);

  // Step 7: Time Period State
  const [periodPreset, setPeriodPreset] = useState<'3M' | '6M' | '12M' | 'CUSTOM'>('6M');
  const [startDate, setStartDate] = useState<string>(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 6);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState<string>(() => new Date().toISOString().split('T')[0]);

  // Step 8: Processing Checklist State
  const [processingStage, setProcessingStage] = useState<number>(0);

  // Initialize data on mount
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      // Check existing identity status
      const idStatus = await apiService.getDigiLockerStatus();
      if (idStatus.identity_status === 'VERIFIED') {
        setDigiLockerVerified(true);
        if (idStatus.verified_name) setVerifiedName(idStatus.verified_name);
        if (idStatus.masked_aadhaar) setMaskedAadhaar(idStatus.masked_aadhaar);
      }

      // Load bank accounts
      const accList = await apiService.getBankAccounts();
      setAccounts(accList);
      setSelectedAccountIds(accList.filter(a => a.is_selected).map(a => a.id));

      // Load available platforms
      const platList = await apiService.getAAPlatforms();
      setPlatforms(platList);
    } catch (err: any) {
      console.warn('Initial onboarding sync error:', err);
    }
  };

  // Step 1: Trigger DigiLocker Verification
  const handleStartDigiLocker = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const sess = await apiService.startDigiLocker();
      setDigiLockerSession(sess.session_id);
      // Simulate sandbox verification response
      const verified = await apiService.verifyDigiLocker(sess.session_id, verifiedName);
      setDigiLockerVerified(true);
      setVerifiedName(verified.verified_name || verifiedName);
      setMaskedAadhaar(verified.masked_id || maskedAadhaar);
      setCurrentStep('CONFIRM_INFO');
    } catch (err: any) {
      setError('Identity verification could not be completed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Confirm Information
  const handleConfirmInfo = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await apiService.confirmDigiLocker();
      setCurrentStep('CONSENT_CENTER');
    } catch (err: any) {
      setError('Error confirming worker information.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 4: Approve AA Consent
  const handleApproveAAConsent = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await apiService.createAAConsent({
        purpose: 'Generate Verified Gig Income Report',
        data_types: ['TRANSACTIONS', 'PROFILE'],
        selected_accounts: selectedAccountIds,
        selected_sources: selectedPlatforms,
        start_date: startDate,
        end_date: endDate
      });
      setCurrentStep('SELECT_ACCOUNTS');
    } catch (err: any) {
      setError("We couldn't connect to your financial-data provider. Your consent has not been completed.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 5: Save Bank Selection
  const handleSaveAccounts = async () => {
    if (selectedAccountIds.length === 0) {
      setError('Please select at least one bank account to continue.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await apiService.selectBankAccounts(selectedAccountIds);
      setCurrentStep('SELECT_PLATFORMS');
    } catch (err: any) {
      setError('Failed to update bank account selection.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 6: Save Platforms Selection
  const handleSavePlatforms = () => {
    if (selectedPlatforms.length === 0) {
      setError('Please select at least one gig platform to analyze.');
      return;
    }
    setError(null);
    setCurrentStep('SELECT_PERIOD');
  };

  // Step 7: Preset change handler
  const handlePeriodChange = (preset: '3M' | '6M' | '12M' | 'CUSTOM') => {
    setPeriodPreset(preset);
    const end = new Date();
    const start = new Date();
    if (preset === '3M') {
      start.setMonth(start.getMonth() - 3);
      setStartDate(start.toISOString().split('T')[0]);
      setEndDate(end.toISOString().split('T')[0]);
    } else if (preset === '6M') {
      start.setMonth(start.getMonth() - 6);
      setStartDate(start.toISOString().split('T')[0]);
      setEndDate(end.toISOString().split('T')[0]);
    } else if (preset === '12M') {
      start.setMonth(start.getMonth() - 12);
      setStartDate(start.toISOString().split('T')[0]);
      setEndDate(end.toISOString().split('T')[0]);
    }
  };

  // Step 8: Trigger Processing Pipeline
  const handleStartAnalysis = async () => {
    setCurrentStep('ANALYZING');
    setError(null);
    setProcessingStage(1);

    try {
      // Step-by-step progress animation
      await new Promise(r => setTimeout(r, 600));
      setProcessingStage(2);
      await new Promise(r => setTimeout(r, 600));
      setProcessingStage(3);
      await new Promise(r => setTimeout(r, 600));
      setProcessingStage(4);
      await new Promise(r => setTimeout(r, 600));
      setProcessingStage(5);
      await new Promise(r => setTimeout(r, 600));
      setProcessingStage(6);

      // Call backend report generator
      const report = await apiService.generateIncomeReport({
        account_ids: selectedAccountIds,
        platforms: selectedPlatforms,
        start_date: startDate,
        end_date: endDate
      });

      setProcessingStage(7);
      await new Promise(r => setTimeout(r, 500));

      // Navigate to Report Preview
      navigate(`/worker/reports/${report.id}`);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Analysis could not be completed. Please try again.');
      setCurrentStep('SELECT_PERIOD');
    }
  };

  // Left-hand steps for wizard layout
  const stepsMeta = [
    { key: 'IDENTITY', label: 'Identity Verification' },
    { key: 'CONFIRM_INFO', label: 'Confirm Information' },
    { key: 'CONSENT_CENTER', label: 'Privacy & Permissions' },
    { key: 'AA_CONSENT', label: 'Account Aggregator' },
    { key: 'SELECT_ACCOUNTS', label: 'Bank Accounts' },
    { key: 'SELECT_PLATFORMS', label: 'Gig Platforms' },
    { key: 'SELECT_PERIOD', label: 'Analysis Period' },
    { key: 'ANALYZING', label: 'Generating Report' }
  ];

  const currentStepIdx = stepsMeta.findIndex(s => s.key === currentStep);

  return (
    <div className="max-w-5xl mx-auto py-4 px-2 sm:px-4">
      {/* Header / Banner */}
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Consent-Driven Financial Verification</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Worker Onboarding & Verification</h1>
          <p className="text-sm text-slate-400 mt-1">Turn your gig income into trusted financial evidence under your complete control.</p>
        </div>
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
          <span>Sandbox / Demo Mode</span>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Container with Left Stepper (VS Code / Fintech Wizard Style) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side Stepper */}
        <div className="lg:col-span-4 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 sticky top-20">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">Verification Flow</p>
          <div className="space-y-3">
            {stepsMeta.map((s, idx) => {
              const isPast = idx < currentStepIdx;
              const isCurrent = idx === currentStepIdx;
              return (
                <div key={s.key} className="flex items-center space-x-3">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isPast ? 'bg-emerald-500 text-slate-950' :
                    isCurrent ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500 ring-2 ring-emerald-500/20' :
                    'bg-slate-800 text-slate-500'
                  }`}>
                    {isPast ? <CheckCircle2 className="w-4 h-4 stroke-[3]" /> : idx + 1}
                  </div>
                  <span className={`text-xs sm:text-sm font-medium ${
                    isCurrent ? 'text-emerald-400 font-semibold' :
                    isPast ? 'text-slate-300' : 'text-slate-500'
                  }`}>
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-8 pt-4 border-t border-slate-800">
            <div className="flex items-center space-x-2 text-xs text-slate-400">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>End-to-End Privacy Enforced</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">We never store passwords, UPI PINs, or ATM PINs.</p>
          </div>
        </div>

        {/* Right Side Content Panel */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8">
          
          {/* STEP 1: DIGILOCKER IDENTITY VERIFICATION */}
          {currentStep === 'IDENTITY' && (
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">DigiLocker Identity Verification</h2>
                  <p className="text-xs text-slate-400">Verify your government-issued identity via DigiLocker Sandbox</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 mb-6 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Verification Source:</span>
                  <span className="font-semibold text-white">DigiLocker API</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Document Type:</span>
                  <span className="font-semibold text-white">Aadhaar / National Identity</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Privacy Scope:</span>
                  <span className="text-emerald-400 font-semibold">Name & Masked ID only</span>
                </div>
              </div>

              <div className="mb-6 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300 leading-relaxed">
                <p className="font-semibold mb-1">Sandbox Notice:</p>
                This environment runs in Hackathon Sandbox mode. Clicking below will connect to the Mock DigiLocker Provider to simulate instant verification without exposing real Aadhaar numbers.
              </div>

              <button
                onClick={handleStartDigiLocker}
                disabled={isLoading}
                className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-all shadow-lg shadow-emerald-500/10 disabled:opacity-50"
              >
                {isLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : (
                  <>
                    <span>Verify with DigiLocker (Demo)</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}

          {/* STEP 2: WORKER INFORMATION CONFIRMATION */}
          {currentStep === 'CONFIRM_INFO' && (
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Verify Your Information</h2>
                  <p className="text-xs text-slate-400">Please review the details received from DigiLocker</p>
                </div>
              </div>

              <div className="divide-y divide-slate-800 border border-slate-800 rounded-xl bg-slate-950 p-4 mb-6">
                <div className="py-3 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Verified Name</span>
                  <span className="text-sm font-bold text-white">{verifiedName}</span>
                </div>
                <div className="py-3 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Identity Status</span>
                  <span className="inline-flex items-center space-x-1 text-xs font-semibold text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Verified</span>
                  </span>
                </div>
                <div className="py-3 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Verification Source</span>
                  <span className="text-xs font-semibold text-slate-200">DigiLocker</span>
                </div>
                <div className="py-3 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Masked Identity ID</span>
                  <span className="text-xs font-mono text-slate-300">{maskedAadhaar}</span>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setCurrentStep('IDENTITY')}
                  className="px-4 py-2.5 rounded-xl border border-slate-800 hover:bg-slate-800 text-slate-400 text-sm font-medium transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleConfirmInfo}
                  disabled={isLoading}
                  className="flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-all disabled:opacity-50"
                >
                  {isLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : (
                    <>
                      <span>Confirm & Continue</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: CONSENT & PRIVACY CENTER */}
          {currentStep === 'CONSENT_CENTER' && (
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Your Data. Your Control.</h2>
                  <p className="text-xs text-slate-400">Before we continue, choose what CredBridge can access and analyze.</p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                {/* Card 1: Identity */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-sm text-white flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Identity Information</span>
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400">Required</span>
                  </div>
                  <p className="text-xs text-slate-400 mb-2">Used strictly to verify worker identity and associate your report.</p>
                  <p className="text-[11px] text-slate-500">We access: Full Name, Masked ID. We never access raw biometric data.</p>
                </div>

                {/* Card 2: Bank Transactions */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-sm text-white flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Bank Transaction Information</span>
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400">Required</span>
                  </div>
                  <p className="text-xs text-slate-400 mb-2">Used for deterministic income verification and calculation of consistency and volatility.</p>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                    <p className="font-medium text-slate-300">We process: Date, Amount, Description, Reference.</p>
                    <p className="text-rose-400 font-medium">We NEVER ask for: Bank password, UPI PIN, ATM PIN, or Card PIN.</p>
                  </div>
                </div>

                {/* Card 3: Gig Income */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-sm text-white flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Gig Income Information</span>
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400">Required</span>
                  </div>
                  <p className="text-xs text-slate-400">Used to filter and match selected platforms (Uber, Zomato, etc.) to generate your gig income statement.</p>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setCurrentStep('CONFIRM_INFO')}
                  className="px-4 py-2.5 rounded-xl border border-slate-800 hover:bg-slate-800 text-slate-400 text-sm font-medium transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => setCurrentStep('AA_CONSENT')}
                  className="flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-all shadow-lg shadow-emerald-500/10"
                >
                  <span>Continue to Consent</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: AA CONSENT REVIEW & APPROVAL */}
          {currentStep === 'AA_CONSENT' && (
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Review Permission Artifact</h2>
                  <p className="text-xs text-slate-400">Authorized Financial Data Request via Account Aggregator Framework</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 mb-6">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Purpose</span>
                  <span className="font-semibold text-white">Generate Verified Gig Income Report</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Financial Data</span>
                  <span className="text-emerald-400 font-semibold">✓ Bank transactions (read-only)</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Available Accounts</span>
                  <span className="font-semibold text-slate-200">HDFC Bank, State Bank of India</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Data Purpose</span>
                  <span className="font-semibold text-slate-200">Income verification only</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Consent Framework</span>
                  <span className="font-semibold text-slate-300">Sahamati AA Standard v1.0</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 mb-6">
                Opening this page does not grant consent. You must explicitly click <strong>Allow & Continue</strong> to authorize data retrieval.
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setCurrentStep('CONSENT_CENTER')}
                  className="px-4 py-2.5 rounded-xl border border-slate-800 hover:bg-slate-800 text-slate-400 text-sm font-medium transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleApproveAAConsent}
                  disabled={isLoading}
                  className="flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-all shadow-lg shadow-emerald-500/10 disabled:opacity-50"
                >
                  {isLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : (
                    <>
                      <span>Allow & Continue</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: SELECT LINKED BANK ACCOUNTS */}
          {currentStep === 'SELECT_ACCOUNTS' && (
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Select Bank Accounts</h2>
                  <p className="text-xs text-slate-400">Accounts available through your authorized financial-data connection.</p>
                </div>
              </div>

              <div className="mb-4 flex items-center justify-between text-xs text-slate-400">
                <span>{selectedAccountIds.length} account(s) selected</span>
                <span className="text-emerald-400 font-medium">Masked for privacy</span>
              </div>

              <div className="space-y-3 mb-6">
                {accounts.map(acc => {
                  const isChecked = selectedAccountIds.includes(acc.id);
                  return (
                    <div
                      key={acc.id}
                      onClick={() => {
                        if (isChecked) {
                          setSelectedAccountIds(selectedAccountIds.filter(id => id !== acc.id));
                        } else {
                          setSelectedAccountIds([...selectedAccountIds, acc.id]);
                        }
                      }}
                      className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                        isChecked 
                          ? 'bg-emerald-500/10 border-emerald-500/50 shadow-sm' 
                          : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 bg-slate-900 border-slate-700"
                        />
                        <div>
                          <p className="text-sm font-bold text-white">{acc.bank_name}</p>
                          <p className="text-xs text-slate-400 font-mono">{acc.account_mask} · {acc.account_type}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-slate-400">Indicative Balance</span>
                        <p className="text-sm font-semibold text-slate-200">₹{acc.balance_indicative.toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setCurrentStep('AA_CONSENT')}
                  className="px-4 py-2.5 rounded-xl border border-slate-800 hover:bg-slate-800 text-slate-400 text-sm font-medium transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleSaveAccounts}
                  disabled={selectedAccountIds.length === 0 || isLoading}
                  className="flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-all shadow-lg shadow-emerald-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 6: GIG PLATFORM SELECTION */}
          {currentStep === 'SELECT_PLATFORMS' && (
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Select Income Sources</h2>
                  <p className="text-xs text-slate-400">Which gig platforms should we include in your income verification?</p>
                </div>
              </div>

              <p className="text-xs text-slate-400 mb-4">Only selected platforms will contribute to your verified income report.</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                {platforms.map(p => {
                  const isChecked = selectedPlatforms.includes(p.name);
                  return (
                    <div
                      key={p.name}
                      onClick={() => {
                        if (isChecked) {
                          setSelectedPlatforms(selectedPlatforms.filter(name => name !== p.name));
                        } else {
                          setSelectedPlatforms([...selectedPlatforms, p.name]);
                        }
                      }}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                        isChecked 
                          ? 'bg-emerald-500/10 border-emerald-500/50' 
                          : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 bg-slate-900 border-slate-700"
                        />
                        <div>
                          <p className="text-sm font-bold text-white">{p.name}</p>
                          <p className="text-[11px] text-slate-400">{p.category}</p>
                        </div>
                      </div>
                      <div>
                        {p.detected ? (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            Income detected
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                            Available
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setCurrentStep('SELECT_ACCOUNTS')}
                  className="px-4 py-2.5 rounded-xl border border-slate-800 hover:bg-slate-800 text-slate-400 text-sm font-medium transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleSavePlatforms}
                  disabled={selectedPlatforms.length === 0}
                  className="flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-all shadow-lg shadow-emerald-500/10 disabled:opacity-50"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 7: SELECT ANALYSIS PERIOD */}
          {currentStep === 'SELECT_PERIOD' && (
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Select Analysis Period</h2>
                  <p className="text-xs text-slate-400">Choose the date range for your verified income calculation</p>
                </div>
              </div>

              {/* Preset Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6">
                {[
                  { key: '3M', label: 'Last 3 Months' },
                  { key: '6M', label: 'Last 6 Months (Recommended)' },
                  { key: '12M', label: 'Last 12 Months' },
                  { key: 'CUSTOM', label: 'Custom Range' },
                ].map(p => (
                  <button
                    key={p.key}
                    onClick={() => handlePeriodChange(p.key as any)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all ${
                      periodPreset === p.key
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {/* Custom Date Pickers */}
              {periodPreset === 'CUSTOM' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-950 border border-slate-800 mb-6">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={e => setStartDate(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">End Date</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={e => setEndDate(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              )}

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 mb-6 space-y-1">
                <div className="flex justify-between font-medium text-slate-300">
                  <span>Selected Analysis Period:</span>
                  <span className="text-emerald-400">{startDate} – {endDate}</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Privacy Rule: Only financial records within this explicit time window will be analyzed or included in the report.
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setCurrentStep('SELECT_PLATFORMS')}
                  className="px-4 py-2.5 rounded-xl border border-slate-800 hover:bg-slate-800 text-slate-400 text-sm font-medium transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleStartAnalysis}
                  className="flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-all shadow-lg shadow-emerald-500/10"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Start Verification & Generate Report</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 8: ANALYSIS PROCESSING SCREEN */}
          {currentStep === 'ANALYZING' && (
            <div className="py-4">
              <div className="text-center mb-8">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto mb-3 animate-pulse">
                  <RefreshCw className="w-7 h-7 animate-spin" />
                </div>
                <h2 className="text-xl font-bold text-white">Preparing your Verified Gig Income Report...</h2>
                <p className="text-xs text-slate-400 mt-1">Applying deterministic classification and privacy rules</p>
              </div>

              <div className="max-w-md mx-auto space-y-3 mb-8">
                {[
                  'Consent verified',
                  'Financial accounts selected',
                  'Authorized data received',
                  'Transactions validated & deduplicated',
                  'Gig income identified (Uber, Zomato)',
                  'Calculating monthly consistency & confidence',
                  'Generating final report & applying privacy controls'
                ].map((item, index) => {
                  const isDone = processingStage > index;
                  const isCurrent = processingStage === index + 1;
                  return (
                    <div key={item} className="flex items-center space-x-3">
                      {isDone ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                      ) : isCurrent ? (
                        <div className="w-5 h-5 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin flex-shrink-0" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border border-slate-700 flex-shrink-0" />
                      )}
                      <span className={`text-xs sm:text-sm ${
                        isDone ? 'text-slate-200 font-medium' :
                        isCurrent ? 'text-emerald-400 font-semibold' :
                        'text-slate-600'
                      }`}>
                        {item}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
