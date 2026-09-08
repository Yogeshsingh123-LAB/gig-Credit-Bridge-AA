import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Building2, CheckCircle2, ShieldCheck, ArrowRight, ArrowLeft, 
  RefreshCw, AlertCircle, Lock, Wallet
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
      const data = await apiService.getBankAccounts();
      setAccounts(data);
      const selected = data.filter(a => a.is_selected).map(a => a.id);
      setSelectedIds(selected.length > 0 ? selected : data.map(a => a.id));
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to retrieve linked bank accounts.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAccount = (id: string) => {
    if (selectedIds.includes(id)) {
      if (selectedIds.length === 1) {
        setError('At least one bank account must remain selected for 12-month analysis.');
        return;
      }
      setError(null);
      setSelectedIds(selectedIds.filter(item => item !== id));
    } else {
      setError(null);
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
      // Navigate to 12-month report generation
      navigate('/worker/generate-report?flow=analyze');
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to save bank account selection.');
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-4 space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <Lock className="w-3 h-3" />
            <span>Step 2 of 3 • Account Aggregator</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Select Bank Accounts</h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Choose which authorized accounts to include in your 12-month gig-income analysis.
          </p>
        </div>

        <Link
          to="/worker/consent"
          className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Consent</span>
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
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>
              Showing <strong>{accounts.length}</strong> bank account(s) retrieved via RBI Account Aggregator protocol.
            </span>
            <span className="font-semibold text-emerald-400">
              {selectedIds.length} of {accounts.length} Selected
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {accounts.map((acc) => {
              const isChecked = selectedIds.includes(acc.id);
              return (
                <div
                  key={acc.id}
                  onClick={() => toggleAccount(acc.id)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    isChecked
                      ? 'bg-slate-900 border-emerald-500/40 shadow-lg shadow-emerald-950/20'
                      : 'bg-slate-950/60 border-slate-800/80 opacity-60 hover:opacity-100 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <input
                      type="checkbox"
                      id={`acc-check-${acc.id}`}
                      checked={isChecked}
                      onChange={() => {}} // Handled by outer card onClick
                      className="w-4 h-4 rounded text-emerald-500 bg-slate-900 border-slate-700 focus:ring-emerald-500 cursor-pointer"
                    />
                    <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300">
                      <Building2 className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">{acc.bank_name}</h3>
                      <div className="flex items-center space-x-2 text-xs text-slate-400 mt-0.5">
                        <span className="font-mono font-medium text-slate-300">
                          {acc.account_mask || '•••• 4821'}
                        </span>
                        <span>•</span>
                        <span>{acc.account_type || 'Savings'}</span>
                        {acc.fip_name && (
                          <>
                            <span>•</span>
                            <span className="text-slate-500">{acc.fip_name}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-semibold">
                      <ShieldCheck className="w-3 h-3" />
                      <span>Authorized</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-xs font-semibold text-slate-300 block">
              12-Month Observation Period Guarantee
            </span>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              CredBridge strictly analyzes transactions from the last 365 days across all selected accounts. Income patterns are deterministically classified against recognized gig platforms.
            </p>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between pt-4">
            <Link
              to="/worker/consent"
              className="px-4 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white text-xs font-semibold transition-colors"
            >
              Back
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
                  <span>Connecting AA...</span>
                </>
              ) : (
                <>
                  <span>Continue to 12-Month Analysis</span>
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
