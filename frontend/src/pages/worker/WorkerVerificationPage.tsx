import React, { useEffect, useState } from 'react';
import { CheckCircle2, ShieldCheck, AlertCircle, RefreshCw, Layers } from 'lucide-react';
import { apiService } from '../../services/api';
import { IncomeVerification } from '../../types';

export const WorkerVerificationPage: React.FC = () => {
  const [verification, setVerification] = useState<IncomeVerification | null>(null);
  const [declaredIncome, setDeclaredIncome] = useState<number>(30000);
  const [isLoading, setIsLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadVerification = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiService.getLatestVerification();
      setVerification(data);
      if (data.declared_monthly_income > 0) {
        setDeclaredIncome(data.declared_monthly_income);
      }
    } catch (err) {
      // No verification yet
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadVerification();
  }, []);

  const handleRunVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRunning(true);
    setError(null);
    try {
      const data = await apiService.startVerification(Number(declaredIncome));
      setVerification(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to perform income verification. Please ensure transactions exist.');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Income Verification Engine</h1>
          <p className="text-sm text-slate-400">Deterministic verification of credit gig payouts</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-400">Rules Engine:</span>
          <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20">
            v1.0 Ruleset
          </span>
        </div>
      </div>

      {/* Action Form */}
      <form onSubmit={handleRunVerification} className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-white">Run Income Verification Audit</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          <div>
            <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-1">
              Declared Monthly Income (₹)
            </label>
            <input
              type="number"
              min="0"
              value={declaredIncome}
              onChange={(e) => setDeclaredIncome(Number(e.target.value))}
              placeholder="e.g. 30000"
              className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-sm focus:border-emerald-500 outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isRunning}
            className="py-2.5 px-6 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {isRunning ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Running Audit...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Run Income Verification</span>
              </>
            )}
          </button>
        </div>
      </form>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Verification Results Card */}
      {verification && (
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
            <div>
              <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Audit Status</span>
              <div className="flex items-center space-x-3 mt-1">
                <span className={`text-xl font-black px-3 py-1 rounded-lg ${
                  verification.verification_status === 'VERIFIED'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : verification.verification_status === 'PARTIALLY_VERIFIED'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                }`}>
                  {verification.verification_status}
                </span>
                <span className="text-sm font-semibold text-slate-300">
                  Confidence Score: {verification.confidence_score}%
                </span>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Verified Monthly Income</span>
              <div className="text-3xl font-extrabold text-emerald-400 mt-1">
                ₹{verification.verified_monthly_income.toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          {/* Metric Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-xs text-slate-400">Observed Average</span>
              <p className="text-lg font-bold text-white mt-1">₹{verification.observed_average_monthly_income.toLocaleString('en-IN')}</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-xs text-slate-400">Months Analyzed</span>
              <p className="text-lg font-bold text-white mt-1">{verification.months_analyzed} Months</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-xs text-slate-400">Active Sources</span>
              <p className="text-lg font-bold text-white mt-1">{verification.income_sources_count} Platforms</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-xs text-slate-400">Income Coverage</span>
              <p className="text-lg font-bold text-white mt-1">{verification.income_coverage_percentage}%</p>
            </div>
          </div>

          {/* Summary Explanation Box */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Verification Summary</span>
            <p className="text-sm text-slate-200">{verification.verification_summary}</p>
          </div>
        </div>
      )}
    </div>
  );
};
