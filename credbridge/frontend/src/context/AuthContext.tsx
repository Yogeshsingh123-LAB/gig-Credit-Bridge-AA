import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { apiService } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  role: UserRole | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<UserRole>;
  register: (name: string, email: string, pass: string, role: 'WORKER' | 'LENDER') => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const userData = await apiService.getMe();
          setUser(userData);
        } catch (err) {
          console.error('Failed to restore auth session:', err);
          logout();
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, [token]);

  const login = async (email: string, pass: string): Promise<UserRole> => {
    const data = await apiService.login(email, pass);
    localStorage.setItem('token', data.access_token);
    setToken(data.access_token);
    const userData = await apiService.getMe();
    setUser(userData);
    return userData.role;
  };

  const register = async (name: string, email: string, pass: string, role: 'WORKER' | 'LENDER') => {
    await apiService.register(name, email, pass, role);
    await login(email, pass);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      role: user?.role || null,
      isLoading,
      login,
      register,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
