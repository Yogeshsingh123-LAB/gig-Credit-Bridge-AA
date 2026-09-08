import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Mail, Lock, LogIn, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { getDefaultRouteForRole, isValidEmail } from '../../utils/roleUtils';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const { login, isLoading, authError, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Check if navigated from registration success or protected route redirect
  const registrationSuccess = location.state?.registrationSuccess;
  const fromLocation = location.state?.from?.pathname;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    clearError();

    if (!email.trim() || !password) {
      setValidationError('Please enter both email address and password.');
      return;
    }

    if (!isValidEmail(email)) {
      setValidationError('Please enter a valid email address.');
      return;
    }

    try {
      const userRole = await login({ email: email.trim(), password });
      const targetRoute = fromLocation || getDefaultRouteForRole(userRole);
      navigate(targetRoute, { replace: true });
    } catch (err: any) {
      // Error handled by AuthContext state
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center">
        <h2 className="text-xl font-bold text-white">Sign In to CredBridge</h2>
        <p className="text-xs text-slate-400">Access your financial profile & verification workspace</p>
      </div>

      {/* Registration Success Banner */}
      {registrationSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 font-medium text-center">
          Account created successfully. Please sign in to continue.
        </div>
      )}

      {/* Validation or API Error Banner */}
      {(validationError || authError) && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{validationError || authError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email Address"
          type="email"
          placeholder="you@example.com"
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
            placeholder="••••••••"
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
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
            icon={<LogIn className="w-4 h-4" />}
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </Button>
        </div>
      </form>

      <div className="pt-4 border-t border-slate-800 text-center text-xs text-slate-400">
        Don't have an account?{' '}
        <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-semibold transition">
          Create Account
        </Link>
      </div>
    </div>
  );
};
