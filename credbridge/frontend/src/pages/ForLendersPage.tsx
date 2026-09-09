import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, ShieldCheck, ArrowRight, CheckCircle2, Lock, 
  BarChart3, Cpu, FileText, Zap, Key, RefreshCw, Check
} from 'lucide-react';

export const ForLendersPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="font-['Plus_Jakarta_Sans',sans-serif] text-[#18181B] antialiased bg-white">
      
      {/* HERO SECTION */}
      <section className="bg-[#0B1220] text-white relative overflow-hidden">
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#FF6600]/12 blur-[180px] rounded-full pointer-events-none" />
        <div className="absolute top-1/2 right-10 w-[500px] h-[500px] bg-[#FF8833]/8 blur-[160px] rounded-full pointer-events-none" />

        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-[#0D2E28] border border-[#10B981]/40 text-[#34D399] text-[11px] font-semibold tracking-wide">
              <Building2 className="w-3.5 h-3.5 text-[#34D399]" />
              <span>INSTITUTIONAL LENDING INFRASTRUCTURE</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.12]">
              Underwrite India's Next 100M Borrowers With <span className="text-[#FF6600]">Deterministic Gig Analytics</span>
            </h1>

            <p className="text-sm sm:text-base text-[#94A3B8] leading-relaxed max-w-xl">
              Replace unreliable PDF bank statement uploads with RBI Account Aggregator verified earnings streams, multi-platform income stability scores, and automated fraud prevention APIs.
            </p>

            <div className="pt-2 flex flex-wrap gap-4">
              <button
                onClick={() => navigate('/login')}
                className="inline-flex items-center space-x-3 px-8 py-4 rounded-xl bg-[#FF6600] hover:bg-[#E65C00] text-white font-extrabold text-sm shadow-xl shadow-[#FF6600]/30 transition-all cursor-pointer active:scale-95"
              >
                <span>Partner Portal Login</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="bg-[#1E293B]/80 backdrop-blur-xl border border-white/10 p-6 rounded-3xl space-y-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <span className="text-xs font-extrabold text-[#34D399] uppercase tracking-wider">LENDER UNDERWRITING COMPARISON</span>
                <span className="text-[10px] text-slate-400">CredBridge vs Traditional</span>
              </div>

              <div className="space-y-4 text-xs">
                <div className="p-3.5 rounded-xl bg-[#0F172A] border border-emerald-500/30 space-y-1">
                  <div className="flex items-center justify-between font-bold text-white">
                    <span>CredBridge Verification</span>
                    <span className="text-emerald-400 font-extrabold">Instant (&lt; 2s)</span>
                  </div>
                  <p className="text-[#94A3B8] text-[11px]">RBI-AA direct bank payload, 100% tamper-proof SHA-256 digital signature.</p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#0F172A]/50 border border-slate-700/50 space-y-1 opacity-70">
                  <div className="flex items-center justify-between font-bold text-slate-400">
                    <span>Traditional Bank Statement PDF</span>
                    <span className="text-rose-400 font-extrabold">3 - 5 Days</span>
                  </div>
                  <p className="text-slate-500 text-[11px]">High risk of Photoshop edits, manual OCR errors, 65% drop-off rate.</p>
                </div>
              </div>

              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-slate-300">
                <span>Default Rate Reduction</span>
                <span className="font-extrabold text-[#FF6600] text-sm">↓ 40%</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* STATS BANNER */}
      <section className="bg-[#FFF6EE] border-y border-[#FDE3CF] py-10">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          <div>
            <span className="text-3xl sm:text-4xl font-black text-[#18181B] block">65%</span>
            <span className="text-xs text-[#71717A] font-semibold mt-1 block">Faster Loan Decisioning Turnaround Time</span>
          </div>
          <div>
            <span className="text-3xl sm:text-4xl font-black text-[#18181B] block">3.2x</span>
            <span className="text-xs text-[#71717A] font-semibold mt-1 block">Higher Approval Rate for NTC Borrowers</span>
          </div>
          <div>
            <span className="text-3xl sm:text-4xl font-black text-[#FF6600] block">0%</span>
            <span className="text-xs text-[#71717A] font-semibold mt-1 block">Document Tampering & Fraud Rate</span>
          </div>
        </div>
      </section>

      {/* LENDER FEATURES */}
      <section className="py-20 bg-white">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-black text-[#18181B] tracking-tight">
              Enterprise Features for <span className="text-[#FF6600]">Banks & NBFCs</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#71717A] font-medium">
              Seamless REST API endpoints and webhooks designed for instant LOS/LMS integration.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-white border border-[#E4E4E7] shadow-xs space-y-4 hover:border-[#FF6600]/40 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-[#FFF0E6] text-[#FF6600] flex items-center justify-center font-bold">
                <BarChart3 className="w-6 h-6 text-[#FF6600]" />
              </div>
              <h3 className="text-lg font-extrabold text-[#18181B]">Income Consistency Engine</h3>
              <p className="text-xs text-[#71717A] font-medium leading-relaxed">
                Evaluates 12-month platform earnings volatility, seasonal spikes, shift frequencies, and income predictability score.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-white border border-[#E4E4E7] shadow-xs space-y-4 hover:border-[#FF6600]/40 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-[#FFF0E6] text-[#FF6600] flex items-center justify-center font-bold">
                <Key className="w-6 h-6 text-[#FF6600]" />
              </div>
              <h3 className="text-lg font-extrabold text-[#18181B]">Cryptographic Verification</h3>
              <p className="text-xs text-[#71717A] font-medium leading-relaxed">
                Verify applicant PDF Credit Passports instantly via automated SHA-256 hash matching on `credbridge.in/verify/report`.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-white border border-[#E4E4E7] shadow-xs space-y-4 hover:border-[#FF6600]/40 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-[#FFF0E6] text-[#FF6600] flex items-center justify-center font-bold">
                <Zap className="w-6 h-6 text-[#FF6600]" />
              </div>
              <h3 className="text-lg font-extrabold text-[#18181B]">REST API & Webhooks</h3>
              <p className="text-xs text-[#71717A] font-medium leading-relaxed">
                Fetch structured JSON payloads directly into your Loan Origination System (LOS) with sub-second latency.
              </p>
            </div>
          </div>

          <div className="text-center pt-6">
            <span className="font-['Caveat',cursive] text-[#FF6600] text-3xl font-bold">
              Turn informal cashflow into trusted credit assets.
            </span>
          </div>

        </div>
      </section>

      {/* BOTTOM CTA */}
      <section className="py-16 bg-[#0B1220] text-white text-center">
        <div className="max-w-2xl mx-auto px-4 space-y-6">
          <h2 className="text-3xl font-black">Empower Your Credit Risk Team</h2>
          <p className="text-xs text-slate-400">Request access to the CredBridge Institutional Sandbox or schedule an API walkthrough.</p>
          <button
            onClick={() => navigate('/login')}
            className="inline-flex items-center space-x-3 px-8 py-4 rounded-xl bg-[#FF6600] hover:bg-[#E65C00] text-white font-extrabold text-sm shadow-xl shadow-[#FF6600]/30 transition-all cursor-pointer active:scale-95"
          >
            <Lock className="w-4 h-4 fill-white/20" />
            <span>Access Lender Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

    </div>
  );
};
