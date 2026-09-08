import React, { useEffect, useState } from 'react';
import { checkApiHealth } from '../services/api';
import { HealthResponse } from '../types';
import { Activity, CheckCircle2, XCircle, RefreshCw, Server, Laptop, ShieldCheck } from 'lucide-react';

export const HomePage: React.FC = () => {
  const [apiStatus, setApiStatus] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await checkApiHealth();
      setApiStatus(data);
    } catch (err: any) {
      setError(err.message || 'Could not connect to backend server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-8">
      {/* Title & Tagline */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold tracking-wide uppercase">
          <ShieldCheck className="w-3.5 h-3.5" /> Step 1: Foundation Mode
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white">
          CRED BRIDGE
        </h1>
        <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto font-light">
          "Financial verification infrastructure for the gig economy."
        </p>
      </div>

      {/* System Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Frontend Status */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Laptop className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-200">Frontend Status</h3>
                <p className="text-xs text-slate-500">React + Vite Shell</p>
              </div>
            </div>
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" /> Connected
            </span>
          </div>
          <div className="text-xs text-slate-400 bg-slate-950/60 p-3 rounded-lg border border-slate-800/60 font-mono">
            <div>URL: http://localhost:5173</div>
            <div>Router: React Router v6 Active</div>
          </div>
        </div>

        {/* Backend API Status */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-200">Backend API Status</h3>
                <p className="text-xs text-slate-500">FastAPI REST Core</p>
              </div>
            </div>
            {loading ? (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-medium animate-pulse">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Checking
              </span>
            ) : error ? (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 text-xs font-medium">
                <XCircle className="w-3.5 h-3.5" /> Disconnected
              </span>
            ) : (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" /> {apiStatus?.status}
              </span>
            )}
          </div>

          <div className="text-xs text-slate-400 bg-slate-950/60 p-3 rounded-lg border border-slate-800/60 font-mono space-y-1">
            <div>Target Endpoint: GET /api/v1/health</div>
            {error ? (
              <div className="text-rose-400 font-semibold">{error}</div>
            ) : (
              <div>Service: {apiStatus?.service || 'credbridge-api'}</div>
            )}
          </div>

          <button
            onClick={fetchHealth}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Connection
          </button>
        </div>
      </div>

      {/* Overview Card */}
      <div className="p-6 rounded-2xl bg-indigo-950/20 border border-indigo-900/40 space-y-3">
        <h4 className="text-sm font-semibold text-indigo-300">Development Setup Complete</h4>
        <p className="text-xs text-slate-400 leading-relaxed">
          CredBridge Step 1 architecture is now ready. Navigation routes for Worker and Lender portals are prepared in the navigation bar above. Real database integration, AI scoring, and Account Aggregator data streams will be connected in subsequent steps.
        </p>
      </div>
    </div>
  );
};
