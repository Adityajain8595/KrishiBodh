import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50">
        <div className="flex items-center gap-3 rounded-xl border border-surface-200 bg-white px-5 py-4 shadow-card">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-surface-300 border-t-primary-600" />
          <span className="text-sm text-surface-600">Loading...</span>
        </div>
      </div>
    );
  }

  if (user) return <Navigate to="/" replace />;
  return <>{children}</>;
}

