import React, { useState } from 'react';
import { User as UserIcon, Bell, LogOut, ChevronDown } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { useAuth } from '../../hooks/useAuth';

export interface TopbarProps {
  role?: string;
}

export const Topbar: React.FC<TopbarProps> = ({ role }) => {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const displayRole = user?.role || role || 'USER';
  const displayName = user?.name || 'Authenticated User';
  const displayEmail = user?.email || 'user@credbridge.io';

  return (
    <header className="h-16 bg-slate-900/60 border-b border-slate-800/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider hidden sm:inline-block">
          CredBridge Portal
        </span>
        <Badge variant="info" className="uppercase text-[10px]">
          {displayRole} Workspace
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

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-800/50 transition focus:outline-none"
          >
            <div className="w-8 h-8 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-semibold text-xs">
              <UserIcon className="w-4 h-4" />
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-semibold text-slate-200">{displayName}</div>
              <div className="text-[10px] text-slate-400 font-mono">{displayEmail}</div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-xl bg-slate-900 border border-slate-800 shadow-xl py-1 z-50 text-xs">
              <div className="px-3 py-2 border-b border-slate-800 sm:hidden">
                <p className="font-semibold text-white">{displayName}</p>
                <p className="text-[10px] text-slate-400 font-mono">{displayEmail}</p>
              </div>
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  logout();
                }}
                className="w-full text-left px-3 py-2 text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
