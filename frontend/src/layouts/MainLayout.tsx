import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowRight, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { CredBridgeLogo } from '../components/CredBridgeLogo';

export const MainLayout: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleDigiLockerClick = () => {
    if (user?.role === 'WORKER') navigate('/worker/dashboard');
    else if (user?.role === 'LENDER') navigate('/lender/dashboard');
    else if (user?.role === 'ADMIN') navigate('/admin/dashboard');
    else navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#18181B] font-sans antialiased">
      {/* Top Header Navigation Bar */}
      <header className="bg-white border-b border-[#E4E4E7] sticky top-0 z-50 shadow-2xs">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Brand Logo & Subtitle */}
          <CredBridgeLogo showTagline taglineText="The Reliable Bridge to Specialized Gigs" onClick={() => navigate('/')} />

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8 h-full">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `h-full flex items-center text-xs font-semibold transition-colors relative ${
                  isActive
                    ? 'text-[#FF6600] font-bold'
                    : 'text-[#52525B] hover:text-[#18181B]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span>Home</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#FF6600] rounded-t-full" />
                  )}
                </>
              )}
            </NavLink>

            <NavLink
              to="/about"
              className={({ isActive }) =>
                `h-full flex items-center text-xs font-semibold transition-colors relative ${
                  isActive
                    ? 'text-[#FF6600] font-bold'
                    : 'text-[#52525B] hover:text-[#18181B]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span>About</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#FF6600] rounded-t-full" />
                  )}
                </>
              )}
            </NavLink>

            <NavLink
              to="/how-it-works"
              className={({ isActive }) =>
                `h-full flex items-center text-xs font-semibold transition-colors relative ${
                  isActive
                    ? 'text-[#FF6600] font-bold'
                    : 'text-[#52525B] hover:text-[#18181B]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span>How It Works</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#FF6600] rounded-t-full" />
                  )}
                </>
              )}
            </NavLink>

            <NavLink
              to="/for-lenders"
              className={({ isActive }) =>
                `h-full flex items-center text-xs font-semibold transition-colors relative ${
                  isActive
                    ? 'text-[#FF6600] font-bold'
                    : 'text-[#52525B] hover:text-[#18181B]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span>For Lenders</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#FF6600] rounded-t-full" />
                  )}
                </>
              )}
            </NavLink>

            <NavLink
              to="/faqs"
              className={({ isActive }) =>
                `h-full flex items-center text-xs font-semibold transition-colors relative ${
                  isActive
                    ? 'text-[#FF6600] font-bold'
                    : 'text-[#52525B] hover:text-[#18181B]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span>FAQs</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#FF6600] rounded-t-full" />
                  )}
                </>
              )}
            </NavLink>
          </nav>

          {/* Right Header CTA Button */}
          <div className="flex items-center space-x-4">
            <button
              onClick={handleDigiLockerClick}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-[#FF6600] hover:bg-[#E65C00] text-white font-bold text-xs shadow-xs transition-all cursor-pointer active:scale-95"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Continue with DigiLocker</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </header>

      {/* Main Content Body */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-[#E4E4E7] py-6 text-xs text-[#71717A]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 CredBridge. Your Gig Income. Verified.</p>
          <div className="flex items-center space-x-6 font-medium">
            <a href="#privacy" className="hover:text-[#18181B] transition-colors">Privacy</a>
            <a href="#terms" className="hover:text-[#18181B] transition-colors">Terms</a>
            <a href="#contact" className="hover:text-[#18181B] transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
