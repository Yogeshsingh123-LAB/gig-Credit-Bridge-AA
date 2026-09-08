import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
  Layers,
  Receipt,
  ShieldCheck,
  Award,
  FileBadge,
  LogOut,
  Building2,
  Users,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export interface SidebarProps {
  role: 'worker' | 'lender' | 'admin';
}

export const Sidebar: React.FC<SidebarProps> = ({ role }) => {
  const location = useLocation();
  const { logout } = useAuth();

  const workerNav = [
    { label: 'Overview', path: '/worker', icon: LayoutDashboard },
    { label: 'Dashboard', path: '/worker/dashboard', icon: LayoutDashboard },
    { label: 'Profile', path: '/worker/profile', icon: User },
    { label: 'Platforms', path: '/worker/platforms', icon: Layers },
    { label: 'Transactions', path: '/worker/transactions', icon: Receipt },
    { label: 'Income Verification', path: '/worker/verification', icon: ShieldCheck },
    { label: 'Financial Readiness', path: '/worker/score', icon: Award },
    { label: 'Credit Passport', path: '/worker/passport', icon: FileBadge },
  ];

  const lenderNav = [
    { label: 'Overview', path: '/lender', icon: Building2 },
    { label: 'Lender Dashboard', path: '/lender/dashboard', icon: LayoutDashboard },
    { label: 'Applicant Assessment', path: '/lender/applicant', icon: Users },
  ];

  const adminNav = [
    { label: 'Overview', path: '/admin', icon: ShieldAlert },
    { label: 'Admin Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  ];

  const items = role === 'worker' ? workerNav : role === 'lender' ? lenderNav : adminNav;

  return (
    <aside className="w-64 bg-slate-900/90 border-r border-slate-800 flex flex-col h-full hidden md:flex shrink-0">
      {/* Brand Header */}
      <div className="h-16 px-6 border-b border-slate-800 flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-xs">
          <ShieldCheck className="w-4 h-4" />
        </div>
        <span className="font-bold tracking-tight text-white">CRED<span className="text-indigo-400">BRIDGE</span></span>
        <span className="ml-auto text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
          {role}
        </span>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition ${
                isActive
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Footer / Logout */}
      <div className="p-3 border-t border-slate-800 space-y-1">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition text-left"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
