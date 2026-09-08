import { UserRole } from '../types/auth';

export const getDefaultRouteForRole = (role?: UserRole): string => {
  switch (role) {
    case 'WORKER':
      return '/worker/dashboard';
    case 'LENDER':
      return '/lender/dashboard';
    case 'ADMIN':
      return '/admin/dashboard';
    default:
      return '/login';
  }
};

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

export const isValidPassword = (password: string): boolean => {
  return password.length >= 6;
};
