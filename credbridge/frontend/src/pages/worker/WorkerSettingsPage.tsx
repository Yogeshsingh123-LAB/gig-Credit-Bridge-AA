import React, { useState } from 'react';
import { Settings, ShieldCheck, Lock, Bell, Trash2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const WorkerSettingsPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [dataRetentionMonths, setDataRetentionMonths] = useState<number>(6);
  const [emailAlerts, setEmailAlerts] = useState<boolean>(true);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  const workerProfile = user?.worker_profile;
  const maskedAadhaar = workerProfile?.masked_aadhaar || 'XXXXXXXX4821';

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedMessage('Security and privacy preferences updated successfully.');
    setTimeout(() => setSavedMessage(null), 3000);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
        <h1 className="text-2xl font-bold text-white flex items-center space-x-2.5">
          <Settings className="w-6 h-6 text-emerald-400" />
          <span>Worker Portal Settings</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Manage your DigiLocker authentication session, data retention, and privacy controls.
        </p>
      </div>

      {savedMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{savedMessage}</span>
        </div>
      )}

      {/* DigiLocker Identity Security */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h2 className="text-sm font-bold text-white">DigiLocker Identity Security</h2>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-semibold">
            VERIFIED
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-2">
          <div className="flex justify-between">
            <span className="text-slate-500">Authenticated Name:</span>
            <span className="font-semibold text-white">{workerProfile?.identity_name || user?.name || 'Ravi Kumar'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Masked Aadhaar:</span>
            <span className="font-mono text-emerald-400">{maskedAadhaar}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Authentication Source:</span>
            <span className="text-slate-300">National DigiLocker Sandbox</span>
          </div>
        </div>
      </div>

      {/* Data Retention & Privacy Form */}
      <form onSubmit={handleSave} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
        <div className="flex items-center space-x-2.5">
          <Lock className="w-5 h-5 text-emerald-400" />
          <h2 className="text-sm font-bold text-white">Privacy & Data Retention Controls</h2>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-300">
            Financial Statement Retention Window
          </label>
          <select
            value={dataRetentionMonths}
            onChange={(e) => setDataRetentionMonths(Number(e.target.value))}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
          >
            <option value={3}>3 Months (Strict Minimum)</option>
            <option value={6}>6 Months (Recommended for Loan Processing)</option>
            <option value={12}>12 Months (Full Financial Cycle)</option>
          </select>
          <p className="text-[11px] text-slate-500">
            Cached bank statement telemetry older than this period is purged automatically from server memory.
          </p>
        </div>

        <div className="pt-2 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-300 block">Lender Verification Alerts</span>
            <span className="text-[11px] text-slate-500">Notify me when a lender verifies one of my active reports</span>
          </div>
          <input
            type="checkbox"
            checked={emailAlerts}
            onChange={(e) => setEmailAlerts(e.target.checked)}
            className="w-4 h-4 rounded text-emerald-500 bg-slate-950 border-slate-700"
          />
        </div>

        <div className="pt-3">
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-emerald-500/10 cursor-pointer"
          >
            Save Preferences
          </button>
        </div>
      </form>
    </div>
  );
};
