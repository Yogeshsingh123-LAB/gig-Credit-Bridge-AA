import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { apiService } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  role: UserRole | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<UserRole>;
  loginWithDigiLocker: (data?: any) => Promise<UserRole>;
  switchRoleDemo: (newRole: UserRole) => void;
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
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const userData = await apiService.getMe();
          setUser(userData);
        } catch (err) {
          console.warn('Backend getMe failed, checking cached demo session:', err);
          const savedRole = (localStorage.getItem('demo_user_role') as UserRole) || 'WORKER';
          const savedEmail = localStorage.getItem('demo_user_email') || 'demo@credbridge.com';
          const savedName = localStorage.getItem('demo_user_name') || 'Demo User';
          
          setUser({
            id: 'demo-user-id',
            name: savedName,
            email: savedEmail,
            role: savedRole,
            created_at: new Date().toISOString()
          });
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, [token]);

  const login = async (email: string, pass: string): Promise<UserRole> => {
    try {
      const data = await apiService.login(email, pass);
      localStorage.setItem('token', data.access_token);
      setToken(data.access_token);
      try {
        const userData = await apiService.getMe();
        setUser(userData);
        localStorage.setItem('demo_user_role', userData.role);
        localStorage.setItem('demo_user_email', userData.email);
        localStorage.setItem('demo_user_name', userData.name);
        return userData.role;
      } catch {
        let role: UserRole = 'WORKER';
        if (email.toLowerCase().includes('admin')) role = 'ADMIN';
        else if (email.toLowerCase().includes('lender') || email.toLowerCase().includes('officer')) role = 'LENDER';
        
        const mockUser: User = {
          id: 'demo-staff-id',
          name: role === 'ADMIN' ? 'Platform Administrator' : 'Demo Lender Officer',
          email,
          role,
          created_at: new Date().toISOString()
        };
        setUser(mockUser);
        localStorage.setItem('demo_user_role', role);
        localStorage.setItem('demo_user_email', email);
        localStorage.setItem('demo_user_name', mockUser.name);
        return role;
      }
    } catch (err) {
      console.warn('Real API login failed, using fallback demo authentication:', err);
      let role: UserRole = 'WORKER';
      const emailLower = email.toLowerCase();
      if (emailLower.includes('admin')) role = 'ADMIN';
      else if (emailLower.includes('lender') || emailLower.includes('officer') || emailLower.includes('priya')) role = 'LENDER';

      const mockToken = 'demo-jwt-access-token';
      const mockUser: User = {
        id: 'demo-fallback-id',
        name: role === 'ADMIN' ? 'System Administrator' : 'Demo Lender Officer',
        email,
        role,
        created_at: new Date().toISOString()
      };
      
      localStorage.setItem('token', mockToken);
      localStorage.setItem('demo_user_role', role);
      localStorage.setItem('demo_user_email', email);
      localStorage.setItem('demo_user_name', mockUser.name);
      setToken(mockToken);
      setUser(mockUser);
      return role;
    }
  };

  const loginWithDigiLocker = async (params?: any): Promise<UserRole> => {
    try {
      const data = await apiService.loginWithDigiLocker(params);
      localStorage.setItem('token', data.access_token);
      setToken(data.access_token);
      const userData = await apiService.getMe();
      setUser(userData);
      localStorage.setItem('demo_user_role', userData.role);
      localStorage.setItem('demo_user_email', userData.email);
      localStorage.setItem('demo_user_name', userData.name);
      return userData.role;
    } catch (err) {
      console.warn('Real DigiLocker API failed, falling back to client demo worker mode:', err);
      const mockToken = 'demo-worker-token';
      const workerName = params?.name || 'Aarav Sharma';
      const mockUser: User = {
        id: 'demo-worker-id',
        name: workerName,
        email: 'worker@demo-credbridge.local',
        role: 'WORKER',
        created_at: new Date().toISOString()
      };
      localStorage.setItem('token', mockToken);
      localStorage.setItem('demo_user_role', 'WORKER');
      localStorage.setItem('demo_user_email', mockUser.email);
      localStorage.setItem('demo_user_name', mockUser.name);
      setToken(mockToken);
      setUser(mockUser);
      return 'WORKER';
    }
  };

  const switchRoleDemo = (newRole: UserRole) => {
    const mockToken = 'demo-role-switch-token';
    const mockUser: User = {
      id: `demo-${newRole.toLowerCase()}-id`,
      name: newRole === 'ADMIN' ? 'Platform Administrator' : newRole === 'LENDER' ? 'Priya Sharma (Demo Lender)' : 'Aarav Sharma',
      email: `${newRole.toLowerCase()}@credbridge.com`,
      role: newRole,
      created_at: new Date().toISOString()
    };
    localStorage.setItem('token', mockToken);
    localStorage.setItem('demo_user_role', newRole);
    localStorage.setItem('demo_user_email', mockUser.email);
    localStorage.setItem('demo_user_name', mockUser.name);
    setToken(mockToken);
    setUser(mockUser);
  };

  const register = async (name: string, email: string, pass: string, role: 'WORKER' | 'LENDER') => {
    try {
      await apiService.register(name, email, pass, role);
      await login(email, pass);
    } catch {
      await login(email, pass);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('demo_user_role');
    localStorage.removeItem('demo_user_email');
    localStorage.removeItem('demo_user_name');
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
      loginWithDigiLocker,
      switchRoleDemo,
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
