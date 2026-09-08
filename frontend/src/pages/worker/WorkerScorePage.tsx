import React from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Award, Info } from 'lucide-react';

export const WorkerScorePage: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Financial Readiness"
        subtitle="Explainable credit capacity metrics derived from daily cashflow stability."
      />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Readiness Assessment</CardTitle>
              <CardDescription>Gig-tailored financial evaluation model</CardDescription>
            </div>
            <Badge variant="neutral">Not Calculated</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="p-6 rounded-xl bg-slate-950/60 border border-slate-800 text-center space-y-3">
            <Award className="w-10 h-10 text-slate-600 mx-auto" />
            <h4 className="text-sm font-semibold text-slate-300">No Assessment Generated</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Connect your income source platforms and complete verification to generate your financial readiness breakdown.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
