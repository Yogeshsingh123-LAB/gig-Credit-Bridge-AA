export type UserRole = 'WORKER' | 'LENDER' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  is_active?: boolean;
  createdAt?: string;
}

export interface LoginPayload {
  email: string;
  password?: string;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  password?: string;
  role: UserRole;
}

export interface AuthResponse {
  access_token?: string;
  token?: string;
  token_type?: string;
  user?: User;
  message?: string;
}
