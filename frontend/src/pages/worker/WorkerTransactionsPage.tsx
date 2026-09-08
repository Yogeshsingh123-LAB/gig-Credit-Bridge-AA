import React from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Table } from '../../components/ui/Table';
import { EmptyState } from '../../components/common/EmptyState';
import { Receipt } from 'lucide-react';

export const WorkerTransactionsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Verified Transactions"
        subtitle="Historical stream of platform settlements, daily payouts, and account activity."
      />

      <Card>
        <CardHeader>
          <CardTitle>Payout History</CardTitle>
          <CardDescription>Verified cashflow evidence list</CardDescription>
        </CardHeader>
        <CardContent>
          <Table
            columns={[
              { key: 'id', header: 'Transaction ID' },
              { key: 'source', header: 'Platform / Bank' },
              { key: 'date', header: 'Date' },
              { key: 'amount', header: 'Amount' },
              { key: 'status', header: 'Status' },
            ]}
            data={[]}
            emptyMessage="No transaction records available. Connect an income platform to sync transaction streams."
          />
        </CardContent>
      </Card>
    </div>
  );
};
