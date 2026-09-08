import axios from 'axios';
import { ApiHealthResponse } from '../types/common';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000,
});

export const checkApiHealth = async (): Promise<ApiHealthResponse> => {
  try {
    const response = await apiClient.get<ApiHealthResponse>('/health');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to connect to CredBridge API');
    }
    throw error;
  }
};
