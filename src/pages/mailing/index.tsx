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
  Tooltip,
  Card,
  Chip,
  LinearProgress,
  Stack,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import StopIcon from "@mui/icons-material/Stop";
import {
  validateEmail,
  validateEmails,
} from "../../heplers/UserDataValidation";
import { CampaignService } from "../../utils/campaignService";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { useLocation } from "react-router-dom";
import { Mode } from "../../Interfaces";
import EmailIcon from "@mui/icons-material/Email";

interface FormattedData {
  label: string;
  value: string;
}

const EmailForm: React.FC = () => {
  const [from, setFrom] = useState<string>("");
  const [fromName, setFromName] = useState<string>("");
  const [delay, setDelay] = useState<number>(10);
  const [batchSize, setBatchSize] = useState<number>(5);
  const [subject, setSubject] = useState<string>("");
  const [to, setTo] = useState<string>("");
  const [templateType, setTemplateType] = useState<string>("html");
  const [emailTemplate, setEmailTemplate] = useState<string>("");
  const [mode, setMode] = useState<Mode>("test");
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
  const location = useLocation();
  const [serverIps, setServerIps] = useState<FormattedData[]>([]);
  const [selectedIp, setSelectedIp] = useState("");
  const [campaignStarted, setCampaignStarted] = useState(false);
  const [campaignPaused, setCampaignPaused] = useState(false);
  const [currentJobId, setCurrentJobId] = useState<string>("");
  const [campaignStats] = useState<{
    counts?: {
      total: number;
      sent: number;
      failed: number;
      pending: number;
    };
  } | null>(null);
  const [lastBulkCampaignId, setLastBulkCampaignId] = useState<string>("");

  useEffect(() => {
    getAvailableDomainIpDetails();
  }, []);

  useEffect(() => {
    // Pre-populate from localStorage if coming from analytics
    const params = new URLSearchParams(location.search);
    if (params.get("fromAnalytics")) {
      const stored = localStorage.getItem("prepopulateMailingCampaign");
      if (stored) {
        try {
          const data = JSON.parse(stored);
          setFrom(data.from || "");
          setFromName(data.fromName || "");
          setSubject(data.subject || "");
          setEmailTemplate(decodeURIComponent(data.emailTemplate || ""));
          setTemplateType(data.templateType || "html");
          setOfferId(data.offerId || "");
          setSelectedIp(data.selectedIp || "");
          setCampaignId(data.campaignId || "");
          setBatchSize(data.batchSize || 5);
          setDelay(data.delay || 5);
          setMode("bulk");
          // setCampaignStatus(data.status || null); // No longer needed
        } catch (e) {
          // fallback: clear
          // setCampaignStatus(null); // No longer needed
        }
      }
    }
  }, [location.search]);

  const getAvailableDomainIpDetails = async () => {
    try {
      const res = await CampaignService.getAvailableIps();
      const domainIp = res.domainIp as Record<string, string[]>;

      const formattedData: FormattedData[] = Object.entries(domainIp).flatMap(
        ([key, ips]) =>
          ips.map((ip: string) => ({
            label: `${key} - ${ip}`,
            value: `${key} - ${ip}`,
          }))
      );

      setServerIps(formattedData);
      if (formattedData.length > 0) {
        setSelectedIp(formattedData[0].value);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("Error while fetching available IPs:", err.message);
      } else {
        console.error("Error while fetching available IPs:", err);
      }
    }
  };

  const handlePreview = () => {
    const newWindow = window.open();
    if (newWindow) {
      newWindow.document.write(emailTemplate);
      newWindow.document.close();
    }
  };

  const validateForm = () => {
    if (
      !from ||
      !fromName ||
      !subject ||
      !emailTemplate ||
      !offerId ||
      !campaignId
    ) {
      setAlert({
        open: true,
        severity: "error",
        message: "Please fill in all required fields.",
      });
      return false;
    }

    if (validateEmail(from)) {
      setAlert({
        open: true,
        severity: "error",
        message: "Please enter a valid from email address",
      });
      return false;
    }

    const toEmails = validateEmails(to);
    if ((mode === "test" || mode === "manual") && toEmails.length === 0) {
      setAlert({
        open: true,
        severity: "error",
        message: "Please enter at least one valid recipient email",
      });
      return false;
    }

    return true;
  };

  const handleSend = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const toEmails = validateEmails(to);
      const encodedEmailTemplate = encodeURIComponent(emailTemplate);

      const campaignData = {
        campaignId,
        from,
        fromName,
        subject,
        to: toEmails,
        templateType: templateType as "html" | "plain",
        emailTemplate: encodedEmailTemplate,
        mode: mode,
        offerId,
        selectedIp,
        batchSize,
        delay,
      };

      const response = await CampaignService.createCampaign(campaignData);

      // const message =
      //   mode === "test"
      //     ? `${response.emailSent} Emails sent successfully!${
      //         response.emailFailed ? `\n${response.emailFailed} failed.` : ""
      //       }`
      //     : `Emails were successfully added to the sending job (Job ID: ${response?.jobId}) in the email queue.`;

      const message =
        mode === "test" ? (
          <>
            <div>{response?.emailSent} Emails sent successfully!</div>
            {response?.emailFailed && response?.emailFailed > 0 && (
              <div>{response.emailFailed} failed.</div>
            )}
          </>
        ) : (
          <div>
            Emails were successfully added to the sending job (Job ID:{" "}
            {response?.jobId}) in the email queue.
          </div>
        );
      setAlert({
        open: true,
        severity: "success",
        message: message as unknown as string,
      });

      if (mode === "bulk" && response.jobId) {
        setCurrentJobId(response.jobId);
        setCampaignStarted(true);
        setCampaignPaused(false);
        setLastBulkCampaignId(campaignId);
      }
    } catch (error) {
      console.error("Error sending email:", error);
      setAlert({
        open: true,
        severity: "error",
        message: "Failed to send emails. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStartCampaign = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const encodedEmailTemplate = encodeURIComponent(emailTemplate);

      const campaignData = {
        campaignId,
        from,
        fromName,
        subject,
        to: [], // Empty array for bulk mode - emails are already in the system
        templateType: templateType as "html" | "plain",
        emailTemplate: encodedEmailTemplate,
        mode: "bulk" as const,
        offerId,
        selectedIp,
        batchSize,
        delay,
      };

      const response = await CampaignService.createCampaign(campaignData);

      if (response.jobId) {
        setCurrentJobId(response.jobId);
        setCampaignStarted(true);
        setCampaignPaused(false);
        setAlert({
          open: true,
          severity: "success",
          message: `Campaign started successfully! Job ID: ${response.jobId} in the campaign queue.`,
        });
      }
    } catch (error: any) {
      console.error("Error starting campaign:", error);
      setAlert({
        open: true,
        severity: "error",
        message: error.response.data.message ?? 'Failed to start the campaign. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePauseCampaign = async () => {
    if (!campaignId) return;

    setLoading(true);
    try {
      await CampaignService.pauseCampaign(campaignId);
      setCampaignPaused(true);
      setAlert({
        open: true,
        severity: "success",
        message: "Campaign paused successfully.",
      });
    } catch (error) {
      console.error("Error pausing campaign:", error);
      setAlert({
        open: true,
        severity: "error",
        message: "Failed to pause campaign.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResumeCampaign = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const encodedEmailTemplate = encodeURIComponent(emailTemplate);

      const campaignData = {
        campaignId,
        from,
        fromName,
        subject,
        to: [], // Empty array for bulk mode - emails are already in the system
        templateType: templateType as "html" | "plain",
        emailTemplate: encodedEmailTemplate,
        mode: "bulk" as const,
        offerId,
        selectedIp,
        batchSize,
        delay,
      };

      const response = await CampaignService.resumeCampaign(campaignData);

      if (response.jobId) {
        setCurrentJobId(response.jobId);
        setCampaignPaused(false);
        setAlert({
          open: true,
          severity: "success",
          message: "Campaign resumed successfully.",
        });
      }
    } catch (error) {
      console.error("Error resuming campaign:", error);
      setAlert({
        open: true,
        severity: "error",
        message: "Failed to resume campaign.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStopJob = async () => {
    if (!currentJobId) return;

    setLoading(true);
    try {
      await CampaignService.stopJob(currentJobId);
      setCampaignStarted(false);
      setCampaignPaused(false);
      setCurrentJobId("");
      setAlert({
        open: true,
        severity: "success",
        message: "Campaign stopped successfully.",
      });
    } catch (error) {
      console.error("Error stopping job:", error);
      setAlert({
        open: true,
        severity: "error",
        message: "Failed to stop campaign.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event: SelectChangeEvent<string>) => {
    setSelectedIp(event.target.value);
  };

  const handleModeChange = (newMode: string) => {
    setMode(newMode as Mode);

    // If switching to test/manual mode and we have a last bulk campaign, clear the campaign state
    if ((newMode === "test" || newMode === "manual") && lastBulkCampaignId) {
      setCampaignStarted(false);
      setCampaignPaused(false);
      setCurrentJobId("");
    }

    // If switching to bulk mode and we have a last bulk campaign, restore it
    if (newMode === "bulk" && lastBulkCampaignId && !campaignId) {
      setCampaignId(lastBulkCampaignId);
    }
  };

  const getProgressPercentage = () => {
    if (!campaignStats || !campaignStats.counts) return 0;
    const total = campaignStats.counts.total;
    const sent = campaignStats.counts.sent;
    const failed = campaignStats.counts.failed;
    return total > 0 ? ((sent + failed) / total) * 100 : 0;
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        p: { xs: 1, sm: 3 },
        background: "#fafafa",
      }}
    >
      {/* Consistent Header */}
      <Box
        sx={{
          pb: 1,
          // background: "#fff",
          color: "#333",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid #e0e0e0",
          width: "100%",
          gap: 2,
          mb: 3,
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <EmailIcon sx={{ fontSize: 32, color: "#1976d2" }} />
          <Box>
            <Typography variant="h5" fontWeight={600} color="#333">
              Mailing
            </Typography>
            <Typography variant="body2" sx={{ color: "#666" }}>
              Create and send email campaigns
            </Typography>
          </Box>
        </Stack>
      </Box>
      <Grid container spacing={2} justifyContent="center">
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
          <Card sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Email Campaign Form
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
                label="From Email"
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
          </Card>
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
              label="Offer ID"
              value={offerId}
              onChange={(e) => setOfferId(e.target.value)}
              placeholder="Enter Offer ID"
              required
              size="small"
            />
            <Box
              display="flex"
              alignItems="center"
              gap={1}
              sx={{ position: "relative" }}
            >
              <TextField
                label="Campaign ID"
                value={campaignId}
                onChange={(e) => setCampaignId(e.target.value)}
                placeholder="Enter Campaign ID"
                size="small"
                fullWidth
              />
              <Tooltip title="Please carefully select the Campaign ID" arrow>
                <IconButton
                  size="small"
                  sx={{
                    position: "absolute",
                    right: 1,
                    top: 0,
                  }}
                >
                  <InfoOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>

            <Box
              display="flex"
              flexWrap="wrap"
              justifyContent="space-between"
              gap={2}
              sx={{ width: "100%" }}
            >
              <Box
                display="flex"
                alignItems="center"
                gap={1}
                sx={{
                  position: "relative",
                  width: !isMobile ? "48%" : "100%",
                }}
              >
                <TextField
                  label="Delay (seconds)"
                  value={delay}
                  onChange={(e) => setDelay(Number(e.target.value))}
                  placeholder="Enter delay in seconds"
                  sx={{ width: "100%" }}
                  size="small"
                />
                <Tooltip title="Delay between email batches" arrow>
                  <IconButton
                    size="small"
                    sx={{
                      position: "absolute",
                      right: 1,
                      top: 0,
                    }}
                  >
                    <InfoOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
              <Box
                display="flex"
                alignItems="center"
                gap={1}
                sx={{
                  position: "relative",
                  width: !isMobile ? "48%" : "100%",
                }}
              >
                <TextField
                  label="Batch Size"
                  value={batchSize}
                  onChange={(e) => setBatchSize(Number(e.target.value))}
                  placeholder="Enter batch size"
                  sx={{ width: isMobile ? "48%" : "100%" }}
                  size="small"
                  required
                />
                <Tooltip title="Number of emails per batch" arrow>
                  <IconButton
                    size="small"
                    sx={{
                      position: "absolute",
                      right: 1,
                      top: 0,
                    }}
                  >
                    <InfoOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            {/* Mode Selection */}
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Campaign Modes:
              </Typography>
              <FormControl component="fieldset">
                <RadioGroup
                  value={mode}
                  onChange={(e) => handleModeChange(e.target.value)}
                >
                  <FormControlLabel
                    value="test"
                    control={<Radio />}
                    label={
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Chip label="Test" size="small" color="primary" />
                        {/* <Typography variant="body2">
                          Send test emails
                        </Typography> */}
                      </Box>
                    }
                  />
                  <FormControlLabel
                    value="manual"
                    control={<Radio />}
                    label={
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Chip label="Manual" size="small" color="info" />
                        {/* <Typography variant="body2">Manual send</Typography> */}
                      </Box>
                    }
                  />
                  <FormControlLabel
                    value="bulk"
                    control={<Radio />}
                    label={
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Chip label="Bulk" size="small" color="secondary" />
                        {/* <Typography variant="body2">Bulk campaign</Typography> */}
                      </Box>
                    }
                  />
                </RadioGroup>
              </FormControl>

              {/* Mode switching info */}
              {campaignStarted && (mode === "test" || mode === "manual") && (
                <Alert severity="info" sx={{ mt: 1 }}>
                  <Typography variant="body2">
                    Switched to {mode} mode. You can test deliverability while
                    your bulk campaign is paused.
                  </Typography>
                </Alert>
              )}

              {lastBulkCampaignId && mode === "bulk" && !campaignStarted && (
                <Alert severity="info" sx={{ mt: 1 }}>
                  <Typography variant="body2">
                    Previous campaign ID restored. You can resume or start a new
                    campaign.
                  </Typography>
                </Alert>
              )}
            </Box>
          </Box>
        </Grid>
      </Grid>

      {/* Campaign Status */}
      {(campaignStarted || campaignPaused) && (
        <Card sx={{ margin: '24px auto', p: 1, width: "100%", maxWidth: 800 }}>
          <Typography variant="h6" gutterBottom>
            Campaign Status
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            <Chip
              label={campaignPaused ? "PAUSED" : "RUNNING"}
              color={campaignPaused ? "warning" : "success"}
            />
            {currentJobId && (
              <Typography variant="body2">Job ID: {currentJobId}</Typography>
            )}
            {lastBulkCampaignId && (
              <Typography variant="body2" color="textSecondary">
                Campaign: {lastBulkCampaignId}
              </Typography>
            )}
          </Box>

          {/* Mode indicator */}
          <Box sx={{ mb: 2 }}>
            <Chip
              label={`Current Mode: ${mode.toUpperCase()}`}
              color={mode === "test" ? "primary" : "secondary"}
              size="small"
            />
            {campaignPaused && mode === "test" && (
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                You can test deliverability while the bulk campaign is paused
              </Typography>
            )}
          </Box>

          {campaignStats && campaignStats.counts && (
            <Box sx={{ mb: 2 }}>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
              >
                <Typography variant="body2">Progress</Typography>
                <Typography variant="body2">
                  {getProgressPercentage().toFixed(1)}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={getProgressPercentage()}
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>
          )}
        </Card>
      )}

      <Collapse in={alert.open} sx={{ mt: 2, width: "100%" }}>
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

      {/* Action Buttons */}
      <Box sx={{ mt: 3, display: "flex", justifyContent: "center", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
        {mode === "test" || mode === "manual" ? (
          // Test/manual mode buttons
          <>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSend}
              disabled={loading}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : mode === "manual" ? (
                "Send Manual Email"
              ) : (
                "Send Test Email"
              )}
            </Button>
            {/* Show campaign control buttons if campaign is running/paused */}
            {campaignStarted && (
              <Box sx={{ display: "flex", gap: 2 }}>
                {!campaignPaused ? (
                  <Button
                    variant="outlined"
                    color="warning"
                    onClick={handlePauseCampaign}
                    disabled={loading}
                    startIcon={<PauseIcon />}
                  >
                    {loading ? (
                      <CircularProgress size={20} />
                    ) : (
                      "Pause Bulk Campaign"
                    )}
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    color="success"
                    onClick={handleResumeCampaign}
                    disabled={loading}
                    startIcon={<PlayArrowIcon />}
                  >
                    {loading ? (
                      <CircularProgress size={20} />
                    ) : (
                      "Resume Bulk Campaign"
                    )}
                  </Button>
                )}
                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleStopJob}
                  disabled={loading}
                  startIcon={<StopIcon />}
                >
                  {loading ? (
                    <CircularProgress size={20} />
                  ) : (
                    "Stop Bulk Campaign"
                  )}
                </Button>
              </Box>
            )}
          </>
        ) : (
          // Bulk mode buttons
          <>
            {!campaignStarted ? (
              <>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleStartCampaign}
                  disabled={loading}
                  startIcon={<PlayArrowIcon />}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    "Start Campaign"
                  )}
                </Button>
                {/* Show resume button if we have a paused campaign */}
                {campaignPaused && lastBulkCampaignId && (
                  <Button
                    variant="outlined"
                    color="success"
                    onClick={handleResumeCampaign}
                    disabled={loading}
                    startIcon={<PlayArrowIcon />}
                  >
                    {loading ? (
                      <CircularProgress size={20} />
                    ) : (
                      "Resume Previous Campaign"
                    )}
                  </Button>
                )}
              </>
            ) : (
              <Box sx={{ display: "flex", gap: 2 }}>
                {!campaignPaused ? (
                  <Button
                    variant="outlined"
                    color="warning"
                    onClick={handlePauseCampaign}
                    disabled={loading}
                    startIcon={<PauseIcon />}
                  >
                    {loading ? (
                      <CircularProgress size={20} />
                    ) : (
                      "Pause Campaign"
                    )}
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    color="success"
                    onClick={handleResumeCampaign}
                    disabled={loading}
                    startIcon={<PlayArrowIcon />}
                  >
                    {loading ? (
                      <CircularProgress size={20} />
                    ) : (
                      "Resume Campaign"
                    )}
                  </Button>
                )}
                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleStopJob}
                  disabled={loading}
                  startIcon={<StopIcon />}
                >
                  {loading ? <CircularProgress size={20} /> : "Stop Campaign"}
                </Button>
              </Box>
            )}
          </>
        )}
      </Box>
    </Box>
  );
};

export default EmailForm;
