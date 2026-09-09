import React, { useState } from 'react';
import {
  Settings, Shield, Lock, Bell, Server, Check, Save, Key,
  Sliders, AlertTriangle, RefreshCw
} from 'lucide-react';

export const AdminSettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'security' | 'integrations' | 'notifications' | 'maintenance'>('security');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Security Form State
  const [securityForm, setSecurityForm] = useState({
    enforce2FA: true,
    sessionTimeoutMinutes: '60',
    minPasswordLength: '8',
    maxLoginAttempts: '5',
    rateLimitRequestsPerMin: '100',
  });

  // Integrations Form State
  const [integrationsForm, setIntegrationsForm] = useState({
    digilockerClientId: 'DL_LIVE_CREDBRIDGE_90812',
    aaGatewayEnvironment: 'SANDBOX',
    pdfRetentionDays: '90',
  });

  // Notifications Form State
  const [notificationsForm, setNotificationsForm] = useState({
    adminEmailAlerts: true,
    lenderActivityWebhooks: true,
    securityThresholdAlerts: true,
    adminNotificationEmail: 'admin@credbridge.com',
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-white border border-[#E4E4E7] rounded-3xl p-6 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#18181B] tracking-tight flex items-center gap-3">
            <Settings className="w-7 h-7 text-[#FF6600]" />
            Admin Platform Settings
          </h1>
          <p className="text-xs text-[#71717A] mt-1 font-medium">
            Configure system security parameters, API keys, notification webhooks, and maintenance options.
          </p>
        </div>

        {savedSuccess && (
          <div className="px-4 py-2 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center space-x-2 animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Settings Saved Successfully!</span>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-[#E4E4E7] flex space-x-6">
        {[
          { id: 'security', label: 'Security & Auth', icon: Shield },
          { id: 'integrations', label: 'Platform Integrations', icon: Key },
          { id: 'notifications', label: 'Notifications & Webhooks', icon: Bell },
          { id: 'maintenance', label: 'System Maintenance', icon: Server },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'text-[#FF6600] border-b-2 border-[#FF6600]'
                  : 'text-[#71717A] hover:text-[#18181B]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: SECURITY & AUTH */}
      {activeTab === 'security' && (
        <form onSubmit={handleSave} className="bg-white border border-[#E4E4E7] rounded-3xl p-6 shadow-2xs space-y-6">
          <h3 className="text-sm font-black text-[#18181B] border-b border-[#E4E4E7] pb-3 flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#FF6600]" />
            Authentication & Security Policies
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div>
              <label className="block font-bold text-[#18181B] mb-1">Session Timeout (Minutes)</label>
              <input
                type="number"
                value={securityForm.sessionTimeoutMinutes}
                onChange={(e) => setSecurityForm({ ...securityForm, sessionTimeoutMinutes: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-semibold text-[#18181B] focus:outline-none focus:border-[#FF6600]"
              />
            </div>

            <div>
              <label className="block font-bold text-[#18181B] mb-1">Max Failed Login Attempts</label>
              <input
                type="number"
                value={securityForm.maxLoginAttempts}
                onChange={(e) => setSecurityForm({ ...securityForm, maxLoginAttempts: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-semibold text-[#18181B] focus:outline-none focus:border-[#FF6600]"
              />
            </div>

            <div>
              <label className="block font-bold text-[#18181B] mb-1">Rate Limit Threshold (Requests / Min)</label>
              <input
                type="number"
                value={securityForm.rateLimitRequestsPerMin}
                onChange={(e) => setSecurityForm({ ...securityForm, rateLimitRequestsPerMin: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-semibold text-[#18181B] focus:outline-none focus:border-[#FF6600]"
              />
            </div>

            <div>
              <label className="block font-bold text-[#18181B] mb-1">Minimum Password Length</label>
              <input
                type="number"
                value={securityForm.minPasswordLength}
                onChange={(e) => setSecurityForm({ ...securityForm, minPasswordLength: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-semibold text-[#18181B] focus:outline-none focus:border-[#FF6600]"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-[#E4E4E7] flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-2xl bg-[#FF6600] text-white font-bold text-xs hover:bg-[#e55c00] transition-colors flex items-center space-x-2 cursor-pointer shadow-2xs"
            >
              <Save className="w-4 h-4" />
              <span>Save Security Settings</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: INTEGRATIONS */}
      {activeTab === 'integrations' && (
        <form onSubmit={handleSave} className="bg-white border border-[#E4E4E7] rounded-3xl p-6 shadow-2xs space-y-6">
          <h3 className="text-sm font-black text-[#18181B] border-b border-[#E4E4E7] pb-3 flex items-center gap-2">
            <Key className="w-4 h-4 text-[#FF6600]" />
            Identity & Account Aggregator Gateway Config
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div>
              <label className="block font-bold text-[#18181B] mb-1">DigiLocker Integration Client ID</label>
              <input
                type="text"
                value={integrationsForm.digilockerClientId}
                onChange={(e) => setIntegrationsForm({ ...integrationsForm, digilockerClientId: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-mono text-[#18181B] focus:outline-none focus:border-[#FF6600]"
              />
            </div>

            <div>
              <label className="block font-bold text-[#18181B] mb-1">Account Aggregator Mode</label>
              <select
                value={integrationsForm.aaGatewayEnvironment}
                onChange={(e) => setIntegrationsForm({ ...integrationsForm, aaGatewayEnvironment: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-semibold text-[#18181B] focus:outline-none focus:border-[#FF6600]"
              >
                <option value="SANDBOX">Sandbox / Simulation Rail</option>
                <option value="PRODUCTION">Production Live RBI-AA Rail</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-[#E4E4E7] flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-2xl bg-[#FF6600] text-white font-bold text-xs hover:bg-[#e55c00] transition-colors flex items-center space-x-2 cursor-pointer shadow-2xs"
            >
              <Save className="w-4 h-4" />
              <span>Save Integration Settings</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: NOTIFICATIONS */}
      {activeTab === 'notifications' && (
        <form onSubmit={handleSave} className="bg-white border border-[#E4E4E7] rounded-3xl p-6 shadow-2xs space-y-6">
          <h3 className="text-sm font-black text-[#18181B] border-b border-[#E4E4E7] pb-3 flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#FF6600]" />
            Notification Channels & Webhooks
          </h3>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-[#18181B] mb-1">System Notification Admin Email</label>
              <input
                type="email"
                value={notificationsForm.adminNotificationEmail}
                onChange={(e) => setNotificationsForm({ ...notificationsForm, adminNotificationEmail: e.target.value })}
                className="w-full max-w-md bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-semibold text-[#18181B] focus:outline-none focus:border-[#FF6600]"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-[#E4E4E7] flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-2xl bg-[#FF6600] text-white font-bold text-xs hover:bg-[#e55c00] transition-colors flex items-center space-x-2 cursor-pointer shadow-2xs"
            >
              <Save className="w-4 h-4" />
              <span>Save Notification Preferences</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 4: MAINTENANCE */}
      {activeTab === 'maintenance' && (
        <div className="bg-white border border-[#E4E4E7] rounded-3xl p-6 shadow-2xs space-y-6">
          <h3 className="text-sm font-black text-[#18181B] border-b border-[#E4E4E7] pb-3 flex items-center gap-2">
            <Server className="w-4 h-4 text-[#FF6600]" />
            Database & Maintenance Controls
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="font-bold text-[#18181B] block">Flush Redis Caches</span>
              <span className="text-[#71717A] text-[11px] block">Clear cached API responses and session tokens.</span>
              <button
                type="button"
                onClick={() => alert('Redis caches flushed successfully.')}
                className="px-3.5 py-1.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Flush Cache
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="font-bold text-[#18181B] block">Database Backup</span>
              <span className="text-[#71717A] text-[11px] block">Trigger an immediate snapshot backup of PostgreSQL tables.</span>
              <button
                type="button"
                onClick={() => alert('PostgreSQL DB backup snapshot initiated.')}
                className="px-3.5 py-1.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Trigger Backup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
