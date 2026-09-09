import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { 
  Home, Users, Building2, Clock, ShieldCheck, 
  Settings, LogOut, Menu, X, Bell, Search, ChevronDown 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { CredBridgeLogo } from '../components/CredBridgeLogo';

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');

  const navItems = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: Home },
    { to: '/admin/users', label: 'Users', icon: Users },
    { to: '/admin/lenders', label: 'Lenders & Credentials', icon: Building2 },
    { to: '/admin/audit-logs', label: 'Audit Logs', icon: Clock },
    { to: '/admin/health', label: 'System Health', icon: ShieldCheck },
    { to: '/admin/settings', label: 'Settings', icon: Settings },
  ];

  const getInitials = (name?: string) => {
    if (!name) return 'AD';
    const parts = name.split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#18181B] font-['Plus_Jakarta_Sans',sans-serif] flex flex-col antialiased">
      
      {/* TOP STICKY NAVIGATION HEADER */}
      <header className="bg-white border-b border-[#E4E4E7] sticky top-0 z-50 shadow-2xs">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* BRAND LOGO & PORTAL BADGE */}
          <div className="flex items-center space-x-6 shrink-0">
            <CredBridgeLogo
              portalBadge="ADMIN PORTAL"
              showTagline
              taglineText="The Reliable Bridge to Specialized Gigs"
              size="md"
              onClick={() => navigate('/admin/dashboard')}
            />
          </div>

          {/* DESKTOP TOP NAVIGATION TABS */}
          <nav className="hidden lg:flex items-center space-x-5 h-full pt-1">
            {navItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `h-16 flex items-center space-x-2 px-1 text-xs font-bold transition-all relative whitespace-nowrap ${
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

          {/* RIGHT ACTIONS: SEARCH, NOTIFICATION, & USER PROFILE */}
          <div className="hidden sm:flex items-center space-x-4">
            
            {/* Search Bar */}
            <div className="relative w-48 md:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                placeholder="Search..."
                className="w-full pl-8 pr-12 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-[#18181B] placeholder-slate-400 focus:outline-none focus:border-[#FF6600]"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-mono font-bold text-slate-400 bg-slate-200/60 px-1 py-0.5 rounded">
                Ctrl+K
              </span>
            </div>

            {/* Notification Bell Icon */}
            <div className="relative cursor-pointer p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors">
              <Bell className="w-5 h-5 text-slate-700" />
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#EF4444] text-white text-[9px] font-black flex items-center justify-center border-2 border-white shadow-2xs">
                5
              </span>
            </div>

            {/* User Profile Pill */}
            <div className="relative">
              <div 
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center space-x-2.5 cursor-pointer select-none p-1.5 rounded-2xl hover:bg-slate-50 transition-colors border border-slate-200/60"
              >
                <div className="w-8 h-8 rounded-full bg-[#E2E8F0] text-[#475569] font-black text-xs flex items-center justify-center border border-slate-300/60 shadow-2xs">
                  {getInitials(user?.name || 'Admin')}
                </div>
                <div className="text-left hidden xl:block">
                  <span className="text-xs font-black text-[#18181B] block leading-tight">
                    {user?.name || 'Admin'}
                  </span>
                  <span className="text-[10px] text-[#71717A] font-semibold block">
                    System Administrator
                  </span>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </div>

              {/* User Dropdown Menu */}
              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 space-y-1">
                  <div className="px-4 py-2 border-b border-slate-100 text-xs">
                    <span className="font-bold text-slate-900 block truncate">{user?.name || 'Admin'}</span>
                    <span className="text-[10px] text-slate-500 truncate block">{user?.email || 'admin@credbridge.com'}</span>
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
          <div className="flex lg:hidden items-center space-x-2">
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
          <div className="lg:hidden border-t border-[#E4E4E7] bg-white px-4 py-4 space-y-3 shadow-lg">
            
            {/* Search Bar Mobile */}
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                placeholder="Search users, reports, lenders..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-[#18181B]"
              />
            </div>

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
                  {getInitials(user?.name || 'Admin')}
                </div>
                <div>
                  <span className="text-xs font-bold text-[#18181B] block">{user?.name || 'Admin'}</span>
                  <span className="text-[10px] text-[#71717A] block">System Administrator</span>
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
