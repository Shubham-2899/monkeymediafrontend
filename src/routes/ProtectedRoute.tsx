import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/UserAuthContext";
import MailLoader from "../components/MailLoader";

const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  // Show loading state until Firebase finishes checking auth status
  if (loading) {
    return <MailLoader variant="fullscreen" size={140} label="Checking your inbox" />;
  }

  return user ? <Outlet /> : <Navigate to="/signin" />;
};

export default ProtectedRoute;
