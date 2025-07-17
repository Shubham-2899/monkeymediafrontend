import * as React from "react";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Avatar,
  Button,
  TextField,
  Grid,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Paper,
  Stack,
} from "@mui/material";
// import Loading from '../../components/Loading';
import "./signup-signin-styles.css";
import { useUserAuth } from "../contexts/UserAuthContext";

const Signin = () => {
  const [error, setError] = useState<unknown>("");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  const { logIn, setLogin } = useUserAuth();

  const [password, setPassword] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await logIn(email, password);
      // let token = (res?.user as unknown as OAuthCredential).accessToken;
      // token && sessionStorage.setItem("authToken", token);
      // const userData = JSON.stringify(res?.user);
      // if (userData) sessionStorage.setItem("user", userData);
      setLogin(true);
      navigate("/home");
    } catch (err: any) {
      console.log("🚀 ~ handleSubmit ~ err:", err);

      setError(err.message);
    }
    setLoading(false);
  }

  useEffect(() => {
    const authToken = sessionStorage.getItem("authToken");
    if (authToken) {
      navigate("/home");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f4f6fa",
          position: "relative",
        }}
      >
        <Paper
          elevation={2}
          sx={{
            p: { xs: 2, sm: 4 },
            borderRadius: 3,
            minWidth: 340,
            maxWidth: 400,
            width: "100%",
            position: "relative",
          }}
        >
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <Avatar sx={{ bgcolor: "secondary.main", width: 48, height: 48 }}>
              <LockOutlinedIcon fontSize="large" />
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight={600} color="#333">
                Sign In
              </Typography>
              <Typography variant="body2" sx={{ color: "#666" }}>
                Access your application
              </Typography>
            </Box>
          </Stack>
          {typeof error === "string" && error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ mt: 1, position: "relative" }}
          >
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              onChange={(e) => setEmail(e.target.value)}
              sx={{ mb: 2 }}
              disabled={loading}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              onChange={(e) => setPassword(e.target.value)}
              sx={{ mb: 2 }}
              disabled={loading}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                borderRadius: 2,
                py: 1.2,
                fontWeight: 600,
                fontSize: 16,
                mb: 1,
              }}
              disabled={loading}
            >
              Sign In
            </Button>
            <Grid container>
              <Grid item xs>
                <Link
                  to="/forgot-password"
                  className="links"
                  style={{
                    textDecoration: "none",
                    color: "#1976d2",
                    fontWeight: 500,
                  }}
                >
                  Forgot password?
                </Link>
              </Grid>
            </Grid>
            {loading && (
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  bgcolor: "rgba(255,255,255,0.7)",
                  zIndex: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 3,
                }}
              >
                <CircularProgress />
              </Box>
            )}
          </Box>
        </Paper>
      </Box>
    </>
  );
};

export default Signin;
