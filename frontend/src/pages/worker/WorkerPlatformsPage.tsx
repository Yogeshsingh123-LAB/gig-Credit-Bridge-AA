import React from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Layers, Plus, Link2, CheckCircle2 } from 'lucide-react';

export const WorkerPlatformsPage: React.FC = () => {
  const supportedPlatforms = [
    { name: 'Zomato Partner', category: 'Food Delivery', connected: false },
    { name: 'Swiggy Delivery', category: 'Food Delivery', connected: false },
    { name: 'Uber Driver', category: 'Rideshare', connected: false },
    { name: 'Urban Company', category: 'Home Services', connected: false },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Income Source Platforms"
        subtitle="Link your gig platform accounts to automatically verify your daily cashflows."
        action={<Button icon={<Plus className="w-4 h-4" />}>Connect New Platform</Button>}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {supportedPlatforms.map((plat) => (
          <Card key={plat.name}>
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle>{plat.name}</CardTitle>
                <CardDescription>{plat.category}</CardDescription>
              </div>
              <Badge variant={plat.connected ? 'success' : 'neutral'}>
                {plat.connected ? 'Connected' : 'Not Connected'}
              </Badge>
            </CardHeader>
            <CardContent>
              <Button
                variant={plat.connected ? 'outline' : 'secondary'}
                size="sm"
                className="w-full"
                icon={<Link2 className="w-4 h-4" />}
              >
                {plat.connected ? 'Manage Connection' : 'Connect Account'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
