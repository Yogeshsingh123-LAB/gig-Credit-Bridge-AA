import React from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Table } from '../../components/ui/Table';

export const AdminDashboardPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Dashboard"
        subtitle="System metrics, active user roles, and compliance telemetry"
      />

      <Card>
        <CardHeader>
          <CardTitle>System Telemetry</CardTitle>
          <CardDescription>Real-time node status and API request volume</CardDescription>
        </CardHeader>
        <CardContent>
          <Table
            columns={[
              { key: 'metric', header: 'System Metric' },
              { key: 'status', header: 'Health Status' },
              { key: 'detail', header: 'Detail' },
            ]}
            data={[
              { id: '1', metric: 'API Gateway', status: 'Healthy', detail: 'FastAPI v1 Engine' },
              { id: '2', metric: 'Database Engine', status: 'Active', detail: 'SQLAlchemy / PostgreSQL' },
              { id: '3', metric: 'Auth Token Subsystem', status: 'Active', detail: 'Bearer Token Standard' },
            ]}
          />
        </CardContent>
      </Card>
    </div>
  );
};
