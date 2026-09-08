import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, LoginPayload, RegisterPayload } from '../types/auth';
import { authService } from '../services/authService';
import { TOKEN_STORAGE_KEY } from '../services/api';

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authError: string | null;
  login: (payload: LoginPayload) => Promise<UserRole>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  clearError: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem(TOKEN_STORAGE_KEY));
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // Restore Session on Mount
  useEffect(() => {
    const restoreSession = async () => {
      const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        setToken(storedToken);
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
        setIsAuthenticated(true);
      } catch (err: any) {
        // Token is invalid/expired
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  // Listen for global 401 Unauthorized events from Axios Interceptor
  useEffect(() => {
    const handleUnauthorized = () => {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const login = async (payload: LoginPayload): Promise<UserRole> => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const res = await authService.login(payload);
      const accessToken = res.access_token || res.token;

      if (!accessToken) {
        throw new Error('Authentication succeeded but no access token was returned.');
      }

      localStorage.setItem(TOKEN_STORAGE_KEY, accessToken);
      setToken(accessToken);

      // Fetch user profile from /auth/me or use returned user
      let currentUser = res.user;
      if (!currentUser) {
        currentUser = await authService.getCurrentUser();
      }

      setUser(currentUser);
      setIsAuthenticated(true);

      const role: UserRole = currentUser.role ? (currentUser.role.toUpperCase() as UserRole) : 'WORKER';
      return role;
    } catch (err: any) {
      const msg = err.message || 'Unable to connect to server';
      setAuthError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: RegisterPayload): Promise<void> => {
    setIsLoading(true);
    setAuthError(null);
    try {
      await authService.register(payload);
    } catch (err: any) {
      const msg = err.message || 'Registration failed';
      setAuthError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    setAuthError(null);
  };

  const refreshUser = async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch (err: any) {
      logout();
    }
  };

  const clearError = () => setAuthError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isLoading,
        authError,
        login,
        register,
        logout,
        refreshUser,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
