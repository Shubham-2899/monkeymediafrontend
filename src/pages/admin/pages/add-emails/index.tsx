import React, { useState, useRef } from "react";
import {
  TextField,
  Button,
  Typography,
  CircularProgress,
  Box,
  Divider,
  Snackbar,
  Alert,
  Stack,
  Paper,
} from "@mui/material";
import * as yup from "yup";
import { apiPost } from "../../../../utils/api";
import EmailIcon from "@mui/icons-material/Email";

const emailSchema = yup
  .array()
  .of(
    yup.string().email("Must be a valid email").required("Email is required")
  );

const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB in bytes

const DEMO_CSV_CONTENT = `email\nuser1@example.com\nuser2@example.com`;

const downloadDemoCSV = () => {
  const blob = new Blob([DEMO_CSV_CONTENT], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "demo_emails.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};

const AddEmails: React.FC = () => {
  const [emails, setEmails] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [campaignId, setCampaignId] = useState<string>("");
  const [emailLoading, setEmailLoading] = useState<boolean>(false);
  const [fileLoading, setFileLoading] = useState<boolean>(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSnackbarClose = () => setSnackbar({ ...snackbar, open: false });

  const handleEmailsSubmit = async () => {
    setSnackbar({ open: false, message: "", severity: "success" });
    setEmailLoading(true);
    try {
      const emailsArray = emails.split(",").map((email) => email.trim());
      await emailSchema.validate(emailsArray);
      const response = await apiPost("/email_list/add-emails", {
        emails: emailsArray,
      });
      if (response.status === 201) {
        setSnackbar({
          open: true,
          message: "Emails successfully added!",
          severity: "success",
        });
        setEmails("");
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Invalid email format";
      setSnackbar({ open: true, message: errorMessage, severity: "error" });
    } finally {
      setEmailLoading(false);
    }
  };

  const handleFileSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSnackbar({ open: false, message: "", severity: "success" });
    if (!file) {
      setSnackbar({
        open: true,
        message: "No file selected",
        severity: "error",
      });
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setSnackbar({
        open: true,
        message: "File size exceeds the maximum allowed size of 1MB.",
        severity: "error",
      });
      return;
    }
    if (!file.name.endsWith(".csv")) {
      setSnackbar({
        open: true,
        message: "Only CSV files are allowed.",
        severity: "error",
      });
      return;
    }
    if (!campaignId) {
      setSnackbar({
        open: true,
        message: "Campaign ID is required.",
        severity: "error",
      });
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    formData.append("campaignId", campaignId);
    setFileLoading(true);
    try {
      const response = await apiPost(
        "/email_list/upload-emails",
        formData,
        undefined,
        { "Content-Type": "multipart/form-data" }
      );
      if (response.status === 201) {
        setSnackbar({
          open: true,
          message: "CSV file uploaded successfully!",
          severity: "success",
        });
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error &&
        "response" in err &&
        err.response &&
        typeof err.response === "object" &&
        "data" in err.response &&
        err.response.data &&
        typeof err.response.data === "object" &&
        "message" in err.response.data
          ? `Error: ${err.response.data.message}`
          : "Failed to upload CSV file";
      setSnackbar({ open: true, message: errorMessage, severity: "error" });
    } finally {
      setFileLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: "100%", mx: "auto" }}>
      <Paper
        elevation={1}
        sx={{
          borderRadius: 2,
          overflow: "hidden",
          border: "1px solid #e0e0e0",
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            p: 3,
            background: "#fff",
            color: "#333",
            display: "flex",
            alignItems: "center",
            borderBottom: "1px solid #e0e0e0",
          }}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <EmailIcon sx={{ fontSize: 32, color: "#1976d2" }} />
            <Box>
              <Typography variant="h5" fontWeight={600} color="#333">
                Add Emails
              </Typography>
              <Typography variant="body2" sx={{ color: "#666" }}>
                Upload or enter emails to add to a campaign
              </Typography>
            </Box>
          </Stack>
        </Box>
        {/* Content */}
        <Box sx={{ p: 3 }}>
          <Stack spacing={4}>
            {/* Input for emails */}
            <Box sx={{ width: "80%" }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Enter emails (comma separated)
              </Typography>
              <TextField
                placeholder="e.g. user1@example.com, user2@example.com"
                variant="outlined"
                fullWidth
                multiline
                rows={3}
                value={emails}
                onChange={(e) => setEmails(e.target.value)}
                margin="normal"
                InputProps={{ sx: { borderRadius: 2, background: "#f5f6fa" } }}
                aria-label="Enter emails"
                autoFocus={true}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handleEmailsSubmit}
                disabled={emailLoading || !emails}
                sx={{ mt: 1, minWidth: 160, borderRadius: 2 }}
                size="large"
              >
                {emailLoading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Submit Emails"
                )}
              </Button>
            </Box>
            <Divider>OR</Divider>
            {/* File upload input */}
            <Box component="form" onSubmit={handleFileSubmit}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Upload CSV
                <Button
                  variant="text"
                  size="small"
                  sx={{ ml: 2, textTransform: "none" }}
                  onClick={downloadDemoCSV}
                >
                  Download Demo CSV
                </Button>
              </Typography>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                alignItems="center"
                sx={{ mb: 1, width: "80%" }}
              >
                <Box
                  sx={{ display: "flex", alignItems: "center", width: "100%" }}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    style={{ display: "block", flex: 1 }}
                    onChange={(e) =>
                      setFile(e.target.files ? e.target.files[0] : null)
                    }
                    aria-label="Upload CSV file"
                  />
                  {file && (
                    <Box sx={{ display: "flex", alignItems: "center", ml: 2 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          maxWidth: 180,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {file.name}
                      </Typography>
                      <Button
                        size="small"
                        color="error"
                        sx={{ minWidth: 0, ml: 1, px: 1 }}
                        onClick={() => {
                          setFile(null);
                          if (fileInputRef.current)
                            fileInputRef.current.value = "";
                        }}
                        aria-label="Remove selected file"
                      >
                        ✕
                      </Button>
                    </Box>
                  )}
                </Box>
                <TextField
                  label="Campaign ID"
                  variant="outlined"
                  value={campaignId}
                  onChange={(e) => setCampaignId(e.target.value)}
                  sx={{ width: 320, background: "#f5f6fa", borderRadius: 2 }}
                  size="small"
                  required
                  aria-label="Enter campaign ID"
                />
              </Stack>
              <Button
                variant="contained"
                color="primary"
                type="submit"
                disabled={fileLoading || !file || !campaignId}
                sx={{ minWidth: 160, borderRadius: 2, mt: 1 }}
                size="large"
              >
                {fileLoading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Upload CSV"
                )}
              </Button>
            </Box>
          </Stack>
        </Box>
      </Paper>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AddEmails;
