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
} from "@mui/material";
// import Loading from '../../components/Loading';
import "./signup-signin-styles.css";
import { useUserAuth } from "../contexts/UserAuthContext";

const Signin = () => {
  const [error, setError] = useState<any>("");
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
    } catch (err) {
      setError(err);
    }
    setLoading(false);
  }

  useEffect(() => {
    let authToken = sessionStorage.getItem("authToken");
    if (authToken) {
      navigate("/home");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {loading ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="100vh"
        >
          <CircularProgress />
        </Box>
      ) : (
        <Box className="signin">
          <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Sign in
          </Typography>
          {error && <Alert severity="error">{error.toString()}</Alert>}
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
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
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              className="formBtn"
              disabled={loading}
            >
              Sign In
            </Button>
            <Grid container>
              <Grid item xs>
                <Link to="/forgot-password" className="links">
                  Forgot password?
                </Link>
              </Grid>
              {/* <Grid item xs>
                <Link to="/signup" className="links">
                  {"Create New Account? Sign Up"}
                </Link>
              </Grid> */}
            </Grid>
          </Box>
        </Box>
      )}
    </>
  );
};

export default Signin;
