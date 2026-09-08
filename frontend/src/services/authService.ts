import { apiClient } from './api';
import { LoginPayload, RegisterPayload, AuthResponse, User } from '../types/auth';
import axios from 'axios';

export const authService = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/login', payload);
      return response.data;
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        const msg = error.response?.data?.detail || error.response?.data?.message || 'Invalid email or password';
        throw new Error(msg);
      }
      throw error;
    }
  },

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    try {
      // Format payload according to API conventions
      const body = {
        full_name: payload.fullName,
        email: payload.email,
        password: payload.password,
        role: payload.role.toUpperCase(),
      };
      const response = await apiClient.post<AuthResponse>('/auth/register', body);
      return response.data;
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        const msg = error.response?.data?.detail || error.response?.data?.message || 'Registration failed';
        throw new Error(msg);
      }
      throw error;
    }
  },

  async getCurrentUser(): Promise<User> {
    try {
      const response = await apiClient.get<User | { user: User }>('/auth/me');
      const data: any = response.data;
      if (data && data.user) {
        return data.user;
      }
      return data as User;
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        const msg = error.response?.data?.detail || error.response?.data?.message || 'Session expired';
        throw new Error(msg);
      }
      throw error;
    }
  },
};
