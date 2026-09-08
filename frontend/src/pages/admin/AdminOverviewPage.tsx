import React from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { ShieldAlert } from 'lucide-react';

export const AdminOverviewPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="System Administration"
        subtitle="Platform governance, API telemetry, and institutional access control."
        badge={<Badge variant="error">Admin Workspace</Badge>}
      />

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 text-rose-400">
            <ShieldAlert className="w-5 h-5" />
            <CardTitle>Platform Control Center</CardTitle>
          </div>
          <CardDescription>System telemetry and administrative audit logs</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-slate-400 leading-relaxed">
            Admin accounts are provisioned exclusively through secure platform management tools. Public registration for Admin role is disabled.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
