import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 relative font-sans">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Logo */}
      <div className="mb-8 text-center">
        <Link to="/" className="inline-flex items-center gap-2 text-2xl font-bold tracking-tight text-white hover:opacity-90 transition">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <span>CRED<span className="text-indigo-400">BRIDGE</span></span>
        </Link>
        <p className="text-xs text-slate-400 mt-2">
          Financial verification infrastructure for the gig economy
        </p>
      </div>

      {/* Auth Card Container */}
      <div className="w-full max-w-md bg-slate-900/80 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 backdrop-blur-md relative z-10">
        <Outlet />
      </div>

      {/* Footer Disclaimer */}
      <p className="mt-8 text-center text-xs text-slate-400">
        CredBridge is an assessment-support platform, not a lender.
      </p>
    </div>
  );
};
