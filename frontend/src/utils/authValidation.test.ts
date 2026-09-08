import { getDefaultRouteForRole, isValidEmail, isValidPassword } from './roleUtils';

describe('Auth Validation & Role Routing Helpers', () => {
  test('isValidEmail returns true for valid email formats', () => {
    expect(isValidEmail('worker@credbridge.io')).toBe(true);
    expect(isValidEmail('lender.test@domain.co.in')).toBe(true);
  });

  test('isValidEmail returns false for invalid email formats', () => {
    expect(isValidEmail('invalid-email')).toBe(false);
    expect(isValidEmail('user@domain')).toBe(false);
    expect(isValidEmail('')).toBe(false);
  });

  test('isValidPassword enforces minimum length of 6 characters', () => {
    expect(isValidPassword('123456')).toBe(true);
    expect(isValidPassword('securePassword123')).toBe(true);
    expect(isValidPassword('12345')).toBe(false);
    expect(isValidPassword('')).toBe(false);
  });

  test('getDefaultRouteForRole maps roles to appropriate dashboards', () => {
    expect(getDefaultRouteForRole('WORKER')).toBe('/worker/dashboard');
    expect(getDefaultRouteForRole('LENDER')).toBe('/lender/dashboard');
    expect(getDefaultRouteForRole('ADMIN')).toBe('/admin/dashboard');
    expect(getDefaultRouteForRole(undefined)).toBe('/login');
  });
});
