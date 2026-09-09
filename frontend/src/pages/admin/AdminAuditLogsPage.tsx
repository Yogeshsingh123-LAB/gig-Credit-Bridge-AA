import React, { useEffect, useState } from 'react';
import {
  Clock, ShieldAlert, Filter, Search, Eye, CheckCircle2,
  AlertTriangle, ShieldCheck, Lock, Terminal, X, RefreshCw
} from 'lucide-react';
import { apiService } from '../../services/api';

interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: string;
  category: 'AUTHENTICATION' | 'DATA_ACCESS' | 'CONSENT' | 'SYSTEM' | 'SECURITY';
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  user_name: string;
  user_email: string;
  ip_address: string;
  details: Record<string, any>;
}

const DEMO_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'log_90182',
    timestamp: '2026-09-09 08:35:12 AM',
    action: 'ADMIN_SESSION_LOGIN',
    category: 'AUTHENTICATION',
    severity: 'INFO',
    user_name: 'Admin System',
    user_email: 'admin@credbridge.com',
    ip_address: '192.168.1.105',
    details: { auth_method: 'PASSWORD_HASH', session_duration_hours: 8, location: 'Bengaluru, IN' },
  },
  {
    id: 'log_90181',
    timestamp: '2026-09-09 08:14:02 AM',
    action: 'LENDER_CREDENTIALS_ISSUED',
    category: 'SECURITY',
    severity: 'INFO',
    user_name: 'Admin System',
    user_email: 'admin@credbridge.com',
    ip_address: '192.168.1.105',
    details: { organization: 'HDFC Bank Ltd.', appointed_email: 'risk.officer@hdfcbank.demo', api_key_generated: true },
  },
  {
    id: 'log_90180',
    timestamp: '2026-09-09 07:45:30 AM',
    action: 'INCOME_REPORT_VERIFIED',
    category: 'DATA_ACCESS',
    severity: 'INFO',
    user_name: 'HDFC Lending Officer',
    user_email: 'risk.officer@hdfcbank.demo',
    ip_address: '10.240.8.12',
    details: { report_id: 'CBR-2026-8A72K1', hash_check: 'MATCH', Ed25519_signature: 'VALID' },
  },
  {
    id: 'log_90179',
    timestamp: '2026-09-09 06:12:44 AM',
    action: 'DIGILOCKER_SESSION_CONFIRMED',
    category: 'AUTHENTICATION',
    severity: 'INFO',
    user_name: 'Aarav Sharma',
    user_email: 'aarav.sharma@demo.com',
    ip_address: '152.57.12.44',
    details: { masked_aadhaar: 'XXXX-XXXX-1234', verified_name: 'Aarav Sharma', status: 'SUCCESS' },
  },
  {
    id: 'log_90178',
    timestamp: '2026-09-08 11:40:19 PM',
    action: 'UNAUTHORIZED_ACCESS_ATTEMPT',
    category: 'SECURITY',
    severity: 'CRITICAL',
    user_name: 'Unknown User',
    user_email: 'attacker@suspicious.org',
    ip_address: '185.220.101.5',
    details: { target_endpoint: '/api/v1/admin/users', reason: 'INVALID_JWT_SIGNATURE', blocked: true },
  },
  {
    id: 'log_90177',
    timestamp: '2026-09-08 09:15:00 PM',
    action: 'AA_CONSENT_GRANTED',
    category: 'CONSENT',
    severity: 'INFO',
    user_name: 'Ananya Roy',
    user_email: 'ananya.roy@demo.com',
    ip_address: '152.58.90.11',
    details: { aa_provider: 'Finvu AA', purpose: 'LENDING_CREDIT_CHECK', duration_days: 30 },
  },
  {
    id: 'log_90176',
    timestamp: '2026-09-08 05:22:10 PM',
    action: 'RATE_LIMIT_EXCEEDED_WARNING',
    category: 'SYSTEM',
    severity: 'WARNING',
    user_name: 'ICICI Credit Admin',
    user_email: 'lending@icicibank.demo',
    ip_address: '10.240.9.88',
    details: { limit: '100 req/min', current_burst: 104, throttled: false },
  },
];

