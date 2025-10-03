import React from 'react';
import { useAuth } from '@/shared-kernel/auth/AuthContext';
import { LoginForm } from './LoginForm';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'regional_partner' | 'neighborhood_agent';
  allowedRoles?: string[];
  fallback?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  allowedRoles,
  fallback
}) => {
  const { user, loading, isAdmin, isPartner, isAgent } = useAuth();

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If no user, show login form
  if (!user) {
    return fallback || <LoginForm />;
  }

  // Check role-based access
  if (requiredRole) {
    const hasRequiredRole = 
      (requiredRole === 'admin' && isAdmin) ||
      (requiredRole === 'regional_partner' && isPartner) ||
      (requiredRole === 'neighborhood_agent' && isAgent);

    if (!hasRequiredRole) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
            <p className="text-gray-600 mb-6">
              You don't have permission to access this area.
            </p>
            <p className="text-sm text-gray-500">
              Required role: {requiredRole} | Your role: {user.role || 'none'}
            </p>
          </div>
        </div>
      );
    }
  }

  // Check multiple allowed roles
  if (allowedRoles && !allowedRoles.includes(user.role || '')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">
            You don't have permission to access this area.
          </p>
          <p className="text-sm text-gray-500">
            Allowed roles: {allowedRoles.join(', ')} | Your role: {user.role || 'none'}
          </p>
        </div>
      </div>
    );
  }

  // User is authenticated and authorized
  return <>{children}</>;
};