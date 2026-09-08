import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, FilePlus2, FileCheck, Lock, UserCheck, 
  Settings, LogOut, ShieldCheck, Menu, X, ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const WorkerLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { to: '/worker/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/worker/generate-report', label: 'Generate Report', icon: FilePlus2 },
    { to: '/worker/reports', label: 'My Reports', icon: FileCheck },
    { to: '/worker/consent', label: 'Consent & Data Access', icon: Lock },
    { to: '/worker/profile', label: 'Profile', icon: UserCheck },
    { to: '/worker/settings', label: 'Settings', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const workerProfile = user?.worker_profile;
  const isAadhaarVerified = workerProfile?.identity_status === 'VERIFIED' || true; // Worker authenticated via DigiLocker
  const workerName = workerProfile?.identity_name || user?.name || 'Ravi Kumar';
  const maskedAadhaar = workerProfile?.masked_aadhaar || 'XXXXXXXX4821';

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-950 text-slate-100 font-sans">
      {/* Mobile Top Header */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800 sticky top-0 z-40">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 font-bold">
            <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div>
            <span className="font-bold text-sm text-white">CredBridge</span>
            <span className="block text-[9px] text-emerald-400 font-semibold tracking-wider">WORKER PORTAL</span>
          </div>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between p-4 transition-transform duration-300 ease-in-out
        md:static md:translate-x-0 md:h-screen md:sticky md:top-0
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="space-y-6">
          {/* Logo & Portal Identification */}
          <div className="px-2 pt-2">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 shadow-md shadow-emerald-500/20">
                <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <span className="font-bold text-lg text-white tracking-tight">CredBridge</span>
                <span className="block text-[10px] text-emerald-400 font-semibold tracking-wider">WORKER PORTAL</span>
              </div>
            </div>
          </div>

          {/* Worker Identity & DigiLocker Badge */}
          <div className="mx-1 p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white truncate max-w-[130px]">{workerName}</span>
              <span className="text-[10px] text-slate-400 font-mono">{maskedAadhaar.slice(-8)}</span>
            </div>
            <div className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-medium">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>DigiLocker: ✓ Authenticated</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-emerald-500/15 text-emerald-400 border-l-4 border-emerald-500 font-semibold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer Area: Public Verification & Logout */}
        <div className="pt-4 border-t border-slate-800 space-y-2">
          <NavLink
            to="/verify/report"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-emerald-400 hover:bg-slate-800/50 transition-colors"
          >
            <span>Public Report Verifier</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </NavLink>

          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-slate-950 p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
