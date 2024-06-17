import React, { useState } from "react";
import axios from "axios";
import {
  Box,
  Button,
  TextField,
  TextareaAutosize,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
} from "@mui/material";

const EmailForm: React.FC = () => {
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");
  const [templateType, setTemplateType] = useState<string>("plain");
  const [emailTemplate, setEmailTemplate] = useState<string>("");
  const [mode, setMode] = useState<string>("test");

  const handlePreview = () => {
    const newWindow = window.open();
    if (newWindow) {
      newWindow.document.write(emailTemplate);
      newWindow.document.close();
    }
  };

  const handleSend = async () => {
    // Split the 'to' field by commas and trim any extra whitespace from each email address
    const toEmails = to.split(",").map((email) => email.trim());

    try {
      const encodedEmailTemplate = encodeURIComponent(emailTemplate);

      const response = await axios.post(
        `${import.meta.env.VITE_APP_API_BASE_URL}/sendemail`,
        {
          from,
          to: toEmails,
          templateType,
          emailTemplate: encodedEmailTemplate,
          mode,
        }
      );

      console.log(response.data);
    } catch (error) {
      console.error("Error sending email:", error);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        minHeight: "100vh",
        padding: "20px",
        mt: "50px",
      }}
    >
      <Box
        sx={{
          display: "flex",
          gap: "20px",
        }}
      >
        <Box
          sx={{
            width: "200px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          <Typography variant="h6">Server IP's</Typography>
          <TextareaAutosize
            minRows={5}
            placeholder="IP's available"
            style={{ width: "100%", padding: "10px" }}
            disabled
          />
        </Box>
        <Box sx={{ minWidth: "600px" }}>
          <Box
            sx={{
              backgroundColor: "white",
              padding: "20px",
              borderRadius: "8px",
              boxShadow: 1,
            }}
          >
            <Typography variant="h6" gutterBottom>
              Email Form
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              <TextField
                label="From"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                placeholder="Enter sender's email"
                sx={{ width: "60%" }}
              />
              <TextareaAutosize
                minRows={5}
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="Enter recipient's emails, separated by commas"
                style={{ width: "100%", padding: "10px" }}
              />
              <Box sx={{ display: "flex", gap: "25px" }}>
                <FormControl component="fieldset">
                  <Typography>Email Template Type:</Typography>
                  <RadioGroup
                    row
                    value={templateType}
                    onChange={(e) => setTemplateType(e.target.value)}
                  >
                    <FormControlLabel
                      value="plain"
                      control={<Radio />}
                      label="Plain"
                    />
                    <FormControlLabel
                      value="html"
                      control={<Radio />}
                      label="HTML"
                    />
                  </RadioGroup>
                </FormControl>
                <div style={{ alignSelf: "center" }}>
                  <Button
                    variant="contained"
                    color="success"
                    onClick={handlePreview}
                    sx={{ mr: "20px" }}
                  >
                    Preview
                  </Button>
                  <Button variant="contained" color="warning">
                    Edit
                  </Button>
                </div>
              </Box>
              <TextareaAutosize
                maxRows={10}
                value={emailTemplate}
                onChange={(e) => setEmailTemplate(e.target.value)}
                placeholder={`Enter ${templateType} email template`}
                style={{
                  width: "100%",
                  padding: "10px",
                }}
              />
            </Box>
          </Box>
        </Box>
        <Box
          sx={{
            width: "200px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          <Button
            variant={mode === "test" ? "contained" : "outlined"}
            color="success"
            onClick={() => setMode("test")}
          >
            Test
          </Button>
          <Button
            variant={mode === "bulk" ? "contained" : "outlined"}
            color="success"
            onClick={() => setMode("bulk")}
          >
            Bulk
          </Button>
        </Box>
      </Box>
      <Button
        variant="contained"
        color="primary"
        onClick={handleSend}
        sx={{ mt: "20px" }}
      >
        SEND
      </Button>
    </Box>
  );
};

export default EmailForm;
