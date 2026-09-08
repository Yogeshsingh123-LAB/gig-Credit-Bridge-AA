import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShieldCheck, Sliders, AlertTriangle, Sparkles, CheckCircle2, Lock, ArrowLeft } from 'lucide-react';
import { apiService } from '../../services/api';

export const LenderApplicantDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDetail = async () => {
      if (!id) return;
      setIsLoading(true);
      setError(null);
      try {
        const res = await apiService.getLenderApplicantDetail(id);
        setData(res);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Access denied. Active worker consent is missing or revoked.');
      } finally {
        setIsLoading(false);
      }
    };
    loadDetail();
  }, [id]);

  if (isLoading) {
    return <div className="py-24 text-center text-slate-400">Verifying consent and loading financial evidence...</div>;
  }

  if (error || !data) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-4">
        <Lock className="w-12 h-12 text-rose-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Access Forbidden / Consent Revoked</h2>
        <p className="text-sm text-slate-400">{error}</p>
        <Link
          to="/lender/applicants"
          className="inline-flex items-center space-x-2 text-xs text-teal-400 font-semibold hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Applicants List</span>
        </Link>
      </div>
    );
  }

  const { worker, passport } = data;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-900 p-6 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-white">{worker.name}</h1>
            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              ACTIVE CONSENT
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            {worker.occupation || 'Gig Worker'} • {worker.city || 'Location N/A'} • Experience: {worker.experience_months} Months
          </p>
        </div>

        <Link
          to={`/lender/applicant/${id}/simulator`}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-400 hover:from-teal-400 hover:to-emerald-300 text-slate-950 font-bold text-sm shadow-lg shadow-teal-500/20 flex items-center justify-center space-x-2 transition-all"
        >
          <Sliders className="w-4 h-4" />
          <span>Launch What-If Simulator</span>
        </Link>
      </div>

      {/* Main Evidence Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs uppercase tracking-wider font-bold text-slate-400">Financial Readiness Score</span>
          <div className="text-4xl font-black text-emerald-400 mt-2">
            {passport.financial_score?.overall_score || 0} / 100
          </div>
          <span className="inline-block mt-2 px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            {passport.financial_score?.score_band || 'UNSCORED'} BAND
          </span>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs uppercase tracking-wider font-bold text-slate-400">Verified Monthly Income</span>
          <div className="text-3xl font-extrabold text-white mt-2">
            ₹{passport.verification_summary?.verified_monthly_income?.toLocaleString('en-IN') || 0}
          </div>
          <span className="text-xs text-slate-400 mt-2 block">
            Observed Avg: ₹{passport.income_summary?.average_monthly_income?.toLocaleString('en-IN') || 0}
          </span>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs uppercase tracking-wider font-bold text-slate-400">Data Evidence Quality</span>
          <div className="text-3xl font-extrabold text-teal-400 mt-2">
            {passport.data_quality?.quality_score || 100} / 100
          </div>
          <span className="text-xs text-slate-400 mt-2 block">
            {passport.data_quality?.valid_transactions || 0} Verified Transactions
          </span>
        </div>
      </div>

      {/* AI Interpretation */}
      {passport.explanation && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <span className="text-xs font-bold text-teal-400 uppercase tracking-wider flex items-center space-x-1.5">
            <Sparkles className="w-4 h-4" />
            <span>AI Fact Interpretation (Summary Only)</span>
          </span>
          <p className="text-sm text-slate-200 leading-relaxed italic">
            "{passport.explanation}"
          </p>
        </div>
      )}

      {/* Verified Income Sources & Risk Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Income Sources Contribution</h3>
          <div className="space-y-3">
            {passport.income_sources?.map((src: any) => (
              <div key={src.source} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center text-xs">
                <span className="font-bold text-white">{src.source}</span>
                <span className="font-bold text-emerald-400">₹{src.total_income?.toLocaleString('en-IN')} ({src.percentage_of_income?.toFixed(1)}%)</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider">Observed Attention Areas</h3>
          <ul className="space-y-2 text-xs text-slate-300">
            {passport.risk_indicators?.map((ind: string, idx: number) => (
              <li key={idx} className="flex items-start space-x-2">
                <span className="text-amber-400">•</span>
                <span>{ind}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
