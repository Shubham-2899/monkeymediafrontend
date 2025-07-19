import { Alert, Box, Button, TextField, Typography } from "@mui/material";
import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useUserAuth } from "../contexts/UserAuthContext";
import { validateEmail } from "../heplers/UserDataValidation";
import LockResetIcon from "@mui/icons-material/LockReset";
import { Paper, Stack, Avatar } from "@mui/material";

export const ForgotPassword = () => {
  const { resetPassword } = useUserAuth();
  const [error, setError] = useState<unknown>("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const emailRef = useRef<HTMLInputElement>(null);

  const submitHanlder = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (emailRef?.current?.value) {
      const validationMessage = validateEmail(emailRef?.current?.value);
      if (!validationMessage.length) {
        try {
          setError("");
          setMessage("");
          setLoading(true);
          await resetPassword(emailRef?.current?.value);
          setMessage("Check your inbox for further instructions");
        } catch (error: unknown) {
          setError(error);
        }
        setLoading(false);
      } else {
        setMessage("");
        setError(`${validationMessage} Please enter correct email `);
      }
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f4f6fa",
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
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Avatar sx={{ bgcolor: "primary.main", width: 48, height: 48 }}>
            <LockResetIcon fontSize="large" />
          </Avatar>
          <Box>
            <Typography variant="h5" fontWeight={600} color="#333">
              Forgot Password
            </Typography>
            <Typography variant="body2" sx={{ color: "#666" }}>
              Enter your email to receive a reset link
            </Typography>
          </Box>
        </Stack>
        <Box component="form" onSubmit={submitHanlder} noValidate>
          {typeof error === "string" && error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {typeof message === "string" && message && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {message}
            </Alert>
          )}
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            type="email"
            inputRef={emailRef}
            sx={{ mb: 2 }}
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
            Submit
          </Button>
          <Box sx={{ textAlign: "right" }}>
            <Link
              to="/signin"
              className="links"
              style={{
                textDecoration: "none",
                color: "#1976d2",
                fontWeight: 500,
              }}
            >
              Back to Sign in
            </Link>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};
