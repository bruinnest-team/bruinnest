import { Navigate } from "react-router-dom";
import { useAuth } from "../shared/context/AuthContext";

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return children;
}

export default ProtectedRoute;
