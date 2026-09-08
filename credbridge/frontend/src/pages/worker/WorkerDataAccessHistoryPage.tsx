import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck, Lock, ArrowLeft, RefreshCw, Calendar,
  Clock, Shield, CheckCircle2
} from 'lucide-react';
import { apiService } from '../../services/api';
import { DataAccessAuditItem } from '../../types';

export const WorkerDataAccessHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<DataAccessAuditItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadAuditLogs();
  }, []);

  const loadAuditLogs = async () => {
    setIsLoading(true);
    try {
      const data = await apiService.getDataAccessAudit();
      setLogs(data);
    } catch (err) {
      console.error('Failed to load audit history:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-4 px-2 sm:px-4">
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <button
            onClick={() => navigate('/worker/dashboard')}
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Data Access History & Privacy Audit</h1>
          <p className="text-sm text-slate-400 mt-1">Immutable audit trail of all financial data requests and consent events.</p>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 mb-6 flex items-center space-x-3 text-xs text-slate-300">
        <Lock className="w-5 h-5 text-emerald-400 flex-shrink-0" />
        <span>Privacy Rule: Raw transaction records are analyzed in volatile memory and never exposed in public audit trails.</span>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
        </div>
      ) : logs.length === 0 ? (
        <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl">
          <Shield className="w-10 h-10 text-slate-600 mx-auto mb-2" />
          <p className="text-sm font-semibold text-white">No Activity Logged Yet</p>
          <p className="text-xs text-slate-400 mt-1">Start by verifying your identity or generating an income report.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {logs.map((item, index) => (
            <div
              key={item.id || index}
              className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
            >
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{item.description}</p>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">Action: {item.action}</p>
                </div>
              </div>
              <div className="text-right text-xs text-slate-500">
                <div className="flex items-center space-x-1 sm:justify-end">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{new Date(item.timestamp).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</span>
                </div>
                <span className="inline-block mt-1 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold">
                  {item.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
