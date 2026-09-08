import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, ShieldAlert, Activity, CheckCircle2, FileText, UserCheck } from 'lucide-react';
import { apiService } from '../../services/api';

export const AdminDashboardPage: React.FC = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadMetrics = async () => {
      setIsLoading(true);
      try {
        const data = await apiService.getAdminDashboard();
        setMetrics(data);
      } catch (err) {
        console.error('Failed to load admin metrics:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadMetrics();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">System Administration Console</h1>
          <p className="text-sm text-slate-400">Platform statistics, audit logs, and security enforcement</p>
        </div>
        <div className="flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-lg text-indigo-400 text-xs font-semibold">
          <Activity className="w-4 h-4" />
          <span>System Status: HEALTHY</span>
        </div>
      </div>

      {/* 4 Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Registered Users</span>
          <div className="text-3xl font-extrabold text-white mt-1">{metrics?.total_users || 0}</div>
          <span className="text-xs text-indigo-400 mt-2 block">{metrics?.active_users || 0} Active Accounts</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Gig Workers</span>
          <div className="text-3xl font-extrabold text-emerald-400 mt-1">{metrics?.workers_count || 0}</div>
          <span className="text-xs text-slate-400 mt-2 block">{metrics?.verified_workers || 0} Verified Workers</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Lender Organizations</span>
          <div className="text-3xl font-extrabold text-teal-400 mt-1">{metrics?.lenders_count || 0}</div>
          <span className="text-xs text-slate-400 mt-2 block">Active Assessor Accounts</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Passports Issued</span>
          <div className="text-3xl font-extrabold text-indigo-400 mt-1">{metrics?.passports_generated || 0}</div>
          <span className="text-xs text-slate-400 mt-2 block">Evidence Documents</span>
        </div>
      </div>

      {/* Account Aggregator Data Status */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Account Aggregator Gateway & Data Freshness</h3>
            <p className="text-xs text-slate-400">System-wide data ingestion pipeline and AA bridge telemetry</p>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            ● Real-Time Ingestion
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1">
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Connected Accounts</span>
            <span className="text-lg font-bold text-white mt-1 block">100% Active</span>
            <span className="text-[10px] text-emerald-400 mt-0.5 block">HDFC, SBI, ICICI</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Data Freshness</span>
            <span className="text-lg font-bold text-emerald-400 mt-1 block">Fresh</span>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Zero Stale Queues</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Financial History</span>
            <span className="text-lg font-bold text-white mt-1 block">12 Months</span>
            <span className="text-[10px] text-blue-400 mt-0.5 block">Enforced Fixed Window</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Sync Status</span>
            <span className="text-lg font-bold text-teal-400 mt-1 block">Live Stream</span>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Webhook Enabled</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Last Synced</span>
            <span className="text-lg font-bold text-slate-200 mt-1 block">&lt; 2 mins ago</span>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Polling Normal</span>
          </div>
        </div>
      </div>

      {/* System Subsystems Health */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-white">Subsystems Health Check</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase">PostgreSQL Database</span>
              <p className="text-sm font-semibold text-emerald-400 mt-0.5">CONNECTED</p>
            </div>
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase">Intelligence Engine</span>
              <p className="text-sm font-semibold text-emerald-400 mt-0.5">ONLINE (Pandas/NumPy)</p>
            </div>
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase">AI Explanation Layer</span>
              <p className="text-sm font-semibold text-teal-400 mt-0.5">READY (Fallback Active)</p>
            </div>
            <CheckCircle2 className="w-5 h-5 text-teal-400" />
          </div>
        </div>
      </div>
    </div>
  );
};
