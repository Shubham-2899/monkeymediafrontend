// components/ProtectedRoute.js
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/UserAuthContext";

const ProtectedRoute = () => {
  const { user } = useAuth();
  return user ? <Outlet /> : <Navigate to="/signin" />;
};

export default ProtectedRoute;
