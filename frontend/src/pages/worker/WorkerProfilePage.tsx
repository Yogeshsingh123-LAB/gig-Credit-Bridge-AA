import React from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { User, Mail, Phone, MapPin, Save } from 'lucide-react';

export const WorkerProfilePage: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Worker Profile"
        subtitle="Manage your identity details, gig worker category, and contact information."
      />

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Personal Details</CardTitle>
          <CardDescription>Verify your identity information for lender assessment</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input label="Full Name" defaultValue="Ramesh Kumar" icon={<User className="w-4 h-4" />} />
          <Input label="Email Address" defaultValue="ramesh.worker@example.com" icon={<Mail className="w-4 h-4" />} />
          <Input label="Phone Number" defaultValue="+91 98765 43210" icon={<Phone className="w-4 h-4" />} />
          <Input label="Primary Operating City" defaultValue="Bengaluru, Karnataka" icon={<MapPin className="w-4 h-4" />} />

          <div className="pt-2">
            <Button icon={<Save className="w-4 h-4" />}>Save Profile Changes</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
