import React from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { FileBadge, Download, Share2, Lock } from 'lucide-react';

export const WorkerPassportPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Credit Passport"
        subtitle="Your portable, explainable financial identity for institutional lenders."
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" icon={<Share2 className="w-4 h-4" />}>
              Share Passport
            </Button>
            <Button size="sm" icon={<Download className="w-4 h-4" />}>
              Download PDF
            </Button>
          </div>
        }
      />

      <Card className="border-indigo-500/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <FileBadge className="w-5 h-5" />
              </div>
              <div>
                <CardTitle>CredBridge Credit Passport Shell</CardTitle>
                <CardDescription>Version 1.0 — Consent Audit Standard</CardDescription>
              </div>
            </div>
            <Badge variant="neutral">Draft State</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-6 rounded-xl bg-slate-950/80 border border-slate-800 text-center space-y-2 font-mono text-xs text-slate-400">
            <div>Passport Status: Pending Financial Verification</div>
            <div>Verification Provider: RBI Account Aggregator Gateway</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
