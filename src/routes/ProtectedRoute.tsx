import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/UserAuthContext";

const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  // Show loading state until Firebase finishes checking auth status
  if (loading) {
    return <div>Loading...</div>;
  }

  return user ? <Outlet /> : <Navigate to="/signin" />;
};

export default ProtectedRoute;
