import React from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Building2, Users } from 'lucide-react';

export const LenderOverviewPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Lender Portal Overview"
        subtitle="Institutional assessment portal for reviewing verified gig worker credit passports."
        badge={<Badge variant="info">Institutional View</Badge>}
      />

      <Card>
        <CardHeader>
          <CardTitle>FIU Underwriter Access</CardTitle>
          <CardDescription>Consent-driven financial verification assessment environment</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-slate-400 leading-relaxed">
            CredBridge provides lenders with explainable, verifiable cashflow profiles. Navigate to the Lender Dashboard or Applicant Assessment to review incoming gig worker profiles.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
