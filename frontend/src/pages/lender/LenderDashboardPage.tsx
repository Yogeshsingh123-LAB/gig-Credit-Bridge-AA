import React from 'react';
import { BarChart3 } from 'lucide-react';

export const LenderDashboardPage: React.FC = () => {
  return (
    <div className="max-w-xl mx-auto py-12 px-6 bg-slate-900/60 border border-slate-800 rounded-2xl shadow-xl text-center space-y-4">
      <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mx-auto text-indigo-400">
        <BarChart3 className="w-6 h-6" />
      </div>
      <h2 className="text-2xl font-bold text-white">Lender Dashboard</h2>
      <p className="text-xs text-slate-400">
        Placeholder for institutional analytics, portfolio metrics, and risk assessment feeds.
      </p>
      <div className="p-3 bg-slate-950/80 rounded-lg text-xs font-mono text-slate-500">
        Route: /lender/dashboard
      </div>
    </div>
  );
};
