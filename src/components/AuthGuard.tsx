import { ReactNode, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

type AuthGuardProps = {
  children: ReactNode;
  requireActiveOrg?: boolean;
};

const AuthGuard = ({ children, requireActiveOrg = false }: AuthGuardProps) => {
  const { user, loading, session } = useAuth();
  const location = useLocation();

  // Check for session expiration or other authentication issues
  useEffect(() => {
    if (!loading && !user && session === null) {
      // If we were previously authenticated but now aren't
      toast.error('Your session has expired. Please log in again.');
    }
  }, [user, loading, session]);

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">
      <div className="w-12 h-12 rounded-full border-t-2 border-b-2 border-blue-500 animate-spin"></div>
    </div>;
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if an active organization is required but not present
  if (requireActiveOrg && !session?.activeOrganizationId) {
    toast.error('Please select an active organization');
    return <Navigate to="/organizations" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default AuthGuard;
