import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, Lock, ArrowRight, Award, Target, Heart, 
  Users, CheckCircle2, Building2, Sparkles, LineChart, Cpu
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="font-['Plus_Jakarta_Sans',sans-serif] text-[#18181B] antialiased bg-white">
      
      {/* HERO SECTION */}
      <section className="bg-[#0B1220] text-white relative overflow-hidden">
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#FF6600]/12 blur-[180px] rounded-full pointer-events-none" />
        <div className="absolute top-1/2 right-10 w-[500px] h-[500px] bg-[#FF8833]/8 blur-[160px] rounded-full pointer-events-none" />

        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 text-center relative z-10 space-y-6">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-[#0D2E28] border border-[#10B981]/40 text-[#34D399] text-[11px] font-semibold tracking-wide">
            <ShieldCheck className="w-3.5 h-3.5 text-[#34D399]" />
            <span>OUR MISSION & VISION</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15] max-w-4xl mx-auto">
            Empowering India's <span className="text-[#FF6600]">12M+ Gig Workforce</span> With Bank-Grade Financial Recognition
          </h1>

          <p className="text-sm sm:text-base text-[#94A3B8] max-w-2xl mx-auto leading-relaxed">
            CredBridge builds consent-driven financial infrastructure that transforms informal gig earnings from Swiggy, Zomato, Uber, and more into verifiable Credit Passports accepted by premier financial institutions.
          </p>

          <div className="pt-4 flex justify-center">
            <button
              onClick={() => navigate('/login')}
              className="inline-flex items-center space-x-3 px-8 py-4 rounded-xl bg-[#FF6600] hover:bg-[#E65C00] text-white font-extrabold text-sm shadow-xl shadow-[#FF6600]/30 transition-all cursor-pointer active:scale-95"
            >
              <Lock className="w-4 h-4 fill-white/20" />
              <span>Continue with DigiLocker</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* STATS BANNER */}
      <section className="bg-[#FFF6EE] border-y border-[#FDE3CF] py-10">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <span className="text-3xl sm:text-4xl font-black text-[#18181B] block">₹ 500 Cr+</span>
            <span className="text-xs text-[#71717A] font-semibold mt-1 block">Gig Earnings Verified</span>
          </div>
          <div>
            <span className="text-3xl sm:text-4xl font-black text-[#18181B] block">50,000+</span>
            <span className="text-xs text-[#71717A] font-semibold mt-1 block">Credit Passports Issued</span>
          </div>
          <div>
            <span className="text-3xl sm:text-4xl font-black text-[#18181B] block">15+</span>
            <span className="text-xs text-[#71717A] font-semibold mt-1 block">Lending Partners</span>
          </div>
          <div>
            <span className="text-3xl sm:text-4xl font-black text-[#FF6600] block">4.9 / 5</span>
            <span className="text-xs text-[#71717A] font-semibold mt-1 block">Worker Trust Score</span>
          </div>
        </div>
      </section>

      {/* CORE PILLARS */}
      <section className="py-20 bg-white">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-black text-[#18181B] tracking-tight">
              Why We Built <span className="text-[#FF6600]">CredBridge</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#71717A] font-medium">
              India's gig economy is growing exponentially, but traditional credit scoring leaves hardworking delivery partners and drivers behind.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-white border border-[#E4E4E7] shadow-xs space-y-4 hover:border-[#FF6600]/40 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-[#FFF0E6] text-[#FF6600] flex items-center justify-center font-bold">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-extrabold text-[#18181B]">The Problem</h3>
              <p className="text-xs text-[#71717A] leading-relaxed font-medium">
                60% of gig workers lack formal pay slips or IT returns, leading to immediate loan rejections despite consistent monthly incomes of ₹25,000 to ₹50,000.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-white border border-[#E4E4E7] shadow-xs space-y-4 hover:border-[#FF6600]/40 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-[#FFF0E6] text-[#FF6600] flex items-center justify-center font-bold">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-extrabold text-[#18181B]">Our Solution</h3>
              <p className="text-xs text-[#71717A] leading-relaxed font-medium">
                Using RBI-regulated Account Aggregators, we aggregate multi-platform earnings into 12-month deterministic analytics, creating an bank-ready Credit Passport.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-white border border-[#E4E4E7] shadow-xs space-y-4 hover:border-[#FF6600]/40 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-[#FFF0E6] text-[#FF6600] flex items-center justify-center font-bold">
                <Heart className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-extrabold text-[#18181B]">Our Vision</h3>
              <p className="text-xs text-[#71717A] leading-relaxed font-medium">
                Every gig worker in India gets fair, instant access to personal loans, vehicle financing, and credit cards backed by their real daily hustle.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CORE VALUES */}
      <section className="py-16 bg-[#FAF9F6] border-t border-[#E4E4E7]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#18181B]">Guided By Uncompromising Principles</h2>
              <p className="text-xs text-[#71717A] font-medium mt-1">Data security and worker empowerment at every step.</p>
            </div>
            <span className="font-['Caveat',cursive] text-[#FF6600] text-3xl font-bold">
              Financial dignity for every gig hero.
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-2">
              <ShieldCheck className="w-6 h-6 text-[#10B981]" />
              <h4 className="font-extrabold text-sm text-slate-900">100% Consent-Driven</h4>
              <p className="text-xs text-slate-500 font-medium">You decide who sees your financial data and when to revoke access.</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-2">
              <Lock className="w-6 h-6 text-[#FF6600]" />
              <h4 className="font-extrabold text-sm text-slate-900">Zero Password Storage</h4>
              <p className="text-xs text-slate-500 font-medium">We never ask for or store your bank passwords or OTPs.</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-2">
              <Award className="w-6 h-6 text-[#3B82F6]" />
              <h4 className="font-extrabold text-sm text-slate-900">Cryptographically Signed</h4>
              <p className="text-xs text-slate-500 font-medium">All reports feature tamper-proof SHA-256 digital signatures.</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-2">
              <Users className="w-6 h-6 text-[#8B5CF6]" />
              <h4 className="font-extrabold text-sm text-slate-900">Worker First</h4>
              <p className="text-xs text-slate-500 font-medium">Built specifically to serve India's delivery partners, drivers, and freelancers.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER CTA */}
      <section className="py-16 bg-[#0B1220] text-white text-center">
        <div className="max-w-2xl mx-auto px-4 space-y-6">
          <h2 className="text-3xl font-black">Ready to verify your gig income?</h2>
          <p className="text-xs text-slate-400">Generate your free, bank-ready Credit Passport in less than 2 minutes with DigiLocker.</p>
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
