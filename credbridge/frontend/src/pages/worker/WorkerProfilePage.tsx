import React, { useEffect, useState } from 'react';
import { UserCheck, Save, CheckCircle2 } from 'lucide-react';
import { apiService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const WorkerProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [occupation, setOccupation] = useState('');
  const [experienceMonths, setExperienceMonths] = useState(0);
  const [completion, setCompletion] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  const loadProfile = async () => {
    setIsLoading(true);
    try {
      const data = await apiService.getProfile();
      setPhone(data.phone || '');
      setCity(data.city || '');
      setOccupation(data.occupation || '');
      setExperienceMonths(data.experience_months || 0);
      setCompletion(data.profile_completion || 0);
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiService.updateWorkerProfile({
        phone,
        city,
        occupation,
        experience_months: Number(experienceMonths)
      });
      setCompletion(res.profile_completion);
      setMessage('Worker profile updated successfully.');
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to update profile.');
    }
  };

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
        <h1 className="text-2xl font-bold text-white">Worker Profile Settings</h1>
        <p className="text-sm text-slate-400 mt-1">Manage personal demographic and gig experience metadata</p>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center space-x-2">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Completion Meter */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
        <div className="flex justify-between items-center text-xs font-semibold">
          <span className="text-slate-400 uppercase tracking-wider">Profile Completeness</span>
          <span className="text-emerald-400 font-bold">{completion}%</span>
        </div>
        <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500" style={{ width: `${completion}%` }} />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Full Name (Read Only)</label>
          <input
            type="text"
            disabled
            value={user?.name || ''}
            className="w-full px-4 py-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-slate-400 text-sm outline-none cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Email Address (Read Only)</label>
          <input
            type="text"
            disabled
            value={user?.email || ''}
            className="w-full px-4 py-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-slate-400 text-sm outline-none cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-1">Phone Number</label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+91 98765 43210"
            className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-sm focus:border-emerald-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-1">City</label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="e.g. Bengaluru"
            className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-sm focus:border-emerald-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-1">Primary Occupation / Gig Type</label>
          <input
            type="text"
            value={occupation}
            onChange={(e) => setOccupation(e.target.value)}
            placeholder="e.g. Delivery Partner / Rideshare Driver"
            className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-sm focus:border-emerald-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-1">Gig Experience (Months)</label>
          <input
            type="number"
            min="0"
            value={experienceMonths}
            onChange={(e) => setExperienceMonths(Number(e.target.value))}
            className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-sm focus:border-emerald-500 outline-none"
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-600/20 flex items-center justify-center space-x-2 transition-all"
        >
          <Save className="w-4 h-4" />
          <span>Save Profile Changes</span>
        </button>
      </form>
    </div>
  );
};
