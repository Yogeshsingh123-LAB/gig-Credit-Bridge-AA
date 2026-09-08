import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, User, Layers, ShieldCheck, FileBadge, Building2, Users } from 'lucide-react';

export interface MobileNavigationProps {
  role: 'worker' | 'lender';
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({ role }) => {
  const location = useLocation();

  const workerNav = [
    { label: 'Overview', path: '/worker', icon: LayoutDashboard },
    { label: 'Dash', path: '/worker/dashboard', icon: LayoutDashboard },
    { label: 'Platforms', path: '/worker/platforms', icon: Layers },
    { label: 'Verify', path: '/worker/verification', icon: ShieldCheck },
    { label: 'Passport', path: '/worker/passport', icon: FileBadge },
  ];

  const lenderNav = [
    { label: 'Overview', path: '/lender', icon: Building2 },
    { label: 'Dashboard', path: '/lender/dashboard', icon: LayoutDashboard },
    { label: 'Applicant', path: '/lender/applicant', icon: Users },
  ];

  const items = role === 'worker' ? workerNav : lenderNav;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-950/95 border-t border-slate-800 backdrop-blur-md z-40 px-2 py-2 flex items-center justify-around">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-medium transition ${
              isActive ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};
