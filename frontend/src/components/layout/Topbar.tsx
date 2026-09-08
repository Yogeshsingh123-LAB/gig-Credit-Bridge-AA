import React from 'react';
import { ShieldCheck, User, Bell } from 'lucide-react';
import { Badge } from '../ui/Badge';

export interface TopbarProps {
  role: 'worker' | 'lender';
}

export const Topbar: React.FC<TopbarProps> = ({ role }) => {
  return (
    <header className="h-16 bg-slate-900/60 border-b border-slate-800/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider hidden sm:inline-block">
          CredBridge Portal
        </span>
        <Badge variant="info" className="uppercase text-[10px]">
          {role} Workspace
        </Badge>
      </div>

      <div className="flex items-center gap-4">
        <button
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition relative"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full" />
        </button>

        <div className="h-4 w-[1px] bg-slate-800" />

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-semibold text-xs">
            <User className="w-4 h-4" />
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-semibold text-slate-200">
              {role === 'worker' ? 'Demo Gig Worker' : 'Institution Assessor'}
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              {role === 'worker' ? 'worker@credbridge.io' : 'lender@credbridge.io'}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
