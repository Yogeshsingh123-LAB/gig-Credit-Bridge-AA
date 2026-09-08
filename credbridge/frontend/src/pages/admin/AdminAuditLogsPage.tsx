import React, { useEffect, useState } from 'react';
import { ShieldAlert, Activity } from 'lucide-react';
import { apiService } from '../../services/api';
import { AuditLog } from '../../types';

export const AdminAuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadLogs = async () => {
      setIsLoading(true);
      try {
        const data = await apiService.getAdminAuditLogs();
        setLogs(data);
      } catch (err) {
        console.error('Failed to load audit logs:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadLogs();
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Security Audit Log Trail</h1>
          <p className="text-sm text-slate-400">Immutable audit record of authentication, data access, and consent changes</p>
        </div>
        <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-800 text-indigo-400 border border-slate-700">
          Total Logs: {logs.length}
        </span>
      </div>

      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
        {isLoading ? (
          <div className="py-12 text-center text-slate-400">Loading audit logs...</div>
        ) : logs.length === 0 ? (
          <div className="py-12 text-center text-slate-400">No audit logs recorded yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-6 py-3.5">Timestamp</th>
                  <th className="px-6 py-3.5">Action</th>
                  <th className="px-6 py-3.5">Entity Type</th>
                  <th className="px-6 py-3.5">User ID</th>
                  <th className="px-6 py-3.5">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-slate-400">
                      {new Date(log.created_at).toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-indigo-400">{log.action}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-300">{log.entity_type || 'SYSTEM'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-400">{log.user_id ? log.user_id.substring(0, 8) + '...' : 'System'}</td>
                    <td className="px-6 py-4 text-slate-400 max-w-xs truncate">{JSON.stringify(log.details || {})}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
