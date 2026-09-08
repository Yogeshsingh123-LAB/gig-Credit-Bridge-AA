import React, { useEffect, useState } from 'react';
import { Layers, Plus, CheckCircle2, RefreshCw, Sparkles, Trash2 } from 'lucide-react';
import { apiService } from '../../services/api';
import { GigPlatform } from '../../types';

const SUPPORTED_PLATFORMS = [
  'Uber', 'Ola', 'Swiggy', 'Zomato', 'Blinkit', 'Zepto', 'Amazon', 'Urban Company'
];

export const WorkerPlatformsPage: React.FC = () => {
  const [platforms, setPlatforms] = useState<GigPlatform[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedPlatform, setSelectedPlatform] = useState(SUPPORTED_PLATFORMS[0]);
  const [accountIdentifier, setAccountIdentifier] = useState('');
  const [isGeneratingDemo, setIsGeneratingDemo] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const loadPlatforms = async () => {
    setIsLoading(true);
    try {
      const data = await apiService.getPlatforms();
      setPlatforms(data);
    } catch (err) {
      console.error('Failed to load platforms:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPlatforms();
  }, []);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountIdentifier) return;
    try {
      await apiService.connectPlatform(selectedPlatform, accountIdentifier);
      setAccountIdentifier('');
      setMessage(`Successfully connected ${selectedPlatform} (DEMO status).`);
      loadPlatforms();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to connect platform.');
    }
  };

  const handleGenerateDemo = async () => {
    setIsGeneratingDemo(true);
    setMessage(null);
    try {
      const res = await apiService.generateDemoData(6);
      setMessage(res.message);
      loadPlatforms();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to generate demo data.');
    } finally {
      setIsGeneratingDemo(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-900 p-6 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white">Gig Platform Connections</h1>
          <p className="text-sm text-slate-400">Connect your active earnings channels for evidence consolidation</p>
        </div>

        <button
          onClick={handleGenerateDemo}
          disabled={isGeneratingDemo}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-sm shadow-xl shadow-emerald-500/20 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4" />
          <span>{isGeneratingDemo ? 'Generating Transactions...' : 'Generate Demo Financial Data'}</span>
        </button>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center space-x-2">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Connect Form & Connected Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Connect Form */}
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center space-x-2">
            <Plus className="w-5 h-5 text-emerald-400" />
            <span>Connect Gig Platform</span>
          </h3>

          <form onSubmit={handleConnect} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-1">Select Platform</label>
              <select
                value={selectedPlatform}
                onChange={(e) => setSelectedPlatform(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-sm outline-none focus:border-emerald-500"
              >
                {SUPPORTED_PLATFORMS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-1">Account Identifier / ID</label>
              <input
                type="text"
                required
                value={accountIdentifier}
                onChange={(e) => setAccountIdentifier(e.target.value)}
                placeholder="e.g. driver_uber_88192"
                className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-sm outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold text-sm border border-slate-700 transition-colors"
            >
              Connect Platform (DEMO)
            </button>
          </form>
        </div>

        {/* Connected Platforms List */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-bold text-white">Active Connections ({platforms.length})</h3>
          {isLoading ? (
            <div className="py-12 text-center text-slate-400">Loading platforms...</div>
          ) : platforms.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center text-slate-400">
              No gig platforms connected yet. Select a platform on the left or click "Generate Demo Financial Data".
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {platforms.map((p) => (
                <div key={p.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white text-base">{p.platform_name}</span>
                    <p className="text-xs text-slate-400 mt-1">ID: {p.account_identifier}</p>
                    <span className="inline-block px-2 py-0.5 mt-2 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">
                      {p.connection_status}
                    </span>
                  </div>
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
