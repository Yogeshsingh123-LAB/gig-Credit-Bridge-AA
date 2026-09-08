import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, LogIn, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const role = await login(email.trim(), password);
      if (role === 'WORKER') navigate('/worker/dashboard');
      else if (role === 'LENDER') navigate('/lender/dashboard');
      else if (role === 'ADMIN') navigate('/admin/dashboard');
    } catch (err: any) {
      if (!err.response) {
        setError('Unable to connect to backend server at http://localhost:8001. Please make sure backend is running.');
      } else {
        const detail = err.response?.data?.detail;
        let errorMsg = 'Invalid email or password.';
        if (typeof detail === 'string') {
          errorMsg = detail;
        } else if (Array.isArray(detail)) {
          errorMsg = detail.map((d: any) => d.msg || d.detail || JSON.stringify(d)).join(', ');
        } else if (err.response?.data?.message) {
          errorMsg = err.response.data.message;
        }
        setError(errorMsg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoFill = async (demoRole: 'WORKER' | 'LENDER' | 'ADMIN') => {
    if (demoRole === 'WORKER') {
      setEmail('ravi.worker@example.com');
      setPassword('Password123!');
    } else if (demoRole === 'LENDER') {
      setEmail('priya.lender@example.com');
      setPassword('Password123!');
    } else if (demoRole === 'ADMIN') {
      setEmail('admin@credbridge.com');
      setPassword('Admin@123456');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-md w-full space-y-8 bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-2xl">
        <div className="text-center">
          <div className="mx-auto w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 mb-4">
            <ShieldCheck className="w-7 h-7 text-slate-950 stroke-[2.5]" />
          </div>
          <h2 className="text-2xl font-bold text-white">Sign in to CredBridge</h2>
          <p className="text-sm text-slate-400 mt-1">Access verified financial readiness evidence</p>
        </div>

        {/* Demo Fill Quick Buttons */}
        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
          <div className="flex items-center space-x-1.5 text-xs text-emerald-400 font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Quick Demo Login Credentials</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleDemoFill('WORKER')}
              className="px-2 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition-colors"
            >
              Worker Demo
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill('LENDER')}
              className="px-2 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition-colors"
            >
              Lender Demo
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill('ADMIN')}
              className="px-2 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition-colors"
            >
              Admin Seed
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-white text-sm outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-white text-sm outline-none transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 font-bold text-slate-950 text-sm shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <LogIn className="w-4 h-4" />
            <span>{isLoading ? 'Authenticating...' : 'Sign In'}</span>
          </button>
        </form>

        <p className="text-center text-xs text-slate-400">
          Don't have an account?{' '}
          <Link to="/register" className="text-emerald-400 font-semibold hover:underline">
            Register as Worker or Lender
          </Link>
        </p>
      </div>
    </div>
  );
};
