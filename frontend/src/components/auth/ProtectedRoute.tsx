import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex items-center gap-3 rounded-xl border border-surface-200 bg-white px-5 py-4 shadow-card">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-surface-300 border-t-primary-600" />
          <span className="text-sm text-surface-600">Checking session...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    // Redirect to landing page instead of login for better UX
    return <Navigate to="/landing" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}

