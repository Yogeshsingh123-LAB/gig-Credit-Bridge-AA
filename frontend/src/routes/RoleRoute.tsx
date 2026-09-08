import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../types/auth';
import { getDefaultRouteForRole } from '../utils/roleUtils';
import { LoadingState } from '../components/common/LoadingState';

export interface RoleRouteProps {
  allowedRoles: UserRole[];
}

export const RoleRoute: React.FC<RoleRouteProps> = ({ allowedRoles }) => {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <LoadingState message="Verifying workspace permissions..." />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const normalizedUserRole = (user.role ? user.role.toUpperCase() : '') as UserRole;

  if (!allowedRoles.includes(normalizedUserRole)) {
    // Cross-role redirect according to prompt requirements
    const targetRoute = getDefaultRouteForRole(normalizedUserRole);
    return <Navigate to={targetRoute} replace />;
  }

  return <Outlet />;
};
