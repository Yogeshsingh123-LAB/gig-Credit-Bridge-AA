import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { ShieldCheck, User, Building, Activity } from 'lucide-react';

export const MainLayout: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-white hover:opacity-90 transition">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span>CRED<span className="text-indigo-400">BRIDGE</span></span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 text-xs sm:text-sm font-medium">
            <Link
              to="/"
              className={`px-3 py-1.5 rounded-md transition ${isActive('/') ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
            >
              Home / Health
            </Link>
            <Link
              to="/login"
              className={`px-3 py-1.5 rounded-md transition ${isActive('/login') ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
            >
              Login
            </Link>
            <div className="h-4 w-[1px] bg-slate-800 mx-1" />
            <Link
              to="/worker"
              className={`px-3 py-1.5 rounded-md transition ${isActive('/worker') ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
            >
              Worker Portal
            </Link>
            <Link
              to="/worker/dashboard"
              className={`px-3 py-1.5 rounded-md transition ${isActive('/worker/dashboard') ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
            >
              Worker Dash
            </Link>
            <Link
              to="/worker/passport"
              className={`px-3 py-1.5 rounded-md transition ${isActive('/worker/passport') ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
            >
              Passport
            </Link>
            <div className="h-4 w-[1px] bg-slate-800 mx-1" />
            <Link
              to="/lender"
              className={`px-3 py-1.5 rounded-md transition ${isActive('/lender') ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
            >
              Lender Portal
            </Link>
            <Link
              to="/lender/dashboard"
              className={`px-3 py-1.5 rounded-md transition ${isActive('/lender/dashboard') ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
            >
              Lender Dash
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>CredBridge Step 1 — Development Foundation</div>
          <div>React + Vite + TypeScript + FastAPI + SQLAlchemy</div>
        </div>
      </footer>
    </div>
  );
};
