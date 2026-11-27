import { Alert, Box, Button, InputAdornment, Stack, TextField, Typography } from "@mui/material";
import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useUserAuth } from "../contexts/UserAuthContext";
import { validateEmail } from "../heplers/UserDataValidation";
import LockResetIcon from "@mui/icons-material/LockReset";
import AlternateEmailRoundedIcon from "@mui/icons-material/AlternateEmailRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import AuthShell from "./AuthShell";
import MailLoader from "../components/MailLoader";

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
    <AuthShell>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <Box className="auth-badge">
          <LockResetIcon sx={{ fontSize: 24 }} />
        </Box>
        <Box>
          <Typography variant="h5" sx={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: 26 }}>
            Forgot password
          </Typography>
          <Typography variant="body2" color="text.secondary">
            We&apos;ll email you a secure reset link
          </Typography>
        </Box>
      </Stack>
      <Box component="form" onSubmit={submitHanlder} noValidate>
        {typeof error === "string" && error && (
          <Alert severity="error" variant="outlined" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {typeof message === "string" && message && (
          <Alert severity="success" variant="outlined" sx={{ mb: 2 }}>
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
          sx={{ mb: 3 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <AlternateEmailRoundedIcon sx={{ color: "text.secondary" }} />
              </InputAdornment>
            ),
          }}
        />
        <Button
          type="submit"
          fullWidth
          variant="contained"
          size="large"
          endIcon={<SendRoundedIcon />}
          sx={{ borderRadius: 0, py: 1.4, fontSize: 16, boxShadow: "4px 4px 0 var(--stamp)", mb: 2 }}
          disabled={loading}
        >
          Send reset link
        </Button>
        <Box sx={{ textAlign: "center" }}>
          <Link to="/signin" className="auth-link">
            Back to sign in
          </Link>
        </Box>
      </Box>
      {loading && <MailLoader variant="overlay" size={96} label="Sending reset email" />}
    </AuthShell>
  );
};
