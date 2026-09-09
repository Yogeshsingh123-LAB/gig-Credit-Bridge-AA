import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  Home, Users, LogOut, Menu, X, Bell, ChevronDown, Headphones
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { CredBridgeLogo } from '../components/CredBridgeLogo';
import { ErrorBoundary } from '../components/ErrorBoundary';

export const LenderLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navItems = [
    { to: '/lender/dashboard', label: 'Dashboard', icon: Home },
    { to: '/lender/applicants', label: 'Shared Applicants', icon: Users },
  ];

  const getInitials = (name?: string) => {
    if (!name) return 'PS';
    const parts = name.split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#18181B] font-['Plus_Jakarta_Sans',sans-serif] flex flex-col antialiased">
      
      {/* TOP STICKY NAVIGATION HEADER */}
      <header className="bg-white border-b border-[#E4E4E7] sticky top-0 z-50 shadow-2xs">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* BRAND LOGO & PORTAL BADGE */}
          <div className="flex items-center space-x-8">
            <CredBridgeLogo
              portalBadge="LENDER PORTAL"
              showTagline
              taglineText="The Reliable Bridge to Specialized Gigs"
              size="md"
              onClick={() => navigate('/lender/dashboard')}
            />

            {/* DESKTOP TOP NAVIGATION TABS */}
            <nav className="hidden md:flex items-center space-x-6 h-full pt-1">
              {navItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `h-16 flex items-center space-x-2 px-1 text-xs font-bold transition-all relative ${
                        isActive
                          ? 'text-[#FF6600]'
                          : 'text-[#52525B] hover:text-[#18181B]'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <IconComponent className={`w-4 h-4 ${isActive ? 'text-[#FF6600]' : 'text-[#71717A]'}`} />
                        <span>{item.label}</span>
                        {isActive && (
                          <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#FF6600] rounded-t-full" />
                        )}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* RIGHT ACTIONS: NOTIFICATION & USER PROFILE */}
          <div className="hidden md:flex items-center space-x-5">
            
            {/* Notification Bell Icon */}
            <div className="relative cursor-pointer p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors">
              <Bell className="w-5 h-5 text-slate-700" />
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-[#EF4444] border-2 border-white" />
            </div>

            {/* User Profile Pill */}
            <div className="relative">
              <div
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center space-x-3 cursor-pointer select-none p-1.5 rounded-2xl hover:bg-slate-50 transition-colors border border-slate-200/60"
              >
                <div className="w-9 h-9 rounded-full bg-[#E2E8F0] text-[#475569] font-black text-xs flex items-center justify-center border border-slate-300/60 shadow-2xs">
                  {getInitials(user?.name || 'Priya Sharma')}
                </div>
                <div className="text-left hidden lg:block">
                  <span className="text-xs font-black text-[#18181B] block leading-tight">
                    {user?.name || 'Priya Sharma'}
                  </span>
                  <span className="text-[10px] text-[#71717A] font-semibold block">
                    {user?.role === 'ADMIN' || user?.role === 'PLATFORM_ADMIN' ? 'Admin' : 'Lender Officer'}
                  </span>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </div>

              {/* User Dropdown Menu */}
              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 space-y-1">
                  <div className="px-4 py-2 border-b border-slate-100 text-xs">
                    <span className="font-bold text-slate-900 block truncate">{user?.name || 'Priya Sharma'}</span>
                    <span className="text-[10px] text-slate-500 truncate block">{user?.email || 'lender@credbridge.com'}</span>
                  </div>
                  <button
                    onClick={() => { logout(); navigate('/login'); }}
                    className="w-full flex items-center space-x-2 px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log out</span>
                  </button>
                </div>
              )}
            </div>

          </div>

          {/* MOBILE MENU TOGGLE BUTTON */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-700 hover:text-[#FF6600] hover:bg-[#FFF0E6] transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>

        {/* MOBILE DROPDOWN MENU */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#E4E4E7] bg-white px-4 py-4 space-y-3 shadow-lg">
            <div className="space-y-1">
              {navItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center space-x-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-[#FFF0E6] text-[#FF6600]'
                          : 'text-[#52525B] hover:bg-slate-50'
                      }`
                    }
                  >
                    <IconComponent className="w-4 h-4" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-[#E2E8F0] text-[#475569] font-black text-xs flex items-center justify-center">
                  {getInitials(user?.name || 'Priya Sharma')}
                </div>
                <div>
                  <span className="text-xs font-bold text-[#18181B] block">{user?.name || 'Priya Sharma'}</span>
                  <span className="text-[10px] text-[#71717A] block">Lender Officer</span>
                </div>
              </div>
              <button
                onClick={() => { logout(); navigate('/login'); }}
                className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-600 text-xs font-bold"
              >
                Log out
              </button>
            </div>
          </div>
        )}
      </header>

      {/* MAIN WORKSPACE PAGE CONTENT */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-[1400px] mx-auto space-y-8">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-[#E4E4E7] py-4 px-8 text-xs text-[#71717A]">
        <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 CredBridge. Your Gig Income. Verified.</p>
          <div className="flex items-center space-x-6 font-medium">
            <a href="#privacy" className="hover:text-[#18181B] transition-colors">Privacy</a>
            <a href="#terms" className="hover:text-[#18181B] transition-colors">Terms</a>
            <a href="#support" className="hover:text-[#18181B] transition-colors">Support</a>
          </div>
        </div>
      </footer>

    </div>
  );
};
