import React, { useEffect, useState } from 'react';
import {
  Lock, ShieldCheck, CheckCircle2, XCircle, AlertTriangle,
  Building2, Calendar, FileText, ArrowRight, RefreshCw, Trash2
} from 'lucide-react';
import { apiService } from '../../services/api';
import { AAConsentRecord, ConsentRecord } from '../../types';

export const WorkerConsentPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'AA' | 'LENDERS'>('AA');
  const [aaConsents, setAaConsents] = useState<AAConsentRecord[]>([]);
  const [lenderConsents, setLenderConsents] = useState<ConsentRecord[]>([]);
  const [lenders, setLenders] = useState<any[]>([]);
  const [selectedLenderId, setSelectedLenderId] = useState('');
  const [durationDays, setDurationDays] = useState(30);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [aaData, cData, lData] = await Promise.all([
        apiService.getAAConsents(),
        apiService.getMyConsents(),
        apiService.getLendersList()
      ]);
      setAaConsents(aaData);
      setLenderConsents(cData);
      setLenders(lData);
      if (lData.length > 0) {
        setSelectedLenderId(lData[0].lender_id);
      }
    } catch (err) {
      console.error('Failed to load consent data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRevokeAAConsent = async (consentId: string) => {
    if (!window.confirm('Are you sure you want to revoke Account Aggregator consent? CredBridge will immediately terminate read-only access to this financial data.')) return;
    try {
      await apiService.revokeAAConsent(consentId);
      setMessage('Account Aggregator consent revoked successfully. Financial data access terminated.');
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to revoke AA consent.');
    }
  };

  const handleGrantLender = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLenderId) return;
    try {
      const res = await apiService.grantConsent(selectedLenderId, undefined, Number(durationDays));
      setMessage(res.message);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to grant consent.');
    }
  };

  const handleRevokeLender = async (consent_id: string) => {
    if (!window.confirm('Are you sure you want to revoke access for this lender? Access will be revoked immediately.')) return;
    try {
      await apiService.revokeConsent(consent_id);
      setMessage('Consent revoked successfully. Lender access blocked.');
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to revoke consent.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-2 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-2">
            <Lock className="w-3.5 h-3.5" />
            <span>Worker Consent Governance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Consent & Data Access</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Full visibility and real-time revocation rights over your authorized bank statements and institutional access.
          </p>
        </div>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-800 gap-6">
        <button
          onClick={() => setActiveTab('AA')}
          className={`pb-3 text-xs sm:text-sm font-semibold transition-all border-b-2 cursor-pointer ${
            activeTab === 'AA'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Account Aggregator (Bank Data Access)
        </button>
        <button
          onClick={() => setActiveTab('LENDERS')}
          className={`pb-3 text-xs sm:text-sm font-semibold transition-all border-b-2 cursor-pointer ${
            activeTab === 'LENDERS'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Authorized Lenders ({lenderConsents.filter(c => c.status === 'ACTIVE').length} Active)
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
        </div>
      ) : activeTab === 'AA' ? (
        /* TAB 1: Account Aggregator Consents */
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-white uppercase tracking-wider">Account Aggregator Protocol</span>
              <p className="text-xs text-slate-400">
                Data access is strictly read-only, time-bounded, and governed under the Reserve Bank of India (RBI) Account Aggregator framework.
              </p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold shrink-0">
              RBI AA Compliant
            </span>
          </div>

          <div className="space-y-3">
            {aaConsents.length === 0 ? (
              <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center text-xs text-slate-400">
                No Account Aggregator consents found.
              </div>
            ) : (
              aaConsents.map((c) => {
                const isActive = c.consent_status === 'ACTIVE' || (c.consent_status as string) === 'GRANTED';
                return (
                  <div
                    key={c.id}
                    className={`p-5 rounded-2xl border transition-all ${
                      isActive ? 'bg-slate-900 border-slate-800' : 'bg-slate-950/60 border-slate-800/80 opacity-75'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                          }`}>
                            {c.consent_status}
                          </span>
                          <span className="font-mono text-xs text-slate-400">{c.consent_handle}</span>
                        </div>
                        <h4 className="text-sm font-bold text-white">{c.purpose}</h4>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                          <span><strong>Provider:</strong> {c.provider}</span>
                          <span><strong>Accounts:</strong> {c.selected_accounts.join(', ')}</span>
                          {c.expires_at && <span><strong>Expires:</strong> {new Date(c.expires_at).toLocaleDateString()}</span>}
                        </div>
                      </div>

                      {isActive && (
                        <button
                          onClick={() => handleRevokeAAConsent(c.id)}
                          className="px-4 py-2 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Revoke Consent</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : (
        /* TAB 2: Lender Access */
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white">Grant Report Access to a New Lender</h3>
            <form onSubmit={handleGrantLender} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Select Lending Institution</label>
                <select
                  value={selectedLenderId}
                  onChange={(e) => setSelectedLenderId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  {lenders.map(l => (
                    <option key={l.lender_id} value={l.lender_id}>{l.company_name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Access Duration</label>
                <select
                  value={durationDays}
                  onChange={(e) => setDurationDays(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value={15}>15 Days</option>
                  <option value={30}>30 Days (Standard)</option>
                  <option value={60}>60 Days</option>
                  <option value={90}>90 Days</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-emerald-500/10 cursor-pointer"
                >
                  Authorize Lender Access
                </button>
              </div>
            </form>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white">Active & Past Lender Permissions</h3>
            {lenderConsents.length === 0 ? (
              <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center text-xs text-slate-400">
                No active lender authorizations found.
              </div>
            ) : (
              lenderConsents.map((c) => {
                const isActive = c.status === 'ACTIVE';
                return (
                  <div
                    key={c.id}
                    className={`p-5 rounded-2xl border transition-all ${
                      isActive ? 'bg-slate-900 border-slate-800' : 'bg-slate-950/60 border-slate-800/80 opacity-75'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <Building2 className="w-4 h-4 text-emerald-400" />
                          <span className="font-bold text-sm text-white">{c.lender_name}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                          }`}>
                            {c.status}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400">
                          <span>Scope: Verified Gig Income Report • </span>
                          <span>Granted: {new Date(c.granted_at).toLocaleDateString()} • </span>
                          <span>Expires: {c.expires_at ? new Date(c.expires_at).toLocaleDateString() : '30 Days'}</span>
                        </div>
                      </div>

                      {isActive && (
                        <button
                          onClick={() => handleRevokeLender(c.id)}
                          className="px-3.5 py-1.5 rounded-lg border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Revoke Access
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
