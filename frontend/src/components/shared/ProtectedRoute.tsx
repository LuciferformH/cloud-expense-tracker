// ==========================================
// Protected Route Component
// ==========================================
// Wraps routes that require authentication.
// Redirects to login if user is not authenticated.
// Shows loading spinner while checking auth status.

import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../store/AuthContext";
import LoadingSpinner from "../ui/LoadingSpinner";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
