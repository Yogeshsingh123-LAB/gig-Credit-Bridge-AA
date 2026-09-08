import React from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Table } from '../../components/ui/Table';
import { EmptyState } from '../../components/common/EmptyState';
import { Layers, LineChart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export const WorkerDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const welcomeName = user?.name ? user.name : 'Worker';

  const overviewMetrics = [
    { title: 'Monthly Income', value: 'No data available', subtitle: 'Connect an income source' },
    { title: 'Monthly Expenses', value: 'No data available', subtitle: 'Connect bank data' },
    { title: 'Net Income', value: 'No data available', subtitle: 'Calculated upon verification' },
    { title: 'Verification Status', value: 'Unverified', subtitle: 'Action required' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${welcomeName}`}
        subtitle="Financial Overview & Platform Evidence Workspace"
        badge={<Badge variant="warning">Setup Pending</Badge>}
      />

      {/* Financial Metrics Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {overviewMetrics.map((metric) => (
          <Card key={metric.title}>
            <CardHeader className="mb-2">
              <CardDescription>{metric.title}</CardDescription>
              <div className="text-lg font-bold text-slate-200 mt-1">{metric.value}</div>
            </CardHeader>
            <CardContent>
              <span className="text-[11px] text-slate-500 font-mono">{metric.subtitle}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Income Chart & Platform Status Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Income Overview Chart Placeholder */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Income Overview</CardTitle>
            <CardDescription>Daily cashflow velocity and payout consistency chart</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col items-center justify-center p-6 text-center space-y-2">
              <LineChart className="w-10 h-10 text-slate-600" />
              <p className="text-xs font-semibold text-slate-400">Chart Placeholder</p>
              <p className="text-xs text-slate-500 max-w-xs">
                Your financial profile is not ready yet. Connect your income sources to start building analytics.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Connected Platforms */}
        <Card>
          <CardHeader>
            <CardTitle>Connected Platforms</CardTitle>
            <CardDescription>Work source evidence streams</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <EmptyState
              icon={<Layers className="w-6 h-6 text-slate-500" />}
              title="No connected platforms"
              description="Connect an income source to get started."
              actionText="Add Platform"
              onAction={() => navigate('/worker/platforms')}
            />
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Table Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Tamper-evident transaction & payout audit stream</CardDescription>
        </CardHeader>
        <CardContent>
          <Table
            columns={[
              { key: 'date', header: 'Date' },
              { key: 'source', header: 'Source' },
              { key: 'amount', header: 'Amount' },
              { key: 'status', header: 'Status' },
            ]}
            data={[]}
            emptyMessage="No transaction data available. Connect an income source to sync activity."
          />
        </CardContent>
      </Card>
    </div>
  );
};
