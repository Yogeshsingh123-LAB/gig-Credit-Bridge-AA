import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, Lock, ArrowRight, ShieldCheck, Cpu, FileText, 
  Download, Building2, Sparkles, Layers
} from 'lucide-react';

export const HowItWorksPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="font-['Plus_Jakarta_Sans',sans-serif] text-[#18181B] antialiased bg-white">
      
      {/* HERO SECTION */}
      <section className="bg-[#0B1220] text-white relative overflow-hidden">
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#FF6600]/12 blur-[180px] rounded-full pointer-events-none" />
        <div className="absolute top-1/2 right-10 w-[500px] h-[500px] bg-[#FF8833]/8 blur-[160px] rounded-full pointer-events-none" />

        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-24 text-center relative z-10 space-y-6">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-[#0D2E28] border border-[#10B981]/40 text-[#34D399] text-[11px] font-semibold tracking-wide">
            <Layers className="w-3.5 h-3.5 text-[#34D399]" />
            <span>HOW CREDBRIDGE WORKS</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15] max-w-3xl mx-auto">
            From Gig Earnings To <span className="text-[#FF6600]">Credit Passport</span> In 4 Easy Steps
          </h1>

          <p className="text-sm sm:text-base text-[#94A3B8] max-w-xl mx-auto leading-relaxed font-normal">
            No paperwork. No physical branch visits. 100% consent-driven data aggregation powered by RBI-regulated Account Aggregators.
          </p>

          <div className="pt-2 flex justify-center">
            <button
              onClick={() => navigate('/login')}
              className="inline-flex items-center space-x-3 px-8 py-4 rounded-xl bg-[#FF6600] hover:bg-[#E65C00] text-white font-extrabold text-sm shadow-xl shadow-[#FF6600]/30 transition-all cursor-pointer active:scale-95"
            >
              <Lock className="w-4 h-4 fill-white/20" />
              <span>Start Free Verification</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 4 STEPS TIMELINE */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-16">
          
          {/* Step 1 */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-2 flex justify-center">
              <div className="w-16 h-16 rounded-3xl bg-[#FFF0E6] text-[#FF6600] border border-[#FF6600]/30 flex items-center justify-center font-black text-2xl shadow-xs">
                01
              </div>
            </div>
            <div className="md:col-span-10 space-y-2">
              <span className="text-xs font-bold text-[#FF6600] uppercase tracking-wider">STEP 1 — INSTANT IDENTITY</span>
              <h3 className="text-xl font-extrabold text-slate-900">Authenticate via DigiLocker</h3>
              <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                Log in securely using DigiLocker. CredBridge fetches your verified Aadhaar / PAN identity details in seconds without requiring manual document uploads or passwords.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-2 flex justify-center">
              <div className="w-16 h-16 rounded-3xl bg-[#FFF0E6] text-[#FF6600] border border-[#FF6600]/30 flex items-center justify-center font-black text-2xl shadow-xs">
                02
              </div>
            </div>
            <div className="md:col-span-10 space-y-2">
              <span className="text-xs font-bold text-[#FF6600] uppercase tracking-wider">STEP 2 — ACCOUNT AGGREGATOR</span>
              <h3 className="text-xl font-extrabold text-slate-900">Link Your Payout Bank Accounts</h3>
              <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                Grant one-time consent through an RBI-regulated Account Aggregator (AA) network to link the bank accounts where you receive Swiggy, Zomato, or Uber payouts.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-2 flex justify-center">
              <div className="w-16 h-16 rounded-3xl bg-[#FFF0E6] text-[#FF6600] border border-[#FF6600]/30 flex items-center justify-center font-black text-2xl shadow-xs">
                03
              </div>
            </div>
            <div className="md:col-span-10 space-y-2">
              <span className="text-xs font-bold text-[#FF6600] uppercase tracking-wider">STEP 3 — AI ANALYTICS</span>
              <h3 className="text-xl font-extrabold text-slate-900">Deterministic Analytics & Consistency Score</h3>
              <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                Our intelligence engine categorizes earnings, tracks seasonal trends, and computes your income consistency score across 12 months.
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-2 flex justify-center">
              <div className="w-16 h-16 rounded-3xl bg-[#FFF0E6] text-[#FF6600] border border-[#FF6600]/30 flex items-center justify-center font-black text-2xl shadow-xs">
                04
              </div>
            </div>
            <div className="md:col-span-10 space-y-2">
              <span className="text-xs font-bold text-[#FF6600] uppercase tracking-wider">STEP 4 — CREDIT PASSPORT</span>
              <h3 className="text-xl font-extrabold text-slate-900">Share With Banks & Lenders</h3>
              <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                Download your cryptographically signed SHA-256 Credit Passport PDF or share a direct verification link with participating lenders for instant approval.
              </p>
            </div>
          </div>

          <div className="text-center pt-6">
            <span className="font-['Caveat',cursive] text-[#FF6600] text-3xl font-bold">
              Enabling Opportunities for Every Hustle.
            </span>
          </div>

        </div>
      </section>

      {/* BOTTOM CTA */}
      <section className="py-16 bg-[#0B1220] text-white text-center">
        <div className="max-w-2xl mx-auto px-4 space-y-6">
          <h2 className="text-3xl font-black">Ready to verify your income?</h2>
          <p className="text-xs text-slate-400">Join 50,000+ gig workers with verified credit profiles.</p>
          <button
            onClick={() => navigate('/login')}
            className="inline-flex items-center space-x-3 px-8 py-4 rounded-xl bg-[#FF6600] hover:bg-[#E65C00] text-white font-extrabold text-sm shadow-xl shadow-[#FF6600]/30 transition-all cursor-pointer active:scale-95"
          >
            <Lock className="w-4 h-4 fill-white/20" />
            <span>Continue with DigiLocker</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

    </div>
  );
};
