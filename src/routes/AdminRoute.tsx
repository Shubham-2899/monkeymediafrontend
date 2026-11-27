import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/UserAuthContext";
import MailLoader from "../components/MailLoader";

const AdminRoute = () => {
  const { user, isAdmin, loading } = useAuth();

  // Show loading state until Firebase finishes checking auth status
  if (loading) {
    return <MailLoader variant="fullscreen" size={140} label="Checking your inbox" />;
  }

  // If the user is not authenticated or not an admin, redirect to home
  if (!user || !isAdmin) {
    return <Navigate to="/home" />;
  }

  // If the user is authenticated and an admin, allow access to child routes
  return <Outlet />;
};

export default AdminRoute;
