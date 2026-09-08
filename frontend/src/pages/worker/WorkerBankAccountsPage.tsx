import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Building2, CheckCircle2, ShieldCheck, ArrowRight, ArrowLeft, 
  RefreshCw, AlertCircle, Calendar, CheckSquare, Square
} from 'lucide-react';
import { apiService } from '../../services/api';
import { BankAccountItem } from '../../types';

export const WorkerBankAccountsPage: React.FC = () => {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState<BankAccountItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Dynamic financial accounts from GET /api/v1/financial/accounts (Section 6)
      const data = await apiService.getFinancialAccounts();
      setAccounts(data);
      const selected = data.filter(a => a.is_selected).map(a => a.id || (a as any).account_id);
      setSelectedIds(selected.length > 0 ? selected : data.map(a => a.id || (a as any).account_id));
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to retrieve linked bank accounts.');
    } finally {
      setIsLoading(false);
    }
  };

  const getAccountId = (acc: BankAccountItem): string => {
    return acc.id || (acc as any).account_id || '';
  };

  // Sections 4 & 5: Choose All Banks derived state
  const isAllSelected = accounts.length > 0 && selectedIds.length === accounts.length;

  const toggleChooseAll = () => {
    setError(null);
    if (isAllSelected) {
      // Turn OFF: clear all selections
      setSelectedIds([]);
    } else {
      // Turn ON: select all currently available bank accounts
      setSelectedIds(accounts.map(a => getAccountId(a)));
    }
  };

  const toggleAccount = (id: string) => {
    setError(null);
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(item => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleContinue = async () => {
    if (selectedIds.length === 0) {
      setError('Please select at least one bank account to analyze.');
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      await apiService.selectBankAccounts(selectedIds);
      // Navigate directly to 12-month report generation
      navigate('/worker/generate-report?flow=analyze');
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to save bank account selection.');
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-4 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-800">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-400 text-xs font-bold">
              Analysis Period: 12 Months
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Select Bank Accounts</h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Choose which accounts to include in your fixed 12-month gig-income analysis.
          </p>
        </div>

        <Link
          to="/worker/dashboard"
          className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white transition-colors shrink-0"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-400 text-xs flex items-start space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Section 4 & 5: Prominent 'Choose All Banks' Master Option */}
          <div
            onClick={toggleChooseAll}
            className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
              isAllSelected
                ? 'bg-emerald-500/10 border-emerald-500/40 shadow-sm'
                : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="choose-all-banks-checkbox"
                checked={isAllSelected}
                onChange={toggleChooseAll}
                className="w-4 h-4 rounded text-emerald-500 bg-slate-950 border-slate-700 focus:ring-emerald-500 cursor-pointer"
              />
              <span className="text-sm font-bold text-white">Choose All Banks</span>
            </div>
            <span className="text-xs text-slate-400 font-medium">
              {isAllSelected ? 'All accounts selected' : `${selectedIds.length} of ${accounts.length} selected`}
            </span>
          </div>

          <div className="relative py-1">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>
          </div>

          {/* Dynamic Account List (Section 6 & 18) */}
          <div className="grid grid-cols-1 gap-3">
            {accounts.map((acc) => {
              const accId = getAccountId(acc);
              const isChecked = selectedIds.includes(accId);
              const maskedNumber = (acc as any).masked_account_number || acc.account_mask || '•••• 4521';

              return (
                <div
                  key={accId}
                  onClick={() => toggleAccount(accId)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    isChecked
                      ? 'bg-slate-900 border-emerald-500/40 shadow-lg shadow-emerald-950/20'
                      : 'bg-slate-950/60 border-slate-800/80 opacity-60 hover:opacity-100 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <input
                      type="checkbox"
                      id={`acc-check-${accId}`}
                      checked={isChecked}
                      onChange={() => toggleAccount(accId)}
                      className="w-4 h-4 rounded text-emerald-500 bg-slate-900 border-slate-700 focus:ring-emerald-500 cursor-pointer"
                    />
                    <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300 shrink-0">
                      <Building2 className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">{acc.bank_name}</h3>
                      <div className="flex items-center space-x-2 text-xs text-slate-400 mt-0.5">
                        <span className="font-mono font-medium text-slate-300">
                          {maskedNumber}
                        </span>
                        <span>•</span>
                        <span>{acc.account_type || 'Savings Account'}</span>
                        {acc.fip_name && (
                          <>
                            <span>•</span>
                            <span className="text-slate-500">{acc.fip_name}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-semibold">
                      <ShieldCheck className="w-3 h-3" />
                      <span>Ready</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Section 8: Fixed 12-Month Analysis Badge & Notice */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-xs font-semibold text-slate-300 block">
              Analysis Period: 12 Months (Fixed)
            </span>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              CredBridge standardizes all evaluations to a 12-month (365 days) period. Never prompts for 
              passwords, UPI PINs, or credentials.
            </p>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between pt-4">
            <Link
              to="/worker/dashboard"
              className="px-4 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white text-xs font-semibold transition-colors"
            >
              Cancel
            </Link>

            <button
              type="button"
              id="continue-to-analysis-btn"
              disabled={selectedIds.length === 0 || isSaving}
              onClick={handleContinue}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 cursor-pointer"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Preparing Analysis...</span>
                </>
              ) : (
                <>
                  <span>Analyze 12 Months & Generate Report</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
