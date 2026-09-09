import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { 
  Bell, ChevronDown, LogOut, Menu, X, Home, FileText, FileCheck, User, Settings
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { CredBridgeLogo } from '../components/CredBridgeLogo';

export const WorkerLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navItems = [
    { to: '/worker/dashboard', label: 'Dashboard', icon: Home },
    { to: '/worker/generate-report', label: 'Generate Report', icon: FileText },
    { to: '/worker/reports', label: 'Reports', icon: FileCheck },
    { to: '/worker/profile', label: 'Profile', icon: User },
    { to: '/worker/settings', label: 'Settings', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const workerProfile = user?.worker_profile;
  const workerName = workerProfile?.identity_name || user?.name || 'Rohit Sharma';

  return (
    <div className="min-h-screen bg-[#F5F6F8] text-[#18181B] font-sans flex flex-col antialiased">
      {/* Top Header Navigation Bar */}
      <header className="bg-white border-b border-[#E4E4E7] sticky top-0 z-50 shadow-2xs">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Brand Logo & Subtitle */}
          <CredBridgeLogo showTagline taglineText="Your Gig Income. Verified." onClick={() => navigate('/worker/dashboard')} />

          {/* Center Navigation Tabs with Icons */}
          <nav className="hidden md:flex items-center space-x-7 h-full">
            {navItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `h-full flex items-center space-x-2 px-1 text-xs font-semibold transition-colors relative ${
                      isActive
                        ? 'text-[#FF6600] font-bold'
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

          {/* Right Header Controls (Notification + User Profile) */}
          <div className="hidden md:flex items-center space-x-5">
            {/* Notification Bell */}
            <button 
              type="button"
              className="relative p-2 rounded-full text-[#52525B] hover:text-[#18181B] hover:bg-[#F4F4F5] transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 bg-[#EF4444] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white">
                3
              </span>
            </button>

            {/* User Profile Pill */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center space-x-3 p-1 rounded-full hover:bg-[#F4F4F5] transition-colors focus:outline-none"
              >
                <div className="w-9 h-9 rounded-full bg-[#E4E4E7] border border-[#D4D4D8] flex items-center justify-center text-[#27272A] font-bold overflow-hidden shadow-2xs">
                  <img
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(workerName)}`}
                    alt={workerName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <span className="text-xs font-bold">{workerName.slice(0, 2).toUpperCase()}</span>
                </div>
                <div className="text-left hidden lg:block pr-1">
                  <span className="block text-xs font-bold text-[#18181B] leading-tight">{workerName}</span>
                  <span className="block text-[10px] text-[#71717A] font-medium">Worker</span>
                </div>
                <ChevronDown className="w-4 h-4 text-[#71717A]" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-[#E4E4E7] py-1.5 z-50">
                  <div className="px-4 py-2 border-b border-[#F4F4F5]">
                    <p className="text-xs font-bold text-[#18181B]">{workerName}</p>
                    <p className="text-[10px] text-[#71717A] truncate">{user?.email || 'rohit.sharma@credbridge.in'}</p>
                  </div>
                  <NavLink
                    to="/worker/profile"
                    onClick={() => setUserDropdownOpen(false)}
                    className="block px-4 py-2 text-xs text-[#27272A] hover:bg-[#F4F4F5] font-medium"
                  >
                    Profile
                  </NavLink>
                  <NavLink
                    to="/worker/settings"
                    onClick={() => setUserDropdownOpen(false)}
                    className="block px-4 py-2 text-xs text-[#27272A] hover:bg-[#F4F4F5] font-medium"
                  >
                    Settings
                  </NavLink>
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      handleLogout();
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-[#DC2626] hover:bg-[#FEF2F2] font-semibold flex items-center space-x-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-3">
            <button 
              type="button"
              className="relative p-2 rounded-full text-[#52525B]"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 bg-[#EF4444] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                3
              </span>
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-[#52525B] hover:bg-[#F4F4F5]"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-[#E4E4E7] px-4 pt-2 pb-4 space-y-2">
            {navItems.map((item) => {
              const IconComp = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center space-x-2.5 px-3 py-2 rounded-lg text-sm font-semibold ${
                      isActive
                        ? 'bg-[#FFF7ED] text-[#FF6600]'
                        : 'text-[#52525B] hover:bg-[#F4F4F5]'
                    }`
                  }
                >
                  <IconComp className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
            <button
              onClick={handleLogout}
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-[#DC2626] hover:bg-[#FEF2F2] flex items-center space-x-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        )}
      </header>

      {/* Page Content Container */}
      <main className="flex-1 max-w-[1400px] w-full mx-auto p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
};
