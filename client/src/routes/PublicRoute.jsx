import { Navigate } from "react-router-dom";
import { useAuth } from "../shared/context/AuthContext";

function PublicRoute({ children }) {
  const { isAuthenticated, profileCompleted, loading } = useAuth();

  if (loading) return null;
  if (isAuthenticated) {
    return <Navigate to={profileCompleted ? "/browse" : "/profile/setup"} replace />;
  }

  return children;
}

export default PublicRoute;
