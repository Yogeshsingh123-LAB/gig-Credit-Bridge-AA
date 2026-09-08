import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'WORKER' | 'LENDER'>('WORKER');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Client-side input validation
    if (name.trim().length < 2) {
      setError('Full name must be at least 2 characters long.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setIsLoading(true);
    try {
      await register(name.trim(), email.trim(), password, role);
      if (role === 'WORKER') navigate('/worker/dashboard');
      else navigate('/lender/dashboard');
    } catch (err: any) {
      if (!err.response) {
        setError('Unable to connect to backend server at http://localhost:8001. Please make sure backend is running.');
      } else {
        const detail = err.response?.data?.detail;
        let errorMsg = 'Registration failed. Please check your input details.';
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

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-md w-full space-y-8 bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-2xl">
        <div className="text-center">
          <div className="mx-auto w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 mb-4">
            <ShieldCheck className="w-7 h-7 text-slate-950 stroke-[2.5]" />
          </div>
          <h2 className="text-2xl font-bold text-white">Create your Account</h2>
          <p className="text-sm text-slate-400 mt-1">Join CredBridge as a Worker or Lender</p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          {/* Role Selection */}
          <div>
            <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-2">Select Account Role</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('WORKER')}
                className={`py-2.5 px-3 rounded-lg border text-sm font-semibold transition-all ${
                  role === 'WORKER'
                    ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                Gig Worker
              </button>
              <button
                type="button"
                onClick={() => setRole('LENDER')}
                className={`py-2.5 px-3 rounded-lg border text-sm font-semibold transition-all ${
                  role === 'LENDER'
                    ? 'bg-teal-600/20 border-teal-500 text-teal-400'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                Lender / Assessor
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-1">Full Name</label>
            <input
              type="text"
              required
              minLength={2}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ramesh Kumar"
              className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-800 focus:border-emerald-500 text-white text-sm outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-800 focus:border-emerald-500 text-white text-sm outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-1">
              Password <span className="text-[10px] text-slate-400 font-normal">(min. 8 characters)</span>
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters (e.g. Password123!)"
              className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-800 focus:border-emerald-500 text-white text-sm outline-none transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 font-bold text-slate-950 text-sm shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <UserPlus className="w-4 h-4" />
            <span>{isLoading ? 'Creating Account...' : 'Register Account'}</span>
          </button>
        </form>

        <p className="text-center text-xs text-slate-400">
          Already registered?{' '}
          <Link to="/login" className="text-emerald-400 font-semibold hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};
