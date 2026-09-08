import React from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Table } from '../../components/ui/Table';
import { Users, FileCheck2, Clock, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export const LenderDashboardPage: React.FC = () => {
  const lenderMetrics = [
    { title: 'Total Applications', count: '0', icon: Users },
    { title: 'Applicants', count: '0', icon: FileCheck2 },
    { title: 'Pending Reviews', count: '0', icon: Clock },
    { title: 'Verified Profiles', count: '0', icon: ShieldCheck },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lender Dashboard"
        subtitle="Institutional portfolio metrics & gig worker applicant stream"
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {lenderMetrics.map((m) => {
          const Icon = m.icon;
          return (
            <Card key={m.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardDescription>{m.title}</CardDescription>
                <Icon className="w-4 h-4 text-indigo-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-100">{m.count}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Applicants Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Applicants</CardTitle>
              <CardDescription>Verified gig worker profiles submitted for credit evaluation</CardDescription>
            </div>
            <Link to="/lender/applicant">
              <Badge variant="info" className="hover:underline cursor-pointer">
                View Detail Template
              </Badge>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <Table
            columns={[
              { key: 'applicant', header: 'Applicant Name' },
              { key: 'platform', header: 'Gig Category' },
              { key: 'date', header: 'Submitted Date' },
              { key: 'verification', header: 'Income Verification' },
              { key: 'passport', header: 'Credit Passport' },
            ]}
            data={[]}
            emptyMessage="No pending applicant reviews. Profiles will appear here when workers submit their Credit Passport."
          />
        </CardContent>
      </Card>
    </div>
  );
};
