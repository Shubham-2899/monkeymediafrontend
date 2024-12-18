import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/UserAuthContext";
import { Box, CircularProgress } from "@mui/material";

const ProtectedRoute = () => {
  const { user, loading } = useAuth();

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

  return user ? <Outlet /> : <Navigate to="/signin" />;
};

export default ProtectedRoute;
