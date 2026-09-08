import React from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import {
  UserCheck,
  ShieldCheck,
  Award,
  FileBadge,
  AlertTriangle,
  BrainCircuit,
  Sliders,
  Check,
  X
} from 'lucide-react';

export const LenderApplicantPage: React.FC = () => {
  const sections = [
    { title: 'Applicant Overview', icon: UserCheck, desc: 'Identity & gig platform work history' },
    { title: 'Income Verification', icon: ShieldCheck, desc: 'AA consent audit & tamper-evident stream' },
    { title: 'Financial Readiness', icon: Award, desc: 'Payout velocity & cashflow stability analytics' },
    { title: 'Credit Passport', icon: FileBadge, desc: 'Standardized profile & verification certificate' },
    { title: 'Risk/Attention Indicators', icon: AlertTriangle, desc: 'Volatility spikes & cashflow anomaly signals' },
    { title: 'AI Explanation', icon: BrainCircuit, desc: 'Transparent underwriting reasoning model' },
    { title: 'What-If Simulator', icon: Sliders, desc: 'Stress test cashflows under payout scenario changes' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Applicant Assessment Detail"
        subtitle="Comprehensive underwriting assessment layout template"
        badge={<Badge variant="info">Applicant ID: DEMO-APP-001</Badge>}
        action={
          <div className="flex items-center gap-2">
            <Button variant="danger" size="sm" icon={<X className="w-4 h-4" />}>
              Decline Application
            </Button>
            <Button variant="primary" size="sm" icon={<Check className="w-4 h-4" />}>
              Approve Sanction
            </Button>
          </div>
        }
      />

      {/* Visual Component Layout Structure */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sections.map((sec) => {
          const Icon = sec.icon;
          return (
            <Card key={sec.title} className="hover:border-indigo-500/30 transition">
              <CardHeader>
                <div className="flex items-center gap-2 text-indigo-400 mb-1">
                  <Icon className="w-5 h-5" />
                  <Badge variant="neutral" className="text-[10px]">Assessment Module</Badge>
                </div>
                <CardTitle>{sec.title}</CardTitle>
                <CardDescription>{sec.desc}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400 font-mono text-center">
                  [ {sec.title} Module Shell ]
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
