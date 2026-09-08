export interface HealthResponse {
  status: string;
  service: string;
}

export interface ApiStatus {
  connected: boolean;
  loading: boolean;
  error: string | null;
  data?: HealthResponse | null;
}
