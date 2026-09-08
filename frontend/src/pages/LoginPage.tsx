import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowRight, AlertCircle, RefreshCw, UserCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';

interface DemoUserItem {
  index: number;
  name: string;
  masked_aadhaar: string;
  phone: string;
  city: string;
  occupation: string;
  pattern: string;
  platforms: string[];
}

const FALLBACK_DEMO_USERS: DemoUserItem[] = [
  { index: 1, name: "Aarav Sharma", masked_aadhaar: "XXXXXXXX1001", phone: "+91 98765 01001", city: "Bengaluru", occupation: "Delivery & Logistics Specialist", pattern: "stable", platforms: ["QuickRide", "FoodDash"] },
  { index: 2, name: "Rohan Patel", masked_aadhaar: "XXXXXXXX1002", phone: "+91 98765 01002", city: "Mumbai", occupation: "Rideshare Captain", pattern: "high_fluctuating", platforms: ["UrbanMove"] },
  { index: 3, name: "Vikram Kumar", masked_aadhaar: "XXXXXXXX1003", phone: "+91 98765 01003", city: "Delhi NCR", occupation: "Express Courier Partner", pattern: "low_consistent", platforms: ["ParcelGo"] },
  { index: 4, name: "Rahul Verma", masked_aadhaar: "XXXXXXXX1004", phone: "+91 98765 01004", city: "Hyderabad", occupation: "On-Demand Tasks Specialist", pattern: "upward_trend", platforms: ["TaskKart", "FoodDash"] },
  { index: 5, name: "Aditya Mehta", masked_aadhaar: "XXXXXXXX1005", phone: "+91 98765 01005", city: "Pune", occupation: "City Logistics Associate", pattern: "downward_trend", platforms: ["Local Delivery Services"] },
  { index: 6, name: "Karan Shah", masked_aadhaar: "XXXXXXXX1006", phone: "+91 98765 01006", city: "Ahmedabad", occupation: "Rideshare Captain", pattern: "volatile", platforms: ["QuickRide"] },
  { index: 7, name: "Nikhil Joshi", masked_aadhaar: "XXXXXXXX1007", phone: "+91 98765 01007", city: "Bengaluru", occupation: "Multi-Platform Delivery Executive", pattern: "multiple_sources", platforms: ["QuickRide", "FoodDash", "ParcelGo", "TaskKart"] },
  { index: 8, name: "Arjun Yadav", masked_aadhaar: "XXXXXXXX1008", phone: "+91 98765 01008", city: "Kolkata", occupation: "Transit Driver", pattern: "dominant_source", platforms: ["UrbanMove"] },
  { index: 9, name: "Manish Gupta", masked_aadhaar: "XXXXXXXX1009", phone: "+91 98765 01009", city: "Jaipur", occupation: "Food Delivery Specialist", pattern: "seasonal", platforms: ["FoodDash"] },
  { index: 10, name: "Sahil Desai", masked_aadhaar: "XXXXXXXX1010", phone: "+91 98765 01010", city: "Surat", occupation: "General Gig Partner", pattern: "mixed", platforms: ["QuickRide", "UrbanMove"] }
];

