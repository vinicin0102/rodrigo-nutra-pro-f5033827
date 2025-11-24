import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: ReactNode;
  requireDiamond?: boolean;
}

export const ProtectedRoute = ({ children, requireDiamond = false }: ProtectedRouteProps) => {
  const { user, loading, isDiamond } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (requireDiamond && !isDiamond) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
