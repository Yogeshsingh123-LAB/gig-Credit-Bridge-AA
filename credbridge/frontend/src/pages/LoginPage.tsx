import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, Lock, ArrowRight, AlertCircle, RefreshCw, 
  BarChart3, Shield, User, Building2, Users, CheckCircle2, ChevronDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import { CredBridgeLogo } from '../components/CredBridgeLogo';

interface DemoUserItem {
  index: number;
  name: string;
  masked_aadhaar: string;
  phone: string;
  city: string;
  occupation: string;
  pattern: string;
  platforms: string[];
}

const FALLBACK_DEMO_USERS: DemoUserItem[] = [
  { index: 1, name: "Aarav Sharma", masked_aadhaar: "XXXXXXXX1001", phone: "+91 98765 01001", city: "Bengaluru", occupation: "Delivery & Logistics Specialist", pattern: "stable", platforms: ["QuickRide", "FoodDash", "UrbanMove"] },
  { index: 2, name: "Rohan Patel", masked_aadhaar: "XXXXXXXX1002", phone: "+91 98765 01002", city: "Mumbai", occupation: "Rideshare Captain", pattern: "high_fluctuating", platforms: ["UrbanMove", "QuickRide"] },
  { index: 3, name: "Vikram Kumar", masked_aadhaar: "XXXXXXXX1003", phone: "+91 98765 01003", city: "Delhi NCR", occupation: "Express Courier Partner", pattern: "low_consistent", platforms: ["ParcelGo"] },
  { index: 4, name: "Rahul Verma", masked_aadhaar: "XXXXXXXX1004", phone: "+91 98765 01004", city: "Hyderabad", occupation: "On-Demand Tasks Specialist", pattern: "upward_trend", platforms: ["TaskKart", "FoodDash"] },
  { index: 5, name: "Aditya Mehta", masked_aadhaar: "XXXXXXXX1005", phone: "+91 98765 01005", city: "Pune", occupation: "City Logistics Associate", pattern: "downward_trend", platforms: ["Local Delivery Services"] },
  { index: 6, name: "Karan Shah", masked_aadhaar: "XXXXXXXX1006", phone: "+91 98765 01006", city: "Ahmedabad", occupation: "Rideshare Captain", pattern: "volatile", platforms: ["QuickRide"] },
  { index: 7, name: "Nikhil Joshi", masked_aadhaar: "XXXXXXXX1007", phone: "+91 98765 01007", city: "Bengaluru", occupation: "Multi-Platform Delivery Executive", pattern: "multiple_sources", platforms: ["QuickRide", "FoodDash", "ParcelGo", "TaskKart"] },
  { index: 8, name: "Arjun Yadav", masked_aadhaar: "XXXXXXXX1008", phone: "+91 98765 01008", city: "Kolkata", occupation: "Transit Driver", pattern: "dominant_source", platforms: ["UrbanMove"] },
  { index: 9, name: "Manish Gupta", masked_aadhaar: "XXXXXXXX1009", phone: "+91 98765 01009", city: "Jaipur", occupation: "Food Delivery Specialist", pattern: "seasonal", platforms: ["FoodDash"] },
  { index: 10, name: "Sahil Desai", masked_aadhaar: "XXXXXXXX1010", phone: "+91 98765 01010", city: "Surat", occupation: "General Gig Partner", pattern: "mixed", platforms: ["QuickRide", "UrbanMove"] }
];

