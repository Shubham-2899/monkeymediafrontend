import React, { useState } from "react";
import {
  TextField,
  Button,
  Typography,
  CircularProgress,
  Box,
} from "@mui/material";
import axios from "axios";
import * as yup from "yup";

// Validation schema for emails
const emailSchema = yup
  .array()
  .of(
    yup.string().email("Must be a valid email").required("Email is required")
  );

const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB in bytes

const AddEmails: React.FC = () => {
  const [emails, setEmails] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [emailLoading, setEmailLoading] = useState<boolean>(false);
  const [fileLoading, setFileLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>("");
  const [success, setSuccess] = useState<string | null>("");

  const handleEmailsSubmit = async () => {
    setError("");
    setSuccess("");
    setEmailLoading(true);

    try {
      const emailsArray = emails.split(",").map((email) => email.trim());
      await emailSchema.validate(emailsArray);

      const token = sessionStorage.getItem("authToken");
      // API call to submit emails array
      const response = await axios.post(
        `${import.meta.env.VITE_APP_API_BASE_URL}/email_list/add-emails`,
        { emails: emailsArray },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 201) {
        setSuccess("Emails successfully added!");
        setEmails(""); // Clear the emails input
      }
    } catch (err: any) {
      setError(err.message || "Invalid email format");
    } finally {
      setEmailLoading(false); // Reset email loading
    }
  };

  const handleFileSubmit = async () => {
    setError("");
    setSuccess("");

    if (!file) {
      setError("No file selected");
      return;
    }

    // File validation
    if (file.size > MAX_FILE_SIZE) {
      setError("File size exceeds the maximum allowed size of 1MB.");
      return;
    }

    if (!file.name.endsWith(".csv")) {
      setError("Only CSV files are allowed.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setFileLoading(true); // Set file loading to true
    const token = sessionStorage.getItem("authToken");

    try {
      // API call to upload CSV
      const response = await axios.post(
        `${import.meta.env.VITE_APP_API_BASE_URL}/email_list/upload-emails`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 201) {
        setSuccess("CSV file uploaded successfully!");
        setFile(null); // Clear the file input
      }
    } catch (err: any) {
      console.log("🚀 ~ handleFileSubmit ~ err:", err);
      setError(`Error: ${err.response.data.message}`);
    } finally {
      setFileLoading(false); // Reset file loading
    }
  };

  return (
    <Box>
      <Typography variant="h6">Add Emails</Typography>

      {/* Input for emails */}
      <TextField
        label="Enter emails (comma separated)"
        variant="outlined"
        fullWidth
        multiline
        rows={4}
        value={emails}
        onChange={(e) => setEmails(e.target.value)}
        margin="normal"
      />

      <Button
        variant="contained"
        color="primary"
        onClick={handleEmailsSubmit}
        disabled={emailLoading} // Disable button when loading
      >
        {emailLoading ? <CircularProgress size={24} /> : "Submit Emails"}
      </Button>

      {/* File upload input */}
      <Box mt={4}>
        <Typography variant="h6">Upload CSV</Typography>
        <input
          type="file"
          accept=".csv"
          onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
        />
        <Button
          variant="contained"
          color="secondary"
          onClick={handleFileSubmit}
          disabled={fileLoading || !file} // Disable button when loading or no file selected
          sx={{ mt: 2 }}
        >
          {fileLoading ? <CircularProgress size={24} /> : "Upload CSV"}
        </Button>
      </Box>

      {/* Display success or error messages */}
      {error && <Typography color="error">{error}</Typography>}
      {success && <Typography color="primary">{success}</Typography>}
    </Box>
  );
};

export default AddEmails;
