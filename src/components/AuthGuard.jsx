import { Navigate } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";
import ClinicLoader from "./ClinicLoader";

export default function AuthGuard({ children }) {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-dvh flex items-center justify-center bg-gray-50">
        <ClinicLoader label="Verifying access..." />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}
