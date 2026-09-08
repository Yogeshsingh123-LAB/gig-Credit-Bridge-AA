import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import {
  ShieldCheck,
  ArrowRight,
  LogIn,
  UserPlus,
  Lock,
  Layers,
  LineChart,
  FileCheck2,
  Share2,
  CheckCircle2
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const steps = [
    { num: '01', title: 'Connect Income Sources', desc: 'Link gig accounts and bank data securely.', icon: Layers },
    { num: '02', title: 'Analyze Income', desc: 'Aggregate cashflow velocity & payout consistency.', icon: LineChart },
    { num: '03', title: 'Verify Financial Evidence', desc: 'Tamper-evident verification of work income.', icon: Lock },
    { num: '04', title: 'Build Credit Passport', desc: 'Generate standardized explainable financial profile.', icon: FileCheck2 },
    { num: '05', title: 'Share With Lender', desc: 'Consent-driven sharing with credit institutions.', icon: Share2 },
  ];

  const features = [
    {
      title: 'Income Verification',
      desc: 'Verify daily gig earnings and platform settlements with direct data evidence.',
      badge: 'Consent-Based',
    },
    {
      title: 'Financial Readiness',
      desc: 'Evaluate payout stability, cashflow velocity, and liquidity resilience.',
      badge: 'Analytics',
    },
    {
      title: 'Explainable Insights',
      desc: 'Transparent scoring breakdown showing why your financial profile is strong.',
      badge: 'Audit Trail',
    },
    {
      title: 'Credit Passport',
      desc: 'Portable financial asset owned by you, ready for lender assessment.',
      badge: 'Standardized',
    },
  ];

  return (
    <div className="space-y-20 py-12">
      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-4 text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4" /> Assessment-Support Platform
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
          CRED<span className="text-indigo-400">BRIDGE</span>
        </h1>

        <h2 className="text-2xl sm:text-3xl font-semibold text-slate-200">
          Financial clarity for the gig economy
        </h2>

        <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Turn your verified work-income history into a clear, explainable financial profile that can help lenders better understand your earning capacity.
        </p>

        {/* Primary & Secondary CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link to="/register">
            <Button size="lg" icon={<UserPlus className="w-5 h-5" />}>
              Get Started
            </Button>
          </Link>
          <Link to="/login">
            <Button variant="outline" size="lg" icon={<LogIn className="w-5 h-5" />}>
              Sign In
            </Button>
          </Link>
        </div>
      </section>

      {/* How CredBridge Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-bold text-white">How CredBridge Works</h3>
          <p className="text-xs sm:text-sm text-slate-400">
            A seamless consent-driven flow from work platforms to lender evaluation
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="relative p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between space-y-4 hover:border-indigo-500/40 transition group"
              >
                <div className="flex items-center justify-between text-slate-500 text-xs font-mono">
                  <span>{step.num}</span>
                  <Icon className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-slate-200 group-hover:text-indigo-300 transition">
                    {step.title}
                  </h4>
                  <p className="text-xs text-slate-400">{step.desc}</p>
                </div>
                {idx < steps.length - 1 && (
                  <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-slate-700">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Feature Cards Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-bold text-white">Core Capabilities</h3>
          <p className="text-xs sm:text-sm text-slate-400">
            Built to provide explainability, privacy, and standardized credit evidence
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat) => (
            <Card key={feat.title} className="hover:border-indigo-500/30 transition">
              <CardHeader>
                <Badge variant="info" className="w-fit mb-2">{feat.badge}</Badge>
                <CardTitle>{feat.title}</CardTitle>
                <CardDescription>{feat.desc}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-xs text-indigo-400 font-medium pt-2">
                  <CheckCircle2 className="w-4 h-4" /> Ready for assessment
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Assessment Support Platform Notice */}
      <section className="max-w-4xl mx-auto px-4 text-center">
        <div className="p-6 rounded-2xl bg-indigo-950/20 border border-indigo-900/40 text-slate-400 space-y-2">
          <h4 className="text-sm font-semibold text-indigo-300">Assessment-Support Platform Notice</h4>
          <p className="text-xs leading-relaxed max-w-2xl mx-auto">
            CredBridge does not directly issue loans or make credit decisions. It provides consent-based verification infrastructure and explainable financial passports to assist regulated financial institutions in underwriting gig workers.
          </p>
        </div>
      </section>
    </div>
  );
};
