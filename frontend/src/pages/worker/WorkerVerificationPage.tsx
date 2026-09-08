import React from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ShieldCheck, Lock, CheckCircle2 } from 'lucide-react';

export const WorkerVerificationPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Income Verification Engine"
        subtitle="Consent-based financial evidence verification and Account Aggregator audit trails."
      />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Verification Status</CardTitle>
              <CardDescription>RBI Account Aggregator & Platform API consent verification</CardDescription>
            </div>
            <Badge variant="warning">Pending Verification</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400 space-y-2">
            <div className="flex items-center gap-2 text-slate-200 font-semibold">
              <Lock className="w-4 h-4 text-indigo-400" /> Consent Manager Guidelines
            </div>
            <p>
              Your data is fetched exclusively with your explicit consent via RBI-regulated Account Aggregators. CredBridge does not store bank login passwords or credentials.
            </p>
          </div>

          <Button icon={<ShieldCheck className="w-4 h-4" />}>Initiate Verification Flow</Button>
        </CardContent>
      </Card>
    </div>
  );
};
