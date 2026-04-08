import { Navigate } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";
import { Loader2 } from "lucide-react";

export default function AuthGuard({ children }) {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-6 h-6 animate-spin text-rose-400" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}
