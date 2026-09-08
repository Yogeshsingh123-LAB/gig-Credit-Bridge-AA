export interface PlatformConnection {
  id: string;
  name: string;
  category: 'delivery' | 'rideshare' | 'home_services' | 'freelance';
  connected: boolean;
  lastSyncedAt?: string;
}

export interface WorkerProfileSummary {
  id: string;
  fullName: string;
  verificationStatus: 'unverified' | 'pending' | 'verified';
  connectedPlatformsCount: number;
  passportGenerated: boolean;
}
