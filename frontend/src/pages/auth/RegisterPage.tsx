import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { User as UserIcon, Mail, Lock, UserPlus, Shield, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { UserRole } from '../../types/auth';
import { useAuth } from '../../hooks/useAuth';
import { isValidEmail, isValidPassword } from '../../utils/roleUtils';

export const RegisterPage: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'WORKER' | 'LENDER'>('WORKER');
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const { register, isLoading, authError, clearError } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    clearError();

    if (!fullName.trim()) {
      setValidationError('Full Name is required.');
      return;
    }

    if (!isValidEmail(email)) {
      setValidationError('Please enter a valid email address.');
      return;
    }

    if (!isValidPassword(password)) {
      setValidationError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setValidationError('Password confirmation does not match.');
      return;
    }

    try {
      await register({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        role: role as UserRole,
      });

      // Post-registration redirect to login with success state
      navigate('/login', { state: { registrationSuccess: true } });
    } catch (err: any) {
      // Handled by AuthContext state
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center">
        <h2 className="text-xl font-bold text-white">Create CredBridge Account</h2>
        <p className="text-xs text-slate-400">Select your role to start building credit evidence</p>
      </div>

      {(validationError || authError) && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{validationError || authError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Role Selector */}
        <div className="space-y-1.5 text-left">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
            I am registering as a
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole('WORKER')}
              className={`p-3 rounded-xl border text-xs font-medium flex flex-col items-center gap-1.5 transition ${
                role === 'WORKER'
                  ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-sm'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <UserIcon className="w-5 h-5 text-indigo-400" />
              <span>Gig Worker</span>
            </button>

            <button
              type="button"
              onClick={() => setRole('LENDER')}
              className={`p-3 rounded-xl border text-xs font-medium flex flex-col items-center gap-1.5 transition ${
                role === 'LENDER'
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
          icon={<UserIcon className="w-4 h-4" />}
          disabled={isLoading}
          required
        />

        <Input
          label="Email Address"
          type="email"
          placeholder="ramesh@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={<Mail className="w-4 h-4" />}
          disabled={isLoading}
          required
        />

        <div className="relative">
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="At least 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<Lock className="w-4 h-4" />}
            disabled={isLoading}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-[34px] text-slate-400 hover:text-slate-200 transition"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        <Input
          label="Confirm Password"
          type="password"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          icon={<Lock className="w-4 h-4" />}
          disabled={isLoading}
          required
        />

        <div className="pt-2">
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
            icon={<UserPlus className="w-4 h-4" />}
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
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
