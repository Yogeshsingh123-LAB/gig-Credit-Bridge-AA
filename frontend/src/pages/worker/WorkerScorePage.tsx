import React, { useEffect, useState } from 'react';
import { Award, CheckCircle2, AlertTriangle, RefreshCw, Sparkles, HelpCircle } from 'lucide-react';
import { apiService } from '../../services/api';
import { FinancialReadinessScore } from '../../types';

export const WorkerScorePage: React.FC = () => {
  const [score, setScore] = useState<FinancialReadinessScore | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadScore = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiService.getLatestScore();
      setScore(data);
    } catch (err) {
      // Unscored
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadScore();
  }, []);

  const handleRecalculate = async () => {
    setIsCalculating(true);
    setError(null);
    try {
      const data = await apiService.calculateScore();
      setScore(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to calculate score. Ensure transactions exist.');
    } finally {
      setIsCalculating(false);
    }
  };

  const getBandColor = (band: string) => {
    switch (band) {
      case 'EXCELLENT': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'GOOD': return 'text-teal-400 bg-teal-500/10 border-teal-500/30';
      case 'FAIR': return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      default: return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Financial Readiness Score</h1>
          <p className="text-sm text-slate-400">Explainable cashflow readiness assessment (0–100)</p>
        </div>

        <button
          onClick={handleRecalculate}
          disabled={isCalculating}
          className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-600/20 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isCalculating ? 'animate-spin' : ''}`} />
          <span>{isCalculating ? 'Calculating...' : 'Recalculate Score'}</span>
        </button>
      </div>

      {/* Non-Bureau Disclaimer */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 flex items-start space-x-3">
        <HelpCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <p>
          <strong className="text-slate-200">CredBridge Financial Readiness Score</strong> is an analytical cashflow score calculated deterministically from verified gig transactions. It is NOT an official credit bureau score (CIBIL/Experian) and does not make loan approval or rejection decisions.
        </p>
      </div>

      {score && (
        <div className="space-y-6">
          {/* Main Gauge Card */}
          <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 text-center relative overflow-hidden">
            <span className="text-xs uppercase tracking-widest text-slate-400 font-bold">Overall Financial Readiness Score</span>
            <div className="mt-4 flex items-center justify-center space-x-2">
              <span className="text-6xl font-black bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                {score.overall_score}
              </span>
              <span className="text-2xl font-bold text-slate-500">/ 100</span>
            </div>

            <div className="mt-4 inline-block">
              <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border ${getBandColor(score.score_band)}`}>
                {score.score_band} BAND
              </span>
            </div>

            <p className="text-sm text-slate-300 mt-4 max-w-xl mx-auto italic">
              "{score.calculation_summary}"
            </p>
          </div>

          {/* Sub-Components Weight Grid */}
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white">Component Sub-Scores Breakdown</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(score.component_scores || {}).map(([key, val]) => (
                <div key={key} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-400 uppercase tracking-wider">{key}</span>
                    <span className="text-emerald-400">{val} / 100</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${val}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Positive Factors & Attention Areas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Positive Factors */}
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-3">
              <h4 className="text-sm font-bold text-emerald-400 uppercase tracking-wider flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Positive Indicators ({score.positive_factors?.length || 0})</span>
              </h4>
              <ul className="space-y-2 text-xs text-slate-300">
                {score.positive_factors?.map((factor, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>{factor}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Attention Areas */}
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-3">
              <h4 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4" />
                <span>Attention Areas ({score.attention_areas?.length || 0})</span>
              </h4>
              <ul className="space-y-2 text-xs text-slate-300">
                {score.attention_areas?.map((area, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <span className="text-amber-400 font-bold">•</span>
                    <span>{area}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
