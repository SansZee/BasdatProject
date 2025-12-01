import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user, loading } = useAuth();

  // Show loading saat check authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-accent border-t-transparent mx-auto mb-4"></div>
          <p className="text-light">Loading...</p>
        </div>
      </div>
    );
  }

  // Kalau belum login, redirect ke login page
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Kalau ada role requirement, check role user
  if (allowedRoles && user) {
    if (!allowedRoles.includes(user.role_name)) {
      // User tidak punya permission, redirect ke home
      return <Navigate to="/" replace />;
    }
  }

  // Semua check passed, render children
  return <>{children}</>;
}