export const LoginPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [demoUsers, setDemoUsers] = useState<DemoUserItem[]>(FALLBACK_DEMO_USERS);
  const [selectedUserIndex, setSelectedUserIndex] = useState<number>(1);
  const [showStaffLogin, setShowStaffLogin] = useState(false);
  const [staffEmail, setStaffEmail] = useState('priya.lender@example.com');
  const [staffPassword, setStaffPassword] = useState('Password123!');

  const { loginWithDigiLocker, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Load 10 demo users from backend if available
    const fetchDemoUsers = async () => {
      try {
        const data = await apiService.getDemoUsers();
        if (Array.isArray(data) && data.length > 0) {
          setDemoUsers(data);
        }
      } catch (err) {
        // Fallback already configured
      }
    };
    fetchDemoUsers();
  }, []);

  const handleDigiLockerAuth = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const selected = demoUsers.find(u => u.index === selectedUserIndex) || demoUsers[0];
      const payload = {
        name: selected.name,
        masked_aadhaar: selected.masked_aadhaar,
        is_new_user: false,
        phone: selected.phone,
        city: selected.city,
        occupation: selected.occupation
      };

      const role = await loginWithDigiLocker(payload);
      if (role === 'WORKER') {
        navigate('/worker/dashboard');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      console.error('DigiLocker authentication failed:', err);
      const msg = err.response?.data?.detail || err.response?.data?.message || 'DigiLocker verification failed. Make sure the backend server is running.';
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setIsLoading(false);
    }
  };

  const handleStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const role = await login(staffEmail.trim(), staffPassword);
      if (role === 'LENDER') {
        navigate('/lender/dashboard');
      } else if (role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/worker/dashboard');
      }
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Staff sign-in failed. Check credentials.';
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setIsLoading(false);
    }
  };

  const selectedUser = demoUsers.find(u => u.index === selectedUserIndex) || demoUsers[0];

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-md w-full space-y-6 bg-slate-900/90 backdrop-blur-sm p-8 rounded-2xl border border-slate-800 shadow-2xl shadow-emerald-950/20">
        
        {/* Header Branding (Section 3) */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 mb-3">
            <ShieldCheck className="w-8 h-8 text-slate-950 stroke-[2.5]" />
          </div>
          
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Welcome to CredBridge
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed max-w-sm mx-auto">
            Your financial verification, powered by consent.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-400 text-sm flex items-start space-x-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed">{error}</div>
          </div>
        )}

        {!showStaffLogin ? (
          /* DigiLocker-Only Authentication (Sections 3, 5, 77) */
          <div className="space-y-5">
            {/* Demo Mode Identity Selection Banner */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-emerald-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>DigiLocker DEMO MODE</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">10 Synthetic Users</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block">
                  Select Demo Identity
                </label>
                <select
                  id="demo-user-selector"
                  value={selectedUserIndex}
                  onChange={(e) => setSelectedUserIndex(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  {demoUsers.map((u) => (
                    <option key={u.index} value={u.index}>
                      {u.index.toString().padStart(2, '0')}. {u.name} — {u.occupation} ({u.city})
                    </option>
                  ))}
                </select>
              </div>

              {/* Selected Worker Details Snapshot */}
              <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-[11px] space-y-1">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="font-semibold text-white">{selectedUser.name}</span>
                  <span className="font-mono text-emerald-400">{selectedUser.masked_aadhaar}</span>
                </div>
                <div className="text-slate-400 flex items-center justify-between">
                  <span>Profile: {selectedUser.pattern.replace('_', ' ')}</span>
                  <span className="text-slate-400">Sources: {selectedUser.platforms.join(', ')}</span>
                </div>
              </div>

              <p className="text-[10px] text-slate-400 italic">
                DEMO MODE — Synthetic Data. Never enter real government credentials or passwords.
              </p>
            </div>

            {/* Main Action Button (Section 3: [ Continue with DigiLocker ]) */}
            <button
              id="digilocker-login-btn"
              type="button"
              disabled={isLoading}
              onClick={handleDigiLockerAuth}
              className="w-full flex items-center justify-center space-x-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Authenticating with DigiLocker...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5" />
                  <span>Continue with DigiLocker</span>
                </>
              )}
            </button>

            {/* Reassurance text */}
            <div className="text-center pt-2 text-[11px] text-slate-400 space-y-1">
              <p>Passwordless • Government Identity Provider</p>
              <p>CredBridge never requests or stores DigiLocker passwords or OTPs.</p>
            </div>
          </div>
        ) : (
          /* Discreet Staff (Lender / Admin) Portal */
          <form onSubmit={handleStaffSubmit} className="space-y-4">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-1">
              <span className="text-xs font-bold text-white uppercase tracking-wider">Institutional Access</span>
              <p className="text-[11px] text-slate-400">Restricted to verified lenders & platform administrators.</p>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-400">Institutional Email</label>
              <input
                type="email"
                value={staffEmail}
                onChange={(e) => setStaffEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-400">Password</label>
              <input
                type="password"
                value={staffPassword}
                onChange={(e) => setStaffPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                required
              />
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setStaffEmail('priya.lender@example.com');
                  setStaffPassword('Password123!');
                }}
                className="text-[10px] px-2 py-1 rounded bg-slate-800 text-slate-300 hover:text-white"
              >
                Use Demo Lender
              </button>
              <button
                type="button"
                onClick={() => {
                  setStaffEmail('admin@credbridge.internal');
                  setStaffPassword('AdminPassword123!');
                }}
                className="text-[10px] px-2 py-1 rounded bg-slate-800 text-slate-300 hover:text-white"
              >
                Use Demo Admin
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors cursor-pointer"
            >
              {isLoading ? 'Verifying...' : 'Sign in as Institution'}
            </button>
          </form>
        )}

        {/* Discreet Switcher for Testing Lender & Admin */}
        <div className="text-center pt-2 border-t border-slate-800/80">
          <button
            type="button"
            onClick={() => setShowStaffLogin(!showStaffLogin)}
            className="text-[11px] text-slate-400 hover:text-slate-300 transition-colors cursor-pointer"
          >
            {showStaffLogin ? '← Back to Worker DigiLocker Login' : 'Lender / Institutional Access →'}
          </button>
        </div>

      </div>
    </div>
  );
};