export const AdminAuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>(DEMO_AUDIT_LOGS);
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const data: any = await apiService.getAdminAuditLogs();
      let loaded: any[] = [];
      if (Array.isArray(data)) loaded = data;
      else if (data && Array.isArray(data.items)) loaded = data.items;
      else if (data && Array.isArray(data.logs)) loaded = data.logs;

      if (loaded.length > 0) {
        const formatted: AuditLogEntry[] = loaded.map((l: any, idx: number) => ({
          id: l.id || `log_api_${idx}`,
          timestamp: l.created_at ? new Date(l.created_at).toLocaleString('en-IN') : '2026-09-09 08:00 AM',
          action: l.action || 'SYSTEM_EVENT',
          category: l.category || 'SYSTEM',
          severity: l.severity || 'INFO',
          user_name: l.user_name || 'System User',
          user_email: l.user_email || l.user_id || 'system@credbridge.com',
          ip_address: l.ip_address || '127.0.0.1',
          details: l.details || {},
        }));
        setLogs(formatted);
      } else {
        setLogs(DEMO_AUDIT_LOGS);
      }
    } catch (err) {
      console.error('Failed to load audit logs, using demo audit trail:', err);
      setLogs(DEMO_AUDIT_LOGS);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // Filtered Logs
  const filteredLogs = logs.filter((l) => {
    const matchesCat = categoryFilter === 'ALL' || l.category === categoryFilter;
    const matchesSev = severityFilter === 'ALL' || l.severity === severityFilter;
    const searchLower = search.toLowerCase();
    const matchesSearch =
      !search ||
      l.action.toLowerCase().includes(searchLower) ||
      l.user_name.toLowerCase().includes(searchLower) ||
      l.user_email.toLowerCase().includes(searchLower) ||
      l.id.toLowerCase().includes(searchLower) ||
      l.ip_address.includes(searchLower);

    return matchesCat && matchesSev && matchesSearch;
  });

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-50 text-rose-700 border border-rose-200">
            ● CRITICAL
          </span>
        );
      case 'WARNING':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-50 text-amber-700 border border-amber-200">
            ▲ WARNING
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
            ✓ INFO
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-white border border-[#E4E4E7] rounded-3xl p-6 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#18181B] tracking-tight flex items-center gap-3">
            <Clock className="w-7 h-7 text-[#FF6600]" />
            Security Audit Trail & Activity Logs
          </h1>
          <p className="text-xs text-[#71717A] mt-1 font-medium">
            Cryptographically sealed, append-only record of authentication, data access, and administrative actions.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-2xl bg-slate-100 text-[#18181B] hover:bg-slate-200 text-xs font-bold transition-colors cursor-pointer"
        >
          <RefreshCw className="w-4 h-4 text-slate-600" />
          <span>Refresh Logs</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E4E4E7] rounded-2xl p-4 shadow-2xs">
          <span className="text-[10px] font-black uppercase tracking-wider text-[#71717A] block">Total Logs Recorded</span>
          <span className="text-2xl font-black text-[#18181B] mt-1 block">{logs.length}</span>
        </div>
        <div className="bg-white border border-[#E4E4E7] rounded-2xl p-4 shadow-2xs">
          <span className="text-[10px] font-black uppercase tracking-wider text-[#71717A] block">Critical Alerts</span>
          <span className="text-2xl font-black text-rose-600 mt-1 block">
            {logs.filter((l) => l.severity === 'CRITICAL').length}
          </span>
        </div>
        <div className="bg-white border border-[#E4E4E7] rounded-2xl p-4 shadow-2xs">
          <span className="text-[10px] font-black uppercase tracking-wider text-[#71717A] block">Data Access Events</span>
          <span className="text-2xl font-black text-indigo-600 mt-1 block">
            {logs.filter((l) => l.category === 'DATA_ACCESS').length}
          </span>
        </div>
        <div className="bg-white border border-[#E4E4E7] rounded-2xl p-4 shadow-2xs">
          <span className="text-[10px] font-black uppercase tracking-wider text-[#71717A] block">Authentication Events</span>
          <span className="text-2xl font-black text-emerald-600 mt-1 block">
            {logs.filter((l) => l.category === 'AUTHENTICATION').length}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-[#E4E4E7] rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-2xs">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by action name, user, email, IP, or log ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs font-semibold text-[#18181B] placeholder-slate-400 focus:outline-none focus:border-[#FF6600]"
          />
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto justify-end">
          <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-[#18181B]">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-transparent text-[#18181B] focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              <option value="AUTHENTICATION">Authentication</option>
              <option value="DATA_ACCESS">Data Access</option>
              <option value="CONSENT">Consent</option>
              <option value="SECURITY">Security</option>
              <option value="SYSTEM">System</option>
            </select>
          </div>

          <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-[#18181B]">
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-transparent text-[#18181B] focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Severities</option>
              <option value="INFO">Info</option>
              <option value="WARNING">Warning</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Audit Trail Table */}
      <div className="bg-white border border-[#E4E4E7] rounded-3xl overflow-hidden shadow-2xs">
        {isLoading ? (
          <div className="py-16 text-center text-slate-400 text-xs font-bold">Loading security audit trail...</div>
        ) : filteredLogs.length === 0 ? (
          <div className="py-16 text-center px-4">
            <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-[#18181B]">No audit logs match your search</h3>
            <p className="text-xs text-[#71717A] mt-1">Try clearing your filters or changing search keywords.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-semibold text-[#18181B]">
              <thead className="bg-[#FAF9F6] border-b border-[#E4E4E7] text-[10px] font-black uppercase tracking-wider text-[#71717A]">
                <tr>
                  <th className="px-6 py-4">Timestamp</th>
                  <th className="px-6 py-4">Action Event</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Severity</th>
                  <th className="px-6 py-4">User / Email</th>
                  <th className="px-6 py-4">IP Address</th>
                  <th className="px-6 py-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E4E7] font-mono text-[11px]">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-[#71717A] font-sans font-medium whitespace-nowrap">
                      {log.timestamp}
                    </td>
                    <td className="px-6 py-4 font-bold text-[#FF6600]">
                      {log.action}
                    </td>
                    <td className="px-6 py-4 font-sans text-xs">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold text-[10px]">
                        {log.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-sans">
                      {getSeverityBadge(log.severity)}
                    </td>
                    <td className="px-6 py-4 font-sans">
                      <div>
                        <span className="font-bold text-[#18181B] block">{log.user_name}</span>
                        <span className="text-[10px] text-[#71717A] font-mono block">{log.user_email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{log.ip_address}</td>
                    <td className="px-6 py-4 text-right font-sans">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="px-3 py-1.5 rounded-xl bg-[#FFF0E6] text-[#FF6600] hover:bg-[#FFE2D1] text-xs font-bold transition-colors cursor-pointer"
                      >
                        View JSON
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* JSON PAYLOAD MODAL */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white border border-[#E4E4E7] rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E4E4E7] pb-3">
              <div className="flex items-center space-x-2">
                <Terminal className="w-5 h-5 text-[#FF6600]" />
                <h3 className="text-sm font-black text-[#18181B]">{selectedLog.action}</h3>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-[#71717A] text-[11px] font-mono">
                <span>LOG ID: {selectedLog.id}</span>
                <span>{selectedLog.timestamp}</span>
              </div>

              <div className="p-4 bg-slate-950 text-slate-200 font-mono rounded-2xl border border-slate-800 text-xs overflow-x-auto max-h-64">
                <pre>{JSON.stringify(selectedLog.details, null, 2)}</pre>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
