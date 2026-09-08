import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { User, Mail, Lock, UserPlus, Shield } from 'lucide-react';
import { UserRole } from '../../types/auth';

export const RegisterPage: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('Worker');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Phase 1 placeholder behavior
    if (role === 'Worker') {
      navigate('/worker/dashboard');
    } else {
      navigate('/lender/dashboard');
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center">
        <h2 className="text-xl font-bold text-white">Create CredBridge Account</h2>
        <p className="text-xs text-slate-400">Select your role to start building credit evidence</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Role Selector */}
        <div className="space-y-1.5 text-left">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
            I am registering as a
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole('Worker')}
              className={`p-3 rounded-xl border text-xs font-medium flex flex-col items-center gap-1.5 transition ${
                role === 'Worker'
                  ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-sm'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <User className="w-5 h-5 text-indigo-400" />
              <span>Gig Worker</span>
            </button>

            <button
              type="button"
              onClick={() => setRole('Lender')}
              className={`p-3 rounded-xl border text-xs font-medium flex flex-col items-center gap-1.5 transition ${
                role === 'Lender'
                  ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-sm'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <Shield className="w-5 h-5 text-indigo-400" />
              <span>Credit Assessor</span>
            </button>
          </div>
        </div>

        <Input
          label="Full Name"
          type="text"
          placeholder="Ramesh Kumar"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          icon={<User className="w-4 h-4" />}
          required
        />

        <Input
          label="Email Address"
          type="email"
          placeholder="ramesh@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={<Mail className="w-4 h-4" />}
          required
        />

        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          icon={<Lock className="w-4 h-4" />}
          required
        />

        <Input
          label="Confirm Password"
          type="password"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          icon={<Lock className="w-4 h-4" />}
          required
        />

        <div className="pt-2">
          <Button type="submit" className="w-full" icon={<UserPlus className="w-4 h-4" />}>
            Create Account
          </Button>
        </div>
      </form>

      <div className="pt-4 border-t border-slate-800 text-center text-xs text-slate-400">
        Already have an account?{' '}
        <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold transition">
          Sign In
        </Link>
      </div>
    </div>
  );
};
