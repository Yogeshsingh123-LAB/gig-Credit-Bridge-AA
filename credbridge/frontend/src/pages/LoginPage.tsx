import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, CheckCircle2, Lock, ArrowRight, Building2, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showLenderAuth, setShowLenderAuth] = useState(false);
  const [lenderEmail, setLenderEmail] = useState('priya.lender@example.com');
  const [lenderPassword, setLenderPassword] = useState('Password123!');
  const [selectedDemoProfile, setSelectedDemoProfile] = useState<'ravi' | 'sandip'>('ravi');

  const { loginWithDigiLocker, login } = useAuth();
  const navigate = useNavigate();

  const handleDigiLockerAuth = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const payload = selectedDemoProfile === 'ravi'
        ? {
            name: 'Ravi Kumar',
            masked_aadhaar: 'XXXXXXXX4821',
            is_new_user: false,
            phone: '+91 98765 43210',
            city: 'Bengaluru',
            occupation: 'Gig Delivery Partner'
          }
        : {
            name: 'Sandip Roy',
            masked_aadhaar: 'XXXXXXXX9182',
            is_new_user: true,
            phone: '+91 98111 22334',
            city: 'Mumbai',
            occupation: 'Rideshare Driver'
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

  const handleLenderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const role = await login(lenderEmail.trim(), lenderPassword);
      if (role === 'LENDER') {
        navigate('/lender/dashboard');
      } else if (role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/worker/dashboard');
      }
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Lender sign-in failed. Check credentials.';
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-md w-full space-y-6 bg-slate-900/90 backdrop-blur-sm p-8 rounded-2xl border border-slate-800 shadow-2xl shadow-emerald-950/20">
        
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 mb-3">
            <ShieldCheck className="w-8 h-8 text-slate-950 stroke-[2.5]" />
          </div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Government DigiLocker Authentication</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
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

        {!showLenderAuth ? (
          /* Simplified Worker DigiLocker Auth Flow */
          <div className="space-y-5">
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Verification Identity</span>
                <span className="text-[10px] text-emerald-400 font-normal">Aadhaar Verified</span>
              </div>

              {/* Demo Profile Selector for evaluation */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedDemoProfile('ravi')}
                  className={`p-2.5 rounded-lg border text-left text-xs transition-all ${
                    selectedDemoProfile === 'ravi'
                      ? 'border-emerald-500 bg-emerald-500/10 text-white shadow-sm'
                      : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="font-semibold text-slate-200">Ravi Kumar</div>
                  <div className="text-[11px] text-slate-400">UID: •••• 4821</div>
                  <div className="text-[10px] text-emerald-400 mt-1">Existing Worker</div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedDemoProfile('sandip')}
                  className={`p-2.5 rounded-lg border text-left text-xs transition-all ${
                    selectedDemoProfile === 'sandip'
                      ? 'border-emerald-500 bg-emerald-500/10 text-white shadow-sm'
                      : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="font-semibold text-slate-200">Sandip Roy</div>
                  <div className="text-[11px] text-slate-400">UID: •••• 9182</div>
                  <div className="text-[10px] text-teal-400 mt-1">New Worker</div>
                </button>
              </div>

              <div className="space-y-1.5 pt-1 text-[11px] text-slate-400">
                <div className="flex items-center space-x-2 text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>No passwords or OTPs required</span>
                </div>
                <div className="flex items-center space-x-2 text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Tamper-evident Aadhaar identity matching</span>
                </div>
                <div className="flex items-center space-x-2 text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Full control over bank account consent</span>
                </div>
              </div>
            </div>

            {/* Primary Worker CTA */}
            <button
              id="digilocker-auth-btn"
              type="button"
              onClick={handleDigiLockerAuth}
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 font-bold text-slate-950 text-sm shadow-xl shadow-emerald-500/25 transition-all transform active:scale-[0.99] flex items-center justify-center space-x-2.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Verifying via DigiLocker...</span>
                </>
              ) : (
                <>
                  <div className="w-5 h-5 rounded-md bg-slate-950/20 flex items-center justify-center">
                    <Lock className="w-3.5 h-3.5 text-slate-950" />
                  </div>
                  <span>Continue with DigiLocker</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </button>

            {/* Public report verification link */}
            <div className="text-center pt-2">
              <Link
                to="/verify/report"
                className="text-xs text-slate-400 hover:text-emerald-400 transition-colors inline-flex items-center space-x-1"
              >
                <span>Have a Report ID?</span>
                <span className="text-emerald-400 font-medium underline underline-offset-2">Verify Public Report Integrity</span>
              </Link>
            </div>

            {/* Discreet Lender Access Toggle */}
            <div className="pt-3 border-t border-slate-800 text-center">
              <button
                type="button"
                onClick={() => setShowLenderAuth(true)}
                className="text-xs text-slate-500 hover:text-slate-300 transition-colors inline-flex items-center space-x-1.5"
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Are you an institutional lender? Access Lender Portal</span>
              </button>
            </div>
          </div>
        ) : (
          /* Secondary Lender Portal Sign-In */
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 flex items-center justify-between">
              <span>Institutional Lender Access</span>
              <button
                type="button"
                onClick={() => setShowLenderAuth(false)}
                className="text-xs text-slate-400 hover:text-white underline"
              >
                Back to Worker DigiLocker
              </button>
            </div>

            <form onSubmit={handleLenderSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1">
                  Lender Email
                </label>
                <input
                  type="email"
                  required
                  value={lenderEmail}
                  onChange={(e) => setLenderEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-sm text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={lenderPassword}
                  onChange={(e) => setLenderPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-sm text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setLenderEmail('priya.lender@example.com');
                    setLenderPassword('Password123!');
                  }}
                  className="px-2 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 border border-slate-700"
                >
                  Fill Priya (Lender)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLenderEmail('admin@credbridge.com');
                    setLenderPassword('Admin@123456');
                  }}
                  className="px-2 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 border border-slate-700"
                >
                  Fill Admin
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 font-bold text-white text-sm transition-colors mt-2"
              >
                {isLoading ? 'Authenticating...' : 'Sign In as Lender / Admin'}
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};