export const LoginPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [demoUsers, setDemoUsers] = useState<DemoUserItem[]>(FALLBACK_DEMO_USERS);
  const [selectedUserIndex, setSelectedUserIndex] = useState<number>(1);
  const [showStaffLogin, setShowStaffLogin] = useState(false);
  const [staffEmail, setStaffEmail] = useState('priya.lender@example.com');
  const [staffPassword, setStaffPassword] = useState('Password123!');

  const { loginWithDigiLocker, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDemoUsers = async () => {
      try {
        const data = await apiService.getDemoUsers();
        if (Array.isArray(data) && data.length > 0) {
          setDemoUsers(data);
        }
      } catch (err) {
        // Fallback demo users configured
      }
    };
    fetchDemoUsers();
  }, []);

  const handleDigiLockerAuth = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const selected = demoUsers.find(u => u.index === selectedUserIndex) || demoUsers[0];
      const payload = {
        name: selected.name,
        masked_aadhaar: selected.masked_aadhaar,
        is_new_user: false,
        phone: selected.phone,
        city: selected.city,
        occupation: selected.occupation
      };

      const role = await loginWithDigiLocker(payload);
      if (role === 'WORKER') {
        navigate('/worker/dashboard');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      console.error('DigiLocker authentication failed:', err);
      const msg = err.response?.data?.detail || err.response?.data?.message || 'DigiLocker verification failed. Make sure the backend server is running.';
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setIsLoading(false);
    }
  };

  const handleStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const role = await login(staffEmail.trim(), staffPassword);
      const isLender = role === 'LENDER' || role === 'LENDER_ADMIN' || role === 'LENDER_OFFICER';
      const isAdmin = role === 'ADMIN' || role === 'PLATFORM_ADMIN';

      if (isLender) {
        navigate('/lender/dashboard');
      } else if (isAdmin) {
        navigate('/admin/dashboard');
      } else {
        navigate('/worker/dashboard');
      }
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Staff sign-in failed. Check credentials.';
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setIsLoading(false);
    }
  };

  const selectedUser = demoUsers.find(u => u.index === selectedUserIndex) || demoUsers[0];

  // Helper initials for avatar
  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="font-['Plus_Jakarta_Sans',sans-serif] text-[#18181B] antialiased bg-gradient-to-b from-[#FFFDF9] via-[#FFF8F2] to-white min-h-[90vh] flex flex-col justify-between py-12">
      
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-10">
        
        {/* CENTER TOP HEADER */}
        <div className="text-center space-y-3 max-w-xl mx-auto flex flex-col items-center">
          <CredBridgeLogo size="lg" showTagline taglineText="The Reliable Bridge to Specialized Gigs" onClick={() => navigate('/')} className="mb-2" />

          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-[#F4F4F5] border border-[#E4E4E7] text-[#52525B] text-[11px] font-semibold tracking-wide shadow-2xs">
            <Shield className="w-3.5 h-3.5 text-[#18181B]" />
            <span>INDIA'S GIG INCOME VERIFICATION <strong className="font-extrabold text-[#18181B]">PLATFORM</strong></span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#18181B] tracking-tight leading-tight">
            Welcome to <span className="text-[#FF6600]">CredBridge</span>
          </h1>

          <p className="text-xs sm:text-sm text-[#71717A] font-medium leading-relaxed">
            Turn your gig income into trusted financial evidence.
          </p>
        </div>

        {/* MAIN 3-COLUMN LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-4">
          
          {/* LEFT COLUMN: 3 Feature Highlights (3/12 cols) */}
          <div className="lg:col-span-3 space-y-8 hidden lg:block pr-2">
            
            {/* Item 1 */}
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 rounded-full bg-[#FFF0E6] border border-[#FF6600]/20 flex items-center justify-center shrink-0 shadow-xs">
                <ShieldCheck className="w-6 h-6 text-[#FF6600]" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-extrabold text-[#18181B]">RBI-regulated</h4>
                <p className="text-xs text-[#71717A] font-medium leading-relaxed">
                  Built on India's Account Aggregator framework.
                </p>
              </div>
            </div>

            {/* Item 2 */}
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 rounded-full bg-[#FFF0E6] border border-[#FF6600]/20 flex items-center justify-center shrink-0 shadow-xs">
                <Lock className="w-6 h-6 text-[#FF6600]" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-extrabold text-[#18181B]">Your data, your consent</h4>
                <p className="text-xs text-[#71717A] font-medium leading-relaxed">
                  Secure, revocable, and privacy-first.
                </p>
              </div>
            </div>

            {/* Item 3 */}
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 rounded-full bg-[#FFF0E6] border border-[#FF6600]/20 flex items-center justify-center shrink-0 shadow-xs">
                <BarChart3 className="w-6 h-6 text-[#FF6600]" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-extrabold text-[#18181B]">Real income insights</h4>
                <p className="text-xs text-[#71717A] font-medium leading-relaxed">
                  From platforms like Swiggy, Zomato, Uber and more.
                </p>
              </div>
            </div>

          </div>

          {/* CENTER COLUMN: Login Card (6/12 cols) */}
          <div className="lg:col-span-6 flex justify-center">
            
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E4E4E7] shadow-xl w-full max-w-lg space-y-6">
              
              {/* Card Header Icon & Title */}
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-[#FF6600] text-white flex items-center justify-center mx-auto shadow-md shadow-[#FF6600]/30">
                  <ShieldCheck className="w-7 h-7 stroke-[2.5]" />
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-[#18181B] tracking-tight">
                  Continue with DigiLocker
                </h2>
                <p className="text-xs text-[#71717A] font-medium">
                  Secure. Fast. No registration. No passwords.
                </p>
              </div>

              {error && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start space-x-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div className="font-medium leading-relaxed">{error}</div>
                </div>
              )}

              {!showStaffLogin ? (
                /* DigiLocker Profile Selector Form */
                <div className="space-y-5">
                  
                  {/* Demo Mode Banner */}
                  <div className="px-4 py-2.5 rounded-xl bg-[#FFF6EE] border border-[#FDE3CF] flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-[#FF6600] animate-pulse"></span>
                      <span className="text-xs font-black text-[#FF6600] uppercase tracking-wider">DEMO MODE</span>
                    </div>
                    <span className="text-[11px] font-mono text-[#71717A] font-semibold">
                      10 Synthetic Identities
                    </span>
                  </div>

                  {/* Profile Dropdown Selector */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-[#18181B] block">
                      Select Your Profile
                    </label>
                    <p className="text-[11px] text-[#71717A] font-medium">Choose an identity to continue (Demo Mode)</p>
                    
                    <div className="relative pt-1">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#71717A] pointer-events-none">
                        <User className="w-4 h-4" />
                      </div>
                      <select
                        id="demo-user-selector"
                        value={selectedUserIndex}
                        onChange={(e) => setSelectedUserIndex(Number(e.target.value))}
                        className="w-full pl-10 pr-10 py-3 rounded-xl bg-white border border-[#E4E4E7] text-[#18181B] text-xs font-bold focus:ring-2 focus:ring-[#FF6600] focus:border-[#FF6600] focus:outline-none shadow-2xs appearance-none cursor-pointer"
                      >
                        {demoUsers.map((u) => (
                          <option key={u.index} value={u.index}>
                            {u.index.toString().padStart(2, '0')}. {u.name} — {u.occupation}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#71717A] pointer-events-none">
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  {/* Selected Profile Detail Snapshot Box */}
                  <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-3">
                    
                    {/* User Avatar Header */}
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-[#FFF0E6] text-[#FF6600] border border-[#FF6600]/30 font-black text-sm flex items-center justify-center shrink-0">
                        {getInitials(selectedUser.name)}
                      </div>
                      <div>
                        <h4 className="text-sm font-extrabold text-[#18181B]">{selectedUser.name}</h4>
                        <span className="text-[11px] text-[#71717A] font-semibold block">{selectedUser.occupation}</span>
                      </div>
                    </div>

                    {/* Snapshot Grid */}
                    <div className="space-y-1.5 text-xs border-t border-slate-200/80 pt-2.5">
                      <div className="flex items-center justify-between text-[#71717A]">
                        <span className="font-semibold">DigiLocker ID</span>
                        <span className="font-mono font-bold text-[#18181B]">{selectedUser.masked_aadhaar}</span>
                      </div>
                      <div className="flex items-center justify-between text-[#71717A]">
                        <span className="font-semibold">Profile Status</span>
                        <span className="text-[10px] font-extrabold text-[#15803D] bg-[#DCFCE7] px-2 py-0.5 rounded-full">
                          ● Stable
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[#71717A]">
                        <span className="font-semibold">Detected Platforms</span>
                        <span className="font-bold text-[#18181B]">{selectedUser.platforms.join(', ')}</span>
                      </div>
                    </div>

                  </div>

                  {/* Big Primary Button */}
                  <button
                    id="digilocker-login-btn"
                    type="button"
                    disabled={isLoading}
                    onClick={handleDigiLockerAuth}
                    className="w-full flex items-center justify-center space-x-2.5 py-4 px-6 rounded-xl bg-[#FF6600] hover:bg-[#E65C00] text-white font-extrabold text-sm transition-all shadow-xl shadow-[#FF6600]/25 disabled:opacity-50 cursor-pointer active:scale-[0.98]"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-white" />
                        <span>Authenticating with DigiLocker...</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4 fill-white/20" />
                        <span>Continue with DigiLocker</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  {/* Reassurance Disclaimer */}
                  <div className="text-center text-[11px] text-[#71717A] space-y-0.5 font-medium">
                    <p>Passwordless • Government Identity Provider</p>
                    <p className="text-[10px] text-[#A1A1AA]">CredBridge never requests or stores DigiLocker passwords or OTPs.</p>
                  </div>

                  {/* Institutional Switcher Link */}
                  <div className="text-center pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setShowStaffLogin(true)}
                      className="text-xs font-bold text-[#FF6600] hover:underline transition-colors cursor-pointer"
                    >
                      Lender / Institutional Access →
                    </button>
                  </div>

                </div>
              ) : (
                /* Institutional Staff Sign In Form */
                <form onSubmit={handleStaffSubmit} className="space-y-4">
                  <div className="p-3.5 rounded-2xl bg-[#FFF6EE] border border-[#FDE3CF] text-center space-y-1">
                    <span className="text-xs font-extrabold text-[#FF6600] uppercase tracking-wider">Institutional Access</span>
                    <p className="text-[11px] text-[#71717A] font-medium">Restricted to verified lenders & platform administrators.</p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-extrabold text-[#18181B]">Institutional Email</label>
                    <input
                      type="email"
                      value={staffEmail}
                      onChange={(e) => setStaffEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E4E4E7] text-[#18181B] text-xs font-medium focus:ring-2 focus:ring-[#FF6600] focus:outline-none"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-extrabold text-[#18181B]">Password</label>
                    <input
                      type="password"
                      value={staffPassword}
                      onChange={(e) => setStaffPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E4E4E7] text-[#18181B] text-xs font-medium focus:ring-2 focus:ring-[#FF6600] focus:outline-none"
                      required
                    />
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={async () => {
                        setStaffEmail('priya.lender@example.com');
                        setStaffPassword('Password123!');
                        setIsLoading(true);
                        try {
                          await login('priya.lender@example.com', 'Password123!');
                          navigate('/lender/dashboard');
                        } catch {
                          navigate('/lender/dashboard');
                        } finally {
                          setIsLoading(false);
                        }
                      }}
                      className="text-[10px] px-2.5 py-1 rounded-lg bg-[#FFF0E6] border border-[#FF6600]/30 text-[#FF6600] font-bold hover:bg-[#FFE0CC] cursor-pointer"
                    >
                      Use Demo Lender
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        setStaffEmail('admin@credbridge.com');
                        setStaffPassword('Admin@123456');
                        setIsLoading(true);
                        try {
                          await login('admin@credbridge.com', 'Admin@123456');
                          navigate('/admin/dashboard');
                        } catch {
                          navigate('/admin/dashboard');
                        } finally {
                          setIsLoading(false);
                        }
                      }}
                      className="text-[10px] px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-300 text-slate-700 font-bold hover:bg-slate-200 cursor-pointer"
                    >
                      Use Demo Admin
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 px-4 rounded-xl bg-[#18181B] hover:bg-[#27272A] text-white font-extrabold text-xs transition-colors cursor-pointer shadow-md"
                  >
                    {isLoading ? 'Verifying...' : 'Sign in as Institution'}
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => setShowStaffLogin(false)}
                      className="text-xs font-bold text-[#FF6600] hover:underline transition-colors cursor-pointer"
                    >
                      ← Back to Worker DigiLocker Login
                    </button>
                  </div>
                </form>
              )}

            </div>

          </div>

          {/* RIGHT COLUMN: Illustration & Cursive Badge (3/12 cols) */}
          <div className="lg:col-span-3 space-y-6 hidden lg:block pl-2 relative">
            
            {/* Top Cursive Handwriting Callout */}
            <div className="transform -rotate-3 space-y-1">
              <span className="font-['Caveat',cursive] text-[#FF6600] text-3xl font-bold block leading-none drop-shadow-xs">
                Your Hustle<br />Builds Tomorrow.
              </span>
              <svg className="w-36 h-2 text-[#FF6600]" viewBox="0 0 100 10" fill="none">
                <path d="M2 5 Q 50 1, 98 5" stroke="#FF6600" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>

            {/* Floating Opportunity Pill */}
            <div className="bg-white rounded-2xl p-3 shadow-xl border border-slate-100 inline-flex items-center space-x-2.5 text-xs font-bold text-[#18181B]">
              <div className="w-7 h-7 rounded-lg bg-[#FFF0E6] text-[#FF6600] flex items-center justify-center shrink-0">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div className="leading-tight">
                <span className="block text-[11px] font-extrabold text-[#18181B]">More Opportunities</span>
                <span className="text-[10px] text-[#71717A] font-medium">for Every Gig Worker</span>
              </div>
            </div>

            {/* Vector Illustration Graphic */}
            <div className="relative pt-4">
              <div className="w-full h-48 bg-gradient-to-tr from-[#FFF0E6] to-[#FFE4D6] rounded-3xl p-6 flex flex-col justify-between border border-[#FDE3CF] shadow-xs overflow-hidden relative">
                
                <div className="space-y-1 relative z-10">
                  <span className="text-xs font-extrabold text-[#FF6600] block uppercase tracking-wider">Consent-Driven</span>
                  <p className="text-[11px] text-slate-700 font-semibold leading-snug">
                    Access instant credit with verified earnings proof.
                  </p>
                </div>

                <div className="flex items-end justify-between relative z-10">
                  <div className="w-10 h-10 rounded-xl bg-white text-[#FF6600] flex items-center justify-center font-black text-sm shadow-xs">
                    CB
                  </div>
                  <div className="w-8 h-8 rounded-full bg-[#10B981] text-white flex items-center justify-center shadow-xs">
                    <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                  </div>
                </div>

                {/* Decorative Background Circles */}
                <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-[#FF6600]/10 rounded-full blur-xl pointer-events-none" />
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* BOTTOM STATISTICS BANNER */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 w-full pt-12">
        <div className="bg-[#FFF6EE] border border-[#FDE3CF] rounded-2xl p-6 sm:p-8 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-6">
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 w-full md:w-auto flex-1">
            
            {/* Stat 1 */}
            <div className="flex items-center space-x-3.5">
              <div className="w-11 h-11 rounded-full bg-[#FFF0E6] text-[#FF6600] flex items-center justify-center shrink-0">
                <Users className="w-5 h-5 text-[#FF6600]" />
              </div>
              <div>
                <span className="text-2xl font-black text-[#18181B] block leading-none">12M+</span>
                <span className="text-xs text-[#71717A] font-semibold mt-1 block">Gig workers in India</span>
              </div>
            </div>

            {/* Stat 2 */}
            <div className="flex items-center space-x-3.5">
              <div className="w-11 h-11 rounded-full bg-[#FFF0E6] text-[#FF6600] flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5 text-[#FF6600]" />
              </div>
              <div>
                <span className="text-2xl font-black text-[#18181B] block leading-none">60%</span>
                <span className="text-xs text-[#71717A] font-semibold mt-1 block">Lack formal income proof</span>
              </div>
            </div>

            {/* Stat 3 */}
            <div className="flex items-center space-x-3.5">
              <div className="w-11 h-11 rounded-full bg-[#FFF0E6] text-[#FF6600] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-[#FF6600]" />
              </div>
              <div>
                <span className="text-2xl font-black text-[#18181B] block leading-none">100%</span>
                <span className="text-xs text-[#71717A] font-semibold mt-1 block">Consent-driven & secure</span>
              </div>
            </div>

          </div>

          {/* Right Cursive Badge */}
          <div className="shrink-0 text-center md:text-right border-t md:border-t-0 pt-4 md:pt-0 border-[#FDE3CF] w-full md:w-auto">
            <span className="font-['Caveat',cursive] font-bold text-[#FF6600] text-2xl block tracking-wide">
              Enabling Opportunities for Every Hustle.
            </span>
          </div>

        </div>
      </div>

    </div>
  );
};
