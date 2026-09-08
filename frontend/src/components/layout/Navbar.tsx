import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldCheck, LogIn, UserPlus } from 'lucide-react';
import { Button } from '../ui/Button';

export const Navbar: React.FC = () => {
  const location = useLocation();

  return (
    <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-white hover:opacity-90 transition">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <span>CRED<span className="text-indigo-400">BRIDGE</span></span>
        </Link>

        {/* Navigation CTAs */}
        <div className="flex items-center gap-3">
          <Link to="/login">
            <Button variant="ghost" size="sm" icon={<LogIn className="w-4 h-4" />}>
              Sign In
            </Button>
          </Link>
          <Link to="/register">
            <Button variant="primary" size="sm" icon={<UserPlus className="w-4 h-4" />}>
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};
