import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/UserAuthContext";
import { Box, CircularProgress } from "@mui/material";

const AdminRoute = () => {
  const { user, isAdmin, loading } = useAuth();

  // Show loading state until Firebase finishes checking auth status
  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          mt: 10,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // If the user is not authenticated or not an admin, redirect to home
  if (!user || !isAdmin) {
    return <Navigate to="/" />;
  }

  // If the user is authenticated and an admin, allow access to child routes
  return <Outlet />;
};

export default AdminRoute;
