import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, Lock, CheckCircle2, ArrowRight, BarChart3, 
  FileText, Users, Building2, Check, Shield
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const handleContinueWithDigiLocker = () => {
    navigate('/login');
  };

  return (
    <div className="font-['Plus_Jakarta_Sans',sans-serif] text-[#18181B] antialiased bg-white">
      
      {/* SECTION 1: Dark Hero Section */}
      <section className="bg-[#0B1220] text-white relative overflow-hidden">
        
        {/* Ambient Light Glow */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#FF6600]/12 blur-[180px] rounded-full pointer-events-none" />
        <div className="absolute top-1/2 right-10 w-[500px] h-[500px] bg-[#FF8833]/8 blur-[160px] rounded-full pointer-events-none" />

        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          
          {/* Left Text Column (7/12 cols) */}
          <div className="lg:col-span-7 space-y-7">
            
            {/* Top Pill Badge */}
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-[#0D2E28] border border-[#10B981]/40 text-[#34D399] text-[11px] font-semibold tracking-wide">
              <Shield className="w-3.5 h-3.5 text-[#34D399]" />
              <span>INDIA'S GIG INCOME VERIFICATION <strong className="font-extrabold text-white">PLATFORM</strong></span>
            </div>

            {/* Main Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-black text-white tracking-tight leading-[1.1]">
              Turn Gig Income Into <br />
              <span className="text-[#FF6600]">Verified Financial Evidence</span>
            </h1>

            {/* Subtext */}
            <p className="text-sm sm:text-base text-[#94A3B8] leading-relaxed max-w-xl font-normal">
              CredBridge helps gig workers like you consolidate your earnings from platforms like Swiggy, Zomato, Uber and more into a secure, bank-ready Credit Passport.
            </p>

            {/* CTA Button & Trust Badges */}
            <div className="space-y-3.5 pt-2">
              <button
                type="button"
                onClick={handleContinueWithDigiLocker}
                className="inline-flex items-center space-x-3 px-8 py-4 rounded-xl bg-[#FF6600] hover:bg-[#E65C00] text-white font-extrabold text-sm shadow-xl shadow-[#FF6600]/30 transition-all cursor-pointer active:scale-95"
              >
                <Lock className="w-4 h-4 fill-white/20" />
                <span>Continue with DigiLocker</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-[11px] text-[#64748B] font-medium">
                No registration • No passwords • 100% secure & consent-driven
              </p>
            </div>

            {/* 3 Trust Guarantee Badges */}
            <div className="pt-6 flex flex-wrap items-center gap-6 text-xs text-[#94A3B8] font-medium">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full bg-[#10B981]/20 flex items-center justify-center">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#34D399]" />
                </div>
                <span>RBI-regulated Account Aggregator</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full bg-[#10B981]/20 flex items-center justify-center">
                  <Lock className="w-3.5 h-3.5 text-[#34D399]" />
                </div>
                <span>Your data, your consent</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full bg-[#10B981]/20 flex items-center justify-center">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#34D399]" />
                </div>
                <span>Verifiable by lenders</span>
              </div>
            </div>

          </div>

          {/* Right Hero Visual Column (5/12 cols) */}
          <div className="lg:col-span-5 relative flex items-center justify-center pt-8 lg:pt-0">
            
            <div className="relative w-full max-w-md">
              
              {/* Handwritten Cursive Badge (Top Right) */}
              <div className="absolute -top-12 -right-2 transform rotate-6 z-30 pointer-events-none">
                <span className="font-['Caveat',cursive] text-[#FF6600] text-4xl font-bold leading-none drop-shadow-md block">
                  Your Hustle<br />Matters.
                </span>
              </div>

              {/* Main Worker Hero Image */}
              <div className="relative rounded-3xl overflow-hidden border-2 border-white/10 shadow-2xl bg-gradient-to-b from-[#1E293B] to-[#0F172A]">
                <img
                  src="/gig_worker_hero.jpg"
                  alt="Gig Delivery Partner"
                  className="w-full h-[470px] object-cover object-top"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop";
                  }}
                />
              </div>

              {/* Floating UI Card 1 (Top Left Overlay): Total Verified Income */}
              <div className="absolute -top-3 -left-6 bg-white text-[#18181B] rounded-2xl p-4 shadow-2xl border border-slate-100 space-y-1 z-20 min-w-[200px]">
                <span className="text-[10px] text-[#71717A] font-semibold uppercase tracking-wider block">Total Verified Income</span>
                <div className="flex items-center space-x-2">
                  <span className="text-xl font-black text-[#18181B] tracking-tight">₹ 2,57,100</span>
                  <span className="text-[10px] font-extrabold text-[#15803D] bg-[#DCFCE7] px-2 py-0.5 rounded-full flex items-center gap-0.5">
                    ↑ 12%
                  </span>
                </div>
                <span className="text-[10px] text-[#A1A1AA] font-medium block">Last 12 months</span>
              </div>

              {/* Floating UI Card 2 (Bottom Left Overlay): Platform Icons */}
              <div className="absolute bottom-6 -left-8 bg-white text-[#18181B] rounded-2xl p-3.5 shadow-2xl border border-slate-100 space-y-2.5 z-20 w-44">
                <div className="flex items-center space-x-2.5 text-xs font-bold text-slate-800">
                  <div className="w-6 h-6 rounded-md bg-[#FC8019] text-white flex items-center justify-center font-black text-[11px] shrink-0 shadow-xs">S</div>
                  <span className="text-xs font-bold text-slate-800">Swiggy</span>
                </div>
                <div className="flex items-center space-x-2.5 text-xs font-bold text-slate-800">
                  <div className="w-6 h-6 rounded-md bg-[#CB202D] text-white flex items-center justify-center font-black text-[11px] shrink-0 shadow-xs">Z</div>
                  <span className="text-xs font-bold text-slate-800">Zomato</span>
                </div>
                <div className="flex items-center space-x-2.5 text-xs font-bold text-slate-800">
                  <div className="w-6 h-6 rounded-md bg-[#000000] text-white flex items-center justify-center font-black text-[11px] shrink-0 shadow-xs">U</div>
                  <span className="text-xs font-bold text-slate-800">Uber</span>
                </div>
                <span className="block text-[11px] text-[#FF6600] font-extrabold pt-2 border-t border-slate-100 cursor-pointer hover:underline">
                  + More platforms
                </span>
              </div>

              {/* Floating UI Card 3 (Right Overlay): Credit Passport Badge */}
              <div className="absolute top-1/2 -right-8 -translate-y-1/2 bg-white text-[#18181B] rounded-2xl p-3.5 shadow-2xl border border-slate-100 flex items-center space-x-3 z-20 max-w-[185px]">
                <div className="w-10 h-10 rounded-xl bg-[#FFF0E6] text-[#FF6600] flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-[#FF6600]" />
                </div>
                <div>
                  <span className="text-xs font-extrabold text-[#18181B] leading-tight block">Bank Ready<br />Credit Passport</span>
                  <div className="w-5 h-5 rounded-full bg-[#10B981] text-white flex items-center justify-center mt-1 shadow-xs">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>

      </section>

      {/* SECTION 2: How CredBridge Bridges the Gap */}
      <section className="py-20 bg-white" id="how-it-works">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          {/* Section Heading */}
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-black text-[#18181B] tracking-tight">
              How CredBridge <span className="text-[#FF6600]">Bridges the Gap</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#71717A] font-medium">
              Analytical intelligence tailored for India's gig workforce.
            </p>
          </div>

          {/* 3 Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Card 1: Deterministic Analytics */}
            <div className="p-8 rounded-3xl bg-white border border-[#E4E4E7] shadow-xs hover:shadow-lg hover:border-[#FF6600]/40 transition-all space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#FFF0E6] text-[#FF6600] flex items-center justify-center font-bold">
                <BarChart3 className="w-6 h-6 stroke-[2.2] text-[#FF6600]" />
              </div>
              <h3 className="text-lg font-extrabold text-[#18181B]">Deterministic Analytics</h3>
              <p className="text-xs text-[#71717A] font-medium leading-relaxed">
                Aggregates your gig income from multiple platforms into verifiable 12-month insights, with clear breakdowns and trends.
              </p>
            </div>

            {/* Card 2: Consistency Score */}
            <div className="p-8 rounded-3xl bg-white border border-[#E4E4E7] shadow-xs hover:shadow-lg hover:border-[#FF6600]/40 transition-all space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#FFF0E6] text-[#FF6600] flex items-center justify-center font-bold">
                <ShieldCheck className="w-6 h-6 stroke-[2.2] text-[#FF6600]" />
              </div>
              <h3 className="text-lg font-extrabold text-[#18181B]">Consistency Score</h3>
              <p className="text-xs text-[#71717A] font-medium leading-relaxed">
                Measures the stability and reliability of your earnings, helping lenders understand your income consistency (not a credit score).
              </p>
            </div>

            {/* Card 3: Credit Passport & Consent */}
            <div className="p-8 rounded-3xl bg-white border border-[#E4E4E7] shadow-xs hover:shadow-lg hover:border-[#FF6600]/40 transition-all space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#FFF0E6] text-[#FF6600] flex items-center justify-center font-bold">
                <FileText className="w-6 h-6 stroke-[2.2] text-[#FF6600]" />
              </div>
              <h3 className="text-lg font-extrabold text-[#18181B]">Credit Passport & Consent</h3>
              <p className="text-xs text-[#71717A] font-medium leading-relaxed">
                Generate a secure, digitally signed Credit Passport that you can share with lenders, with full control and easy revocation.
              </p>
            </div>

          </div>

          {/* Bottom Statistics Banner */}
          <div className="bg-[#FFF6EE] border border-[#FDE3CF] rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
            
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
                Enabling Opportunities for Every Hustle
              </span>
            </div>

          </div>

        </div>
      </section>

    </div>
  );
};

