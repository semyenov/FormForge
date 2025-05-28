import { ReactNode, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";

type AuthGuardProps = {
  children: ReactNode;
  requireActiveOrg?: boolean;
};

const AuthGuard = ({ children, requireActiveOrg = false }: AuthGuardProps) => {
  const { isAuthenticated, user, session, loading, error } = useAuth();
  const location = useLocation();

  // Handle authentication errors
  useEffect(() => {
    if (error) {
      toast.error(
        error.message || "Authentication error. Please log in again.",
      );
    }
  }, [error]);

  // Check for session expiration or other authentication issues
  useEffect(() => {
    // If we had a user but now we don't, and we're not in the loading state
    if (
      !isAuthenticated &&
      !loading &&
      sessionStorage.getItem("was_authenticated")
    ) {
      toast.error("Your session has expired. Please log in again.");
      sessionStorage.removeItem("was_authenticated");
    }

    // Set a flag to detect future session expirations
    if (isAuthenticated) {
      sessionStorage.setItem("was_authenticated", "true");
    }
  }, [isAuthenticated, loading]);

  // Show loading spinner while auth state is being determined
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if an active organization is required but not present
  if (requireActiveOrg && !session?.activeOrganizationId) {
    toast.error("Please select an active organization");
    return <Navigate to="/organizations" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default AuthGuard;
