import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles, CheckCircle2, AlertCircle, ArrowLeft, ArrowRight,
  ShieldAlert, RefreshCw, Layers, ExternalLink, Info, Check
} from 'lucide-react';
import { apiService } from '../../services/api';
import { FinancialRecommendationItem } from '../../types';

export const WorkerRecommendationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState<FinancialRecommendationItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedProduct, setSelectedProduct] = useState<FinancialRecommendationItem | null>(null);

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    setIsLoading(true);
    try {
      const data = await apiService.getFinancialRecommendations();
      setRecommendations(data);
    } catch (err) {
      console.error('Error fetching recommendations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-4 px-2 sm:px-4">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <button
            onClick={() => navigate('/worker/dashboard')}
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Explore Financial Options</h1>
          <p className="text-sm text-slate-400 mt-1">Institutional credit options aligned with your verified gig income profile.</p>
        </div>
      </div>

      {/* Mandatory Regulatory Disclaimer Box */}
      <div className="mb-8 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 flex items-start space-x-3">
        <ShieldAlert className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <p className="font-bold text-amber-200 uppercase tracking-wider mb-0.5">Important Disclaimer:</p>
          <p>
            CredBridge is not a lender, broker, or financial institution. CredBridge does not approve or guarantee loans. 
            The options presented below are for exploration support only based on your verified income data. Final underwriting and credit extension belong strictly to regulated lending partners.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recommendations.map(rec => (
            <div
              key={rec.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 flex flex-col justify-between transition-all hover:shadow-xl hover:shadow-slate-950/50"
            >
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                  {rec.category}
                </span>
                <h3 className="text-lg font-bold text-white mt-3 mb-1">{rec.title}</h3>
                <p className="text-xs text-slate-400 mb-4">Indicative Range: <span className="font-semibold text-slate-200">{rec.indicative_range}</span></p>

                <div className="space-y-2 mb-6">
                  <p className="text-xs font-semibold text-slate-300">Why you may fit this profile:</p>
                  {rec.fit_reasons.map((reason, idx) => (
                    <div key={idx} className="flex items-start space-x-2 text-xs text-slate-400">
                      <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>{reason}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800/80">
                <button
                  onClick={() => setSelectedProduct(rec)}
                  className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors"
                >
                  <span>View Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">{selectedProduct.category}</span>
                <h3 className="font-bold text-white text-lg">{selectedProduct.title}</h3>
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
              <span className="text-slate-400 block mb-0.5">Indicative Facility Range:</span>
              <span className="text-base font-bold text-emerald-400">{selectedProduct.indicative_range}</span>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-300">Profile Criteria Assessment:</p>
              {selectedProduct.fit_reasons.map((r, i) => (
                <div key={i} className="flex items-start space-x-2 text-xs text-slate-400">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>{r}</span>
                </div>
              ))}
            </div>

            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 leading-relaxed">
              <strong>Notice:</strong> {selectedProduct.disclaimer}
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                onClick={() => setSelectedProduct(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setSelectedProduct(null);
                  navigate('/worker/consent');
                }}
                className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-emerald-500/10"
              >
                Share Evidence with Lender
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
