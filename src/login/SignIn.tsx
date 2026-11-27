import * as React from "react";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import MarkEmailReadRoundedIcon from "@mui/icons-material/MarkEmailReadRounded";
import AlternateEmailRoundedIcon from "@mui/icons-material/AlternateEmailRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, TextField, Box, Typography, Alert, Stack, InputAdornment } from "@mui/material";
import "./signup-signin-styles.css";
import AuthShell from "./AuthShell";
import MailLoader from "../components/MailLoader";
import { useUserAuth } from "../contexts/UserAuthContext";

/** Maps sign-in failures to a short, user-facing message. */
function friendlySignInError(err: unknown) {
  const code = (err as { code?: string })?.code;
  if (code === "auth/too-many-requests") return "Too many sign-in attempts. Please wait a few minutes and try again.";
  if (code === "auth/network-request-failed") return "We couldn't reach the server. Check your internet connection and try again.";
  // Wrong email/password, unknown user, invalid email, or sign-in currently unavailable.
  return "Wrong email or password. Please check your credentials and try again.";
}

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
    } catch (err: unknown) {
      // Keep the technical reason in the console; show the user a plain message.
      console.log("🚀 ~ handleSubmit ~ err:", err);
      setError(friendlySignInError(err));
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
    <AuthShell>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <Box className="auth-badge">
          <MarkEmailReadRoundedIcon sx={{ fontSize: 24 }} />
        </Box>
        <Box>
          <Typography variant="h5" sx={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: 26 }}>
            Welcome back
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Sign in to launch your next campaign
          </Typography>
        </Box>
      </Stack>
      {typeof error === "string" && error && (
        <Alert severity="error" variant="outlined" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Box component="form" onSubmit={handleSubmit} sx={{ position: "relative" }}>
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
          disabled={loading}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <AlternateEmailRoundedIcon sx={{ color: "text.secondary" }} />
              </InputAdornment>
            ),
          }}
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
          disabled={loading}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LockOutlinedIcon sx={{ color: "text.secondary" }} />
              </InputAdornment>
            ),
          }}
        />
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 0.5, mb: 2.5 }}>
          <Link to="/forgot-password" className="auth-link">
            Forgot password?
          </Link>
        </Box>
        <Button
          type="submit"
          fullWidth
          variant="contained"
          size="large"
          endIcon={<SendRoundedIcon />}
          sx={{ borderRadius: 0, py: 1.4, fontSize: 16, boxShadow: "4px 4px 0 var(--stamp)" }}
          disabled={loading}
        >
          Sign In
        </Button>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 3, textAlign: "center" }}>
          Don&apos;t have an account?{" "}
          <Link to="/contact-us" className="auth-link">
            Contact us to register
          </Link>
        </Typography>
      </Box>
      {loading && <MailLoader variant="overlay" size={96} label="Signing you in" />}
    </AuthShell>
  );
};

export default Signin;
