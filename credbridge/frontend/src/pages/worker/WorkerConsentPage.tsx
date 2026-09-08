import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

  const [consentAgreed, setConsentAgreed] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="max-w-5xl mx-auto py-2 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-2">
            <Lock className="w-3.5 h-3.5" />
            <span>Worker Consent Governance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Financial Data Consent</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Explicit, informed worker consent is required before CredBridge retrieves any financial statements.
          </p>
        </div>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Primary Financial Data Consent Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-emerald-500/30 shadow-xl shadow-emerald-950/20 space-y-6">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Explicit Financial Data Authorization</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Review what data CredBridge accesses, what is never stored, and what gets produced.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 1. What data is accessed */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-200 uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>What Is Accessed</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              12 months of observed bank statements via RBI-regulated Account Aggregator (AA) network for authorized accounts only.
            </p>
          </div>

          {/* 2. What data is NOT stored */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-200 uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-blue-400"></span>
              <span>What Is NOT Stored</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              CredBridge never stores raw bank statements, transaction logs, account passwords, credentials, or actual bank balances.
            </p>
          </div>

          {/* 3. What is generated & stored */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-200 uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-teal-400"></span>
              <span>What Is Stored</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Only the standardized Verified Gig Income Report summary and its tamper-evident SHA-256 cryptographic hash.
            </p>
          </div>
        </div>

        {/* Consent Declaration Statement & Checkbox */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-3">
          <label className="flex items-start space-x-3 cursor-pointer">
            <input
              type="checkbox"
              id="consent-checkbox"
              checked={consentAgreed}
              onChange={(e) => setConsentAgreed(e.target.checked)}
              className="mt-1 w-4 h-4 rounded text-emerald-500 bg-slate-900 border-slate-700 focus:ring-emerald-500 cursor-pointer"
            />
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-200 block">
                I authorize CredBridge to retrieve and analyze my financial data for the last 12 months for the sole purpose of generating a Verified Gig Income Report.
              </span>
              <span className="text-[11px] text-slate-400 block">
                I understand that this consent is revocable at any time and that my data is handled under end-to-end cryptographic integrity.
              </span>
            </div>
          </label>
        </div>

        {/* Action Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <span className="text-xs text-slate-400">
            Next: Select authorized bank accounts to include in the 12-month analysis.
          </span>
          <button
            type="button"
            id="consent-continue-btn"
            disabled={!consentAgreed}
            onClick={() => navigate('/worker/bank-accounts')}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center space-x-2 cursor-pointer"
          >
            <span>Continue to Bank Accounts</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Secondary Consent Governance Section */}
      <div className="pt-4">
        <h3 className="text-sm font-bold text-white mb-3">Active Consents & Governance</h3>
      </div>

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
