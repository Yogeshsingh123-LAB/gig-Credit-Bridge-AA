import React, { useEffect, useState } from 'react';
import { FileText, Download, RefreshCw, ShieldCheck, Sparkles, Printer, CheckCircle2 } from 'lucide-react';
import { apiService } from '../../services/api';
import { CreditPassport } from '../../types';

export const WorkerPassportPage: React.FC = () => {
  const [passport, setPassport] = useState<CreditPassport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const loadPassport = async () => {
    setIsLoading(true);
    try {
      const data = await apiService.getLatestPassport();
      setPassport(data);
    } catch (err) {
      console.error('Failed to load passport:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPassport();
  }, []);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const data = await apiService.generatePassport();
      setPassport(data);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to generate credit passport.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-900 p-6 rounded-2xl border border-slate-800 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-white">Credit Passport</h1>
          <p className="text-sm text-slate-400">Portable financial evidence document for lender assessment</p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 flex items-center space-x-2 transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print / PDF</span>
          </button>

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-600/20 flex items-center space-x-2 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>Generate New Version</span>
          </button>
        </div>
      </div>

      {passport && (
        <div className="bg-slate-900 border-2 border-slate-800 rounded-3xl p-8 sm:p-12 space-y-8 print:bg-white print:text-black print:border-none print:shadow-none">
          {/* Document Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-8 border-b border-slate-800 gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-slate-950 font-bold">
                <ShieldCheck className="w-7 h-7 stroke-[2.5]" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white tracking-wide">CRED BRIDGE</h2>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">VERIFIED CREDIT PASSPORT</span>
              </div>
            </div>

            <div className="text-left sm:text-right text-xs text-slate-400 space-y-1">
              <p><strong className="text-slate-200">Passport ID:</strong> {passport.passport_number}</p>
              <p><strong className="text-slate-200">Version:</strong> {passport.version}</p>
              <p><strong className="text-slate-200">Issued:</strong> {new Date(passport.generated_at).toLocaleDateString('en-IN')}</p>
            </div>
          </div>

          {/* Section 1: Financial Readiness Score */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 rounded-2xl bg-slate-950 border border-slate-800">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Financial Readiness Score</span>
              <div className="text-4xl font-black text-emerald-400 mt-2">
                {passport.financial_score?.overall_score || 0} / 100
              </div>
              <span className="inline-block mt-2 px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {passport.financial_score?.score_band || 'UNSCORED'} BAND
              </span>
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Verified Monthly Income</span>
              <div className="text-3xl font-bold text-white mt-2">
                ₹{passport.verification_summary?.verified_monthly_income?.toLocaleString('en-IN') || 0}
              </div>
              <span className="text-xs text-slate-400 mt-2 block">
                Status: {passport.verification_summary?.verification_status || 'UNVERIFIED'}
              </span>
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Verification Confidence</span>
              <div className="text-3xl font-bold text-teal-400 mt-2">
                {passport.verification_summary?.confidence_score || 0}%
              </div>
              <span className="text-xs text-slate-400 mt-2 block">
                History: {passport.verification_summary?.months_analyzed || 0} Months Observed
              </span>
            </div>
          </div>

          {/* Section 2: AI Natural Language Summary */}
          {passport.explanation && (
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4" />
                <span>AI Evidence Interpretation</span>
              </span>
              <p className="text-sm text-slate-200 leading-relaxed font-normal">
                "{passport.explanation}"
              </p>
            </div>
          )}

          {/* Section 3: Income Sources Breakdown */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Verified Income Sources</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {passport.income_sources?.map((src: any) => (
                <div key={src.source} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-white text-sm">{src.source}</span>
                    <p className="text-slate-400 mt-0.5">{src.transaction_count} Transactions</p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-emerald-400 text-sm">₹{src.total_income?.toLocaleString('en-IN')}</span>
                    <p className="text-slate-400 mt-0.5">{src.percentage_of_income?.toFixed(1)}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Risk Indicators & Attention Areas */}
          {passport.risk_indicators && passport.risk_indicators.length > 0 && (
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider">Observed Evidence Indicators</h3>
              <ul className="space-y-1 text-xs text-slate-300">
                {passport.risk_indicators.map((ind: string, idx: number) => (
                  <li key={idx} className="flex items-center space-x-2">
                    <span className="text-amber-400">•</span>
                    <span>{ind}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Footer Disclaimer */}
          <div className="pt-6 border-t border-slate-800 text-[10px] text-slate-500 text-center space-y-1">
            <p>This Credit Passport is a consent-based analytical summary generated by CredBridge Engine v1.0.</p>
            <p>CredBridge is not a lender or credit bureau and does not approve or reject loans.</p>
          </div>
        </div>
      )}
    </div>
  );
};
