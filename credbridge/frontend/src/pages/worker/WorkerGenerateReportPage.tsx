import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck, CheckCircle2, Lock, ArrowRight, ArrowLeft,
  Building2, Calendar, RefreshCw, AlertCircle, FileCheck,
  Check, Sparkles, AlertTriangle
} from 'lucide-react';
import { apiService } from '../../services/api';
import { BankAccountItem } from '../../types';

type FlowStep = 'CONSENT' | 'SELECT_ACCOUNTS' | 'SELECT_PERIOD' | 'PROCESSING';

export const WorkerGenerateReportPage: React.FC = () => {
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState<FlowStep>('CONSENT');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Accounts state
  const [accounts, setAccounts] = useState<BankAccountItem[]>([]);
  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([]);

  // Period state
  const [periodPreset, setPeriodPreset] = useState<'3M' | '6M' | '12M' | 'CUSTOM'>('6M');
  const [startDate, setStartDate] = useState<string>(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 6);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState<string>(() => new Date().toISOString().split('T')[0]);

  // Processing checklist state
  const [processingStage, setProcessingStage] = useState<number>(0);

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      const accList = await apiService.getBankAccounts();
      setAccounts(accList);
      // Select all or default accounts
      const defaultSelected = accList.map(a => a.id);
      setSelectedAccountIds(defaultSelected);
    } catch (err) {
      console.warn('Failed to load bank accounts:', err);
    }
  };

  const handlePeriodPreset = (preset: '3M' | '6M' | '12M' | 'CUSTOM') => {
    setPeriodPreset(preset);
    const end = new Date();
    setEndDate(end.toISOString().split('T')[0]);

    if (preset === '3M') {
      const start = new Date();
      start.setMonth(start.getMonth() - 3);
      setStartDate(start.toISOString().split('T')[0]);
    } else if (preset === '6M') {
      const start = new Date();
      start.setMonth(start.getMonth() - 6);
      setStartDate(start.toISOString().split('T')[0]);
    } else if (preset === '12M') {
      const start = new Date();
      start.setMonth(start.getMonth() - 12);
      setStartDate(start.toISOString().split('T')[0]);
    }
  };

  const toggleAccount = (id: string) => {
    if (selectedAccountIds.includes(id)) {
      if (selectedAccountIds.length === 1) {
        setError('At least one bank account must remain selected.');
        return;
      }
      setError(null);
      setSelectedAccountIds(selectedAccountIds.filter(a => a !== id));
    } else {
      setError(null);
      setSelectedAccountIds([...selectedAccountIds, id]);
    }
  };

  // Step 4: Run Analysis & Generate Report
  const handleGenerateReport = async () => {
    setCurrentStep('PROCESSING');
    setIsLoading(true);
    setError(null);
    setProcessingStage(1);

    try {
      // Stage 1: Authenticating AA Token
      await new Promise(r => setTimeout(r, 600));
      setProcessingStage(2);

      // Stage 2: Fetching Bank Transactions & sync account selection
      await apiService.selectBankAccounts(selectedAccountIds);
      await new Promise(r => setTimeout(r, 700));
      setProcessingStage(3);

      // Stage 3: Detecting Gig Income Sources
      await new Promise(r => setTimeout(r, 700));
      setProcessingStage(4);

      // Stage 4: Cryptographic signing & report generation
      const report = await apiService.generateIncomeReport({
        account_ids: selectedAccountIds,
        start_date: startDate,
        end_date: endDate
      });
      setProcessingStage(5);
      await new Promise(r => setTimeout(r, 500));

      // Navigate to report view
      navigate(`/worker/reports/${report.id}`);
    } catch (err: any) {
      console.error('Report generation error:', err);
      const msg = err.response?.data?.detail || 'Failed to generate report. Please try again.';
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
      setCurrentStep('SELECT_PERIOD');
    } finally {
      setIsLoading(false);
    }
  };

  const stepsList = [
    { key: 'CONSENT', number: 1, label: 'Consent' },
    { key: 'SELECT_ACCOUNTS', number: 2, label: 'Bank Accounts' },
    { key: 'SELECT_PERIOD', number: 3, label: 'Analysis Period' },
    { key: 'PROCESSING', number: 4, label: 'Verification' }
  ];

  const currentStepIndex = stepsList.findIndex(s => s.key === currentStep);

  return (
    <div className="space-y-6 max-w-3xl mx-auto py-2">
      {/* Header */}
      <div className="text-center space-y-1">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Automated Evidence Engine</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Generate Verified Gig Income Report
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
          Authorizes read-only analysis of your selected bank statements to generate a cryptographically signed earnings report for lenders.
        </p>
      </div>

      {/* 4-Step Stepper Progress Bar */}
      <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl">
        <div className="flex items-center justify-between">
          {stepsList.map((step, idx) => {
            const isCompleted = currentStepIndex > idx;
            const isCurrent = currentStepIndex === idx;

            return (
              <React.Fragment key={step.key}>
                <div className="flex items-center space-x-2">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    isCompleted
                      ? 'bg-emerald-500 text-slate-950'
                      : isCurrent
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500'
                      : 'bg-slate-800 text-slate-500'
                  }`}>
                    {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : step.number}
                  </div>
                  <span className={`text-xs font-medium hidden sm:inline ${
                    isCurrent ? 'text-white' : isCompleted ? 'text-emerald-400' : 'text-slate-500'
                  }`}>
                    {step.label}
                  </span>
                </div>
                {idx < stepsList.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 ${
                    isCompleted ? 'bg-emerald-500' : 'bg-slate-800'
                  }`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-start space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* STEP 1: CONSENT & DATA ACCESS */}
      {currentStep === 'CONSENT' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <Lock className="w-5 h-5 text-emerald-400" />
              <span>Step 1: Consent & Data Access Authorization</span>
            </h2>
            <p className="text-xs text-slate-400">
              Please review what CredBridge will access and what will remain strictly private.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* What will be accessed */}
            <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-3">
              <div className="text-xs font-semibold uppercase tracking-wider text-emerald-400 flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>What Will Be Accessed</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-start space-x-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>Inflow transactions from gig delivery & rideshare platforms</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>Deposit dates, transaction amounts, and platform sender names</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>Read-only account balance indicators for solvency validation</span>
                </li>
              </ul>
            </div>

            {/* What will NEVER be accessed */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>What Will NEVER Be Accessed</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-400">
                <li className="flex items-start space-x-2">
                  <span className="text-rose-400 font-bold">✕</span>
                  <span>Your net banking passwords, MPINs, or login credentials</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-rose-400 font-bold">✕</span>
                  <span>Personal non-gig debit expenses or merchant shopping history</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-rose-400 font-bold">✕</span>
                  <span>Any bank accounts you have not explicitly authorized</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center space-x-3 text-xs text-slate-400">
            <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Consent is governed by RBI Account Aggregator framework. You can revoke access at any time from your Consent & Data Access tab.
            </span>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={() => setCurrentStep('SELECT_ACCOUNTS')}
              className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all flex items-center space-x-2 shadow-lg shadow-emerald-500/15 cursor-pointer"
            >
              <span>I Authorize & Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: SELECT BANK ACCOUNTS */}
      {currentStep === 'SELECT_ACCOUNTS' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <Building2 className="w-5 h-5 text-emerald-400" />
              <span>Step 2: Select Bank Accounts for Analysis</span>
            </h2>
            <p className="text-xs text-slate-400">
              Select the bank accounts where you receive your gig earnings (Uber, Zomato, Swiggy, etc.).
            </p>
          </div>

          <div className="space-y-3">
            {accounts.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center text-xs text-slate-400">
                Loading linked bank accounts...
              </div>
            ) : (
              accounts.map((acc) => {
                const isSelected = selectedAccountIds.includes(acc.id);
                return (
                  <div
                    key={acc.id}
                    onClick={() => toggleAccount(acc.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-emerald-500/10 border-emerald-500 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center space-x-3.5">
                      <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                        isSelected
                          ? 'bg-emerald-500 border-emerald-500 text-slate-950'
                          : 'border-slate-700 bg-slate-900'
                      }`}>
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-slate-100 flex items-center space-x-2">
                          <span>{acc.bank_name}</span>
                          <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                            {acc.account_mask}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          {acc.account_type} Account • Indicative Balance: ₹{acc.balance_indicative?.toLocaleString('en-IN')}
                        </div>
                      </div>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      isSelected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'
                    }`}>
                      {isSelected ? 'Selected' : 'Tap to Select'}
                    </span>
                  </div>
                );
              })
            )}
          </div>

          <div className="pt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setCurrentStep('CONSENT')}
              className="px-4 py-2.5 rounded-xl border border-slate-800 text-slate-300 hover:bg-slate-800 text-xs font-semibold flex items-center space-x-2 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (selectedAccountIds.length === 0) {
                  setError('Please select at least one account.');
                  return;
                }
                setError(null);
                setCurrentStep('SELECT_PERIOD');
              }}
              className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all flex items-center space-x-2 shadow-lg shadow-emerald-500/15 cursor-pointer"
            >
              <span>Continue to Period</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: SELECT ANALYSIS PERIOD */}
      {currentStep === 'SELECT_PERIOD' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-emerald-400" />
              <span>Step 3: Select Analysis Period</span>
            </h2>
            <p className="text-xs text-slate-400">
              Lenders typically evaluate 6 months of historical gig earnings for loan underwriting.
            </p>
          </div>

          {/* Presets */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { id: '3M', label: 'Last 3 Months', sub: 'Recent Trend' },
              { id: '6M', label: 'Last 6 Months', sub: 'Standard Benchmark' },
              { id: '12M', label: 'Last 12 Months', sub: 'Full Year History' },
              { id: 'CUSTOM', label: 'Custom Range', sub: 'Select Dates' }
            ].map((p) => {
              const isSelected = periodPreset === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handlePeriodPreset(p.id as any)}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-500/10 shadow-sm'
                      : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                  }`}
                >
                  <div className={`font-bold text-sm ${isSelected ? 'text-emerald-400' : 'text-slate-200'}`}>
                    {p.label}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{p.sub}</div>
                </button>
              );
            })}
          </div>

          {/* Date Picker Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-950 border border-slate-800">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setPeriodPreset('CUSTOM');
                }}
                className="w-full px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-800 text-sm text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setPeriodPreset('CUSTOM');
                }}
                className="w-full px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-800 text-sm text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-400 space-y-1">
            <div className="text-slate-300 font-semibold">Automated Gig Intelligence</div>
            <div>
              Our analysis engine automatically identifies payments from Uber, Zomato, Swiggy, and other gig employers. No manual transaction tagging or platform linking is required.
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setCurrentStep('SELECT_ACCOUNTS')}
              className="px-4 py-2.5 rounded-xl border border-slate-800 text-slate-300 hover:bg-slate-800 text-xs font-semibold flex items-center space-x-2 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={handleGenerateReport}
              disabled={isLoading}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm transition-all flex items-center space-x-2 shadow-lg shadow-emerald-500/20 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate Verified Report</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: REAL-TIME PROCESSING CHECKLIST */}
      {currentStep === 'PROCESSING' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto">
              <RefreshCw className="w-6 h-6 animate-spin" />
            </div>
            <h2 className="text-xl font-bold text-white">Analyzing Financial Data</h2>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Authenticating tokens, calculating gig inflows, and producing your cryptographically signed report.
            </p>
          </div>

          {/* Real-time Checklist items */}
          <div className="space-y-3 max-w-md mx-auto">
            {[
              { id: 1, text: 'Authenticating Account Aggregator token and permissions' },
              { id: 2, text: 'Fetching authorized statement transactions from selected bank accounts' },
              { id: 3, text: 'Detecting and filtering gig platform deposits (Uber, Zomato, etc.)' },
              { id: 4, text: 'Analyzing monthly cashflow consistency, volatility, and trend' },
              { id: 5, text: 'Generating canonical SHA-256 hash and digital signature' }
            ].map((item) => {
              const isDone = processingStage > item.id;
              const isCurrent = processingStage === item.id;

              return (
                <div
                  key={item.id}
                  className={`p-3 rounded-xl border flex items-center space-x-3 transition-all ${
                    isDone
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-slate-200'
                      : isCurrent
                      ? 'bg-slate-950 border-emerald-500 text-white'
                      : 'bg-slate-950/40 border-slate-800/60 text-slate-500'
                  }`}
                >
                  <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0">
                    {isDone ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : isCurrent ? (
                      <RefreshCw className="w-4 h-4 text-emerald-400 animate-spin" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-slate-700" />
                    )}
                  </div>
                  <span className="text-xs font-medium">{item.text}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
