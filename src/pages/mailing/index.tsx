import React, { useEffect, useState } from "react";
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
  CircularProgress,
  Grid,
  useMediaQuery,
  useTheme,
  Alert,
  AlertTitle,
  Collapse,
  IconButton,
  Select,
  MenuItem,
  SelectChangeEvent,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { validateEmails } from "../../heplers/UserDataValidation";
import { apiGet, apiPost } from "../../utils/api";

interface FormattedData {
  label: string;
  value: string;
}

const EmailForm: React.FC = () => {
  const [from, setFrom] = useState<string>("");
  const [fromName, setFromName] = useState<string>("");
  const [subject, setSubject] = useState<string>("");
  const [to, setTo] = useState<string>("");
  const [templateType, setTemplateType] = useState<string>("html");
  const [emailTemplate, setEmailTemplate] = useState<string>("");
  const [mode, setMode] = useState<string>("test");
  const [loading, setLoading] = useState<boolean>(false);
  const [offerId, setOfferId] = useState<string>("");
  const [campaignId, setCampaignId] = useState<string>("");
  const [alert, setAlert] = useState({
    open: false,
    severity: "success" as "success" | "error",
    message: "",
  });
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [serverIps, setServerIps] = useState<FormattedData[]>([]);
  const [selectedIp, setSelectedIp] = useState("");

  useEffect(() => {
    const getAvailableDomainIpDetails = async () => {
      try {
        // Type response to match the expected structure
        const res = await apiGet("/availableIps");

        const domainIp = res.data.domainIp as Record<string, string[]>;

        // Format data into an array of { label, value } objects for easier selection
        const formattedData: FormattedData[] = Object.entries(domainIp).flatMap(
          ([key, ips]) =>
            ips.map((ip: string) => ({
              label: `${key} - ${ip}`, // What user sees
              value: `${key} - ${ip}`,
            }))
        );

        setServerIps(formattedData);
        if (formattedData.length > 0) {
          setSelectedIp(formattedData[0].value);
        }
      } catch (err: any) {
        console.error("Error while fetching available IPs:", err.message);
      }
    };
    getAvailableDomainIpDetails();
  }, []);

  const handlePreview = () => {
    const newWindow = window.open();
    if (newWindow) {
      newWindow.document.write(emailTemplate);
      newWindow.document.close();
    }
  };

  const handleSend = async () => {
    // Basic validation to ensure all fields are filled
    if (
      !from ||
      !fromName ||
      !subject ||
      !to ||
      !emailTemplate ||
      !offerId ||
      !campaignId
    ) {
      setAlert({
        open: true,
        severity: "error",
        message: "Please fill in all fields before sending.",
      });
      return;
    }

    const toEmails = validateEmails(to);
    setLoading(true);
    try {
      const encodedEmailTemplate = encodeURIComponent(emailTemplate);
      const response = await apiPost("/sendemail", {
        from,
        fromName,
        subject,
        to: toEmails,
        templateType,
        emailTemplate: encodedEmailTemplate,
        mode,
        offerId,
        campaignId,
        selectedIp,
      });
      console.log(response.data);

      const message =
        mode === "test"
          ? `${response?.data?.emailSent} Emails sent successfully!`
          : `Emails added to sending job ${response?.data?.jobId}`;
      // Set success alert
      setAlert({
        open: true,
        severity: "success",
        message: message,
      });
    } catch (error) {
      console.error("Error sending email:", error);

      // Set error alert
      setAlert({
        open: true,
        severity: "error",
        message: "Failed to send emails. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event: SelectChangeEvent<string>) => {
    setSelectedIp(event.target.value);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        minHeight: "100vh",
        padding: "20px",
        mt: "10px",
      }}
    >
      <Grid container spacing={2}>
        <Grid item xs={12} sm={3}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            <Typography variant="h6">Select Server IP</Typography>
            <Select
              value={selectedIp || serverIps[0]?.value || ""}
              onChange={handleChange}
              displayEmpty
              fullWidth
            >
              {serverIps.map((ip) => (
                <MenuItem key={ip.value} value={ip.value}>
                  {ip.label}
                </MenuItem>
              ))}
            </Select>
          </Box>
        </Grid>

        <Grid item xs={12} sm={6}>
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
            <Box
              sx={{
                display: "flex",
                flexDirection: !isMobile ? "row" : "column",
                gap: "15px",
                flexWrap: "wrap",
              }}
            >
              <TextField
                label="From"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                placeholder="Enter sender's email"
                sx={{ width: !isMobile ? "48%" : "100%" }}
                size="small"
              />
              <TextField
                label="From Name"
                value={fromName}
                onChange={(e) => setFromName(e.target.value)}
                placeholder="Enter sender's name"
                sx={{ width: !isMobile ? "48%" : "100%" }}
                size="small"
              />
              <TextField
                label="Subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter email subject"
                sx={{ width: "100%" }}
                size="small"
              />
              <TextareaAutosize
                minRows={5}
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="Enter recipient's emails, separated by commas"
                style={{ width: "100%", padding: "10px" }}
              />
              <Box sx={{ display: "flex", gap: "25px", flexWrap: "wrap" }}>
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
                    size="small"
                  >
                    Preview
                  </Button>
                  <Button variant="contained" color="warning" size="small">
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
        </Grid>

        <Grid item xs={12} sm={3}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            <TextField
              label="OfferId"
              value={offerId}
              onChange={(e) => setOfferId(e.target.value)}
              placeholder="Enter Offer Id"
              required
              size="small"
            />
            <TextField
              label="Campaign/Affiliate Offer Id"
              value={campaignId}
              onChange={(e) => setCampaignId(e.target.value)}
              placeholder="Enter Campaign/Affiliate Offer Id"
              size="small"
            />
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
        </Grid>
      </Grid>
      <Collapse in={alert.open} sx={{ mt: 2 }}>
        <Alert
          severity={alert.severity}
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={() => setAlert({ ...alert, open: false })}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }
          sx={{ mb: 2 }}
        >
          <AlertTitle>
            {alert.severity === "success" ? "Success" : "Error"}
          </AlertTitle>
          {alert.message}
        </Alert>
      </Collapse>
      <Button
        variant="contained"
        color="primary"
        onClick={handleSend}
        sx={{ mt: "20px", width: "200px" }}
        disabled={loading}
      >
        {loading ? <CircularProgress size={24} color="inherit" /> : "SEND"}
      </Button>
    </Box>
  );
};

export default EmailForm;
