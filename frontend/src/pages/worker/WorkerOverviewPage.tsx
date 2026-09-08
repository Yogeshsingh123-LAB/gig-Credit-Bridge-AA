import React from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { EmptyState } from '../../components/common/EmptyState';
import { Badge } from '../../components/ui/Badge';
import { Layers, ShieldCheck, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const WorkerOverviewPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Worker Portal Overview"
        subtitle="Manage your connected gig income sources, view cashflow verification status, and generate your Credit Passport."
        badge={<Badge variant="info">Worker Portal</Badge>}
      />

      <EmptyState
        icon={<Layers className="w-8 h-8 text-indigo-400" />}
        title="No income sources connected"
        description="Connect your gig platform accounts (Zomato, Uber, Swiggy, Urban Company) or bank data to start building your verified financial profile."
        actionText="Connect Platforms"
        onAction={() => navigate('/worker/platforms')}
      />
    </div>
  );
};
