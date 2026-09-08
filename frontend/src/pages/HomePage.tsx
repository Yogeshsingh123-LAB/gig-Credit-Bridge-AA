import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, TrendingUp, Award, FileCheck2, Lock, ArrowRight, Zap, CheckCircle } from 'lucide-react';

export const HomePage: React.FC = () => {
  return (
    <div className="relative overflow-hidden">
      {/* Background Glow Effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 blur-[140px] rounded-full pointer-events-none" />

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-6">
          <Zap className="w-3.5 h-3.5" />
          <span>Gig Worker Financial Verification Platform</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
          Turn Gig Income Into <br />
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
            Trusted Financial Evidence
          </span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
          CredBridge empowers Uber, Swiggy, Zomato, and Urban Company gig workers to consolidate fragmented earnings, verify cashflow, and share explainable Credit Passports with lenders.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/register"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-base shadow-xl shadow-emerald-500/25 transition-all flex items-center justify-center space-x-2"
          >
            <span>Get Started as Worker</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white font-semibold text-base transition-colors"
          >
            <span>Lender Portal Sign In</span>
          </Link>
        </div>

        <div className="mt-12 flex flex-wrap justify-center items-center gap-6 text-xs text-slate-400 font-medium">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>Deterministic Math</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>Consent-Based Sharing</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>Zero Bureau Claim</span>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="py-16 bg-slate-900/60 border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">How CredBridge Bridges the Gap</h2>
            <p className="text-sm text-slate-400 mt-2">Analytical intelligence tailored for non-traditional gig earnings.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-white">Deterministic Analytics</h3>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                Aggregates payouts across multiple gig platforms into verifiable monthly statistics, volatility indices, and trends.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-teal-500/50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center mb-4">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-white">Financial Readiness Score</h3>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                Calculates an explainable 0–100 Readiness Score based on income stability, coverage, data quality, and financial sustainability.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-4">
                <FileCheck2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-white">Credit Passport & Consent</h3>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                Workers maintain total control over who views their financial evidence, with time-bound active consent and instant revocation.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
