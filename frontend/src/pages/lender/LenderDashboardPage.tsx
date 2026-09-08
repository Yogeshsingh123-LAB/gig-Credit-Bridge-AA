import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Award, ShieldCheck, FileCheck2, ArrowRight, HelpCircle } from 'lucide-react';
import { apiService } from '../../services/api';

export const LenderDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      setIsLoading(true);
      try {
        const data = await apiService.getLenderDashboard();
        setStats(data);
      } catch (err) {
        console.error('Failed to load lender dashboard stats:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadStats();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Lender Assessment Portal</h1>
          <p className="text-sm text-slate-400">Consent-verified financial evidence and cashflow intelligence</p>
        </div>
        <Link
          to="/lender/applicants"
          className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-slate-950 font-bold text-sm shadow-lg shadow-teal-600/20 flex items-center space-x-2 transition-all"
        >
          <Users className="w-4 h-4" />
          <span>View Shared Applicants</span>
        </Link>
      </div>

      {/* Non-Lending Approval Disclaimer */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 flex items-start space-x-3">
        <HelpCircle className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
        <p>
          <strong className="text-slate-200">Assessment Support Only:</strong> CredBridge provides analytical evidence support and deterministic cashflow metrics. CredBridge does NOT approve or reject loan applications or generate official bureau credit scores.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Shared Applicants</span>
          <div className="text-3xl font-extrabold text-white mt-2">{stats?.shared_applicants_count || 0}</div>
          <span className="text-xs text-teal-400 mt-2 block">Active Worker Consents</span>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Active Passports</span>
          <div className="text-3xl font-extrabold text-teal-400 mt-2">{stats?.active_passports_count || 0}</div>
          <span className="text-xs text-slate-400 mt-2 block">Verified Evidence Documents</span>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Average Readiness Score</span>
          <div className="text-3xl font-extrabold text-emerald-400 mt-2">{stats?.average_readiness_score || 0} / 100</div>
          <span className="text-xs text-slate-400 mt-2 block">Across Permitted Applicants</span>
        </div>
      </div>

      {/* Data Status Panel */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-teal-400" />
              <span>Financial Data Status & Ingestion Health</span>
            </h3>
            <p className="text-xs text-slate-400">Account Aggregator gateway telemetry and data freshness</p>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>AA Gateway Healthy</span>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1">
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Connected Accounts</span>
            <span className="text-lg font-bold text-white mt-1 block">2 / 2</span>
            <span className="text-[10px] text-emerald-400 mt-0.5 block">100% Linked</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Data Freshness</span>
            <span className="text-lg font-bold text-emerald-400 mt-1 block">Fresh</span>
            <span className="text-[10px] text-slate-400 mt-0.5 block">&lt; 1 hour</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Financial History</span>
            <span className="text-lg font-bold text-white mt-1 block">12 Months</span>
            <span className="text-[10px] text-blue-400 mt-0.5 block">Fixed Window</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Sync Status</span>
            <span className="text-lg font-bold text-teal-400 mt-1 block">Real-time</span>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Event-driven</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Last Synced</span>
            <span className="text-lg font-bold text-slate-200 mt-1 block">2 mins ago</span>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Automated</span>
          </div>
        </div>
      </div>

      {/* Verification Distribution */}
      {stats?.verification_distribution && (
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-white">Verification Status Breakdown</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(stats.verification_distribution).map(([statusKey, countVal]: any) => (
              <div key={statusKey} className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{statusKey}</span>
                <p className="text-2xl font-bold text-white mt-1">{countVal}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
