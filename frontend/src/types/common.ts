export type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral';

export interface NavItem {
  label: string;
  path: string;
  icon?: string;
  badge?: string;
}

export interface ApiHealthResponse {
  status: string;
  service: string;
}

export interface UIState {
  isLoading: boolean;
  error: string | null;
}
