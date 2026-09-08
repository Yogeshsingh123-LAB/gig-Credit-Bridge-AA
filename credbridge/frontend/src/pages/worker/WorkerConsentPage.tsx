import React, { useEffect, useState } from 'react';
import { Share2, Lock, ShieldCheck, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { apiService } from '../../services/api';
import { ConsentRecord } from '../../types';

export const WorkerConsentPage: React.FC = () => {
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [lenders, setLenders] = useState<any[]>([]);
  const [selectedLenderId, setSelectedLenderId] = useState('');
  const [durationDays, setDurationDays] = useState(30);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [cData, lData] = await Promise.all([
        apiService.getMyConsents(),
        apiService.getLendersList()
      ]);
      setConsents(cData);
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

  const handleGrant = async (e: React.FormEvent) => {
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

  const handleRevoke = async (consent_id: string) => {
    if (!confirm('Are you sure you want to revoke consent for this lender? Access will be blocked immediately.')) return;
    try {
      await apiService.revokeConsent(consent_id);
      setMessage('Consent revoked successfully.');
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to revoke consent.');
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Consent-Based Sharing Control</h1>
          <p className="text-sm text-slate-400">You decide which lenders can inspect your verified Credit Passport</p>
        </div>
        <div className="flex items-center space-x-2 text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
          <Lock className="w-4 h-4" />
          <span>Strict Access Enforcement</span>
        </div>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center space-x-2">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Grant Consent Form */}
      <form onSubmit={handleGrant} className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center space-x-2">
          <Share2 className="w-5 h-5 text-emerald-400" />
          <span>Grant Passport Access to Lender</span>
        </h3>

        {lenders.length === 0 ? (
          <p className="text-sm text-slate-400">No registered lenders available yet. Register a Lender account to test sharing.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-1">Select Registered Lender</label>
              <select
                value={selectedLenderId}
                onChange={(e) => setSelectedLenderId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-sm focus:border-emerald-500 outline-none"
              >
                {lenders.map((l) => (
                  <option key={l.lender_id} value={l.lender_id}>
                    {l.organization_name} — {l.contact_name} ({l.contact_email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-1">Duration</label>
              <select
                value={durationDays}
                onChange={(e) => setDurationDays(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-sm focus:border-emerald-500 outline-none"
              >
                <option value={7}>7 Days</option>
                <option value={30}>30 Days</option>
                <option value={90}>90 Days</option>
              </select>
            </div>

            <div className="md:col-span-3">
              <button
                type="submit"
                className="w-full py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-600/20 transition-all"
              >
                Grant Access Consent
              </button>
            </div>
          </div>
        )}
      </form>

      {/* Active & Revoked Consents List */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white">Sharing History & Active Access ({consents.length})</h3>
        {isLoading ? (
          <div className="py-12 text-center text-slate-400">Loading consent records...</div>
        ) : consents.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center text-slate-400">
            No active or past consents granted yet. Select a lender above to grant permission.
          </div>
        ) : (
          <div className="space-y-3">
            {consents.map((c) => (
              <div key={c.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-white text-base">{c.lender_organization || 'Lender Organization'}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      c.status === 'ACTIVE'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}>
                      {c.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Granted: {new Date(c.granted_at).toLocaleDateString('en-IN')} | Expires: {c.expires_at ? new Date(c.expires_at).toLocaleDateString('en-IN') : 'N/A'}
                  </p>
                </div>

                {c.status === 'ACTIVE' && (
                  <button
                    onClick={() => handleRevoke(c.id)}
                    className="px-4 py-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold transition-colors"
                  >
                    Revoke Access Immediately
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
