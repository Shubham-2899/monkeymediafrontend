import React, { useEffect, useState, useCallback } from "react";
import {
  Box, Button, TextField, TextareaAutosize, Typography, Radio,
  RadioGroup, FormControlLabel, FormControl, CircularProgress,
  Grid, Alert, AlertTitle, Collapse,
  IconButton, Select, MenuItem, SelectChangeEvent, Tooltip,
  Card, Chip, LinearProgress, Stack, Divider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import RefreshIcon from "@mui/icons-material/Refresh";
import AddIcon from "@mui/icons-material/Add";
import EmailIcon from "@mui/icons-material/Email";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { validateEmail, validateEmails } from "../../heplers/UserDataValidation";
import { CampaignService } from "../../utils/campaignService";
import { useLocation } from "react-router-dom";
import { Mode, CampaignStats } from "../../Interfaces";

// ─── Types ────────────────────────────────────────────────────────────────────

interface IpOption {
  label: string;
  value: string;
}

interface AlertState {
  open: boolean;
  severity: "success" | "error" | "warning" | "info";
  message: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

const EmailForm: React.FC = () => {
  const location = useLocation();

  // ── Shared form fields ──────────────────────────────────────────────────────
  const [from, setFrom] = useState("");
  const [fromName, setFromName] = useState("");
  const [subject, setSubject] = useState("");
  const [templateType, setTemplateType] = useState("html");
  const [emailTemplate, setEmailTemplate] = useState("");
  const [offerId, setOfferId] = useState("");
  const [campaignId, setCampaignId] = useState("");
  const [selectedIp, setSelectedIp] = useState("");
  const [serverIps, setServerIps] = useState<IpOption[]>([]);

  // ── Mode ────────────────────────────────────────────────────────────────────
  const [mode, setMode] = useState<Mode>("test");
  const [ipMode, setIpMode] = useState<"single" | "round-robin">("single");

  // ── Test / Manual recipients ────────────────────────────────────────────────
  const [to, setTo] = useState("");

  // ── Bulk campaign config ────────────────────────────────────────────────────
  const [batchSize, setBatchSize] = useState(5);
  const [delay, setDelay] = useState(10);

  // ── Campaign live status (fetched from API, survives refresh) ───────────────
  const [campaignStats, setCampaignStats] = useState<CampaignStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // ── UI state ────────────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<AlertState>({ open: false, severity: "success", message: "" });

  const showAlert = (severity: AlertState["severity"], message: string) =>
    setAlert({ open: true, severity, message });

  // ── Reset form for a new campaign ──────────────────────────────────────────
  const handleNewCampaign = () => {
    // Warn if a campaign is currently active
    if (isActive) {
      showAlert(
        "warning",
        `Campaign "${campaignId}" is still ${campaignStatus}. Clearing the form won't stop it — manage it from the Analytics page.`,
      );
    }
    setFrom("");
    setFromName("");
    setSubject("");
    setEmailTemplate("");
    setTemplateType("html");
    setOfferId("");
    setCampaignId("");
    setTo("");
    setMode("test");
    setIpMode("single");
    setCampaignStats(null);
    setAlert({ open: false, severity: "success", message: "" });
  };

  // ── Derived campaign status from API ───────────────────────────────────────
  const campaignStatus = campaignStats?.status ?? null;
  const isRunning = campaignStatus === "running";
  const isPaused = campaignStatus === "paused";
  const isActive = isRunning || isPaused;

  // ── Fetch campaign stats ────────────────────────────────────────────────────
  const fetchCampaignStats = useCallback(async (id: string) => {
    if (!id) return;
    setStatsLoading(true);
    try {
      const stats = await CampaignService.getCampaignStats(id);
      setCampaignStats(stats);
    } catch {
      // silently ignore — campaign may not exist yet
      setCampaignStats(null);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // Re-fetch stats when campaignId changes (with debounce)
  useEffect(() => {
    if (!campaignId) { setCampaignStats(null); return; }
    const t = setTimeout(() => fetchCampaignStats(campaignId), 600);
    return () => clearTimeout(t);
  }, [campaignId, fetchCampaignStats]);

  // ── Load available IPs ──────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const res = await CampaignService.getAvailableIps();
        const options: IpOption[] = (res.data ?? []).flatMap((server) =>
          server.availableIps.map((ip) => {
            const warmingSuffix =
              ip.warmingStatus === 'warmed' ? '' :
              ip.warmingStatus === 'warming' ? ' · warming' : ' · cold';
            return {
              label: `${server.domain} - ${ip.ip}${warmingSuffix}`,
              value: `${server.domain} - ${ip.ip}`,
            };
          })
        );
        setServerIps(options);
        if (options.length > 0) setSelectedIp(options[0].value);
      } catch (err) {
        console.error("Error fetching IPs:", err);
      }
    })();
  }, []);

  // ── Pre-populate from analytics ─────────────────────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (!params.get("fromAnalytics")) return;
    const stored = localStorage.getItem("prepopulateMailingCampaign");
    if (!stored) return;
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
      setDelay(data.delay || 10);
      setMode("bulk");
    } catch { /* ignore */ }
  }, [location.search]);

  // ── Validation ──────────────────────────────────────────────────────────────
  const validateSharedFields = (): boolean => {
    if (!from || !fromName || !subject || !emailTemplate || !offerId || !campaignId) {
      showAlert("error", "Please fill in all required fields.");
      return false;
    }
    if (validateEmail(from)) {
      showAlert("error", "Please enter a valid from email address.");
      return false;
    }
    return true;
  };

  const validateRecipients = (): string[] | null => {
    const emails = validateEmails(to);
    if (emails.length === 0) {
      showAlert("error", "Please enter at least one valid recipient email.");
      return null;
    }
    return emails;
  };

  // ── Preview ─────────────────────────────────────────────────────────────────
  const handlePreview = () => {
    const w = window.open();
    if (w) { w.document.write(emailTemplate); w.document.close(); }
  };

  // ── Mode 1: Test ─────────────────────────────────────────────────────────────
  const handleSendTest = async () => {
    if (!validateSharedFields()) return;
    const toEmails = validateRecipients();
    if (!toEmails) return;

    setLoading(true);
    try {
      const response = await CampaignService.createCampaign({
        campaignId, from, fromName, subject,
        to: toEmails,
        templateType: templateType as "html" | "plain",
        emailTemplate: encodeURIComponent(emailTemplate),
        mode: "test",
        offerId, selectedIp, batchSize, delay,
      });
      showAlert(
        "success",
        `${response.emailSent ?? 0} email(s) sent successfully${response.emailFailed ? `, ${response.emailFailed} failed` : ""}.`,
      );
    } catch (err: unknown) {
      showAlert("error", ((err as {response?: {data?: {message?: string}}})?.response?.data?.message) ?? "Failed to send test emails.");
    } finally {
      setLoading(false);
    }
  };

  // ── Mode 2: Manual ───────────────────────────────────────────────────────────
  const handleSendManual = async () => {
    if (!validateSharedFields()) return;
    const toEmails = validateRecipients();
    if (!toEmails) return;

    setLoading(true);
    try {
      const response = await CampaignService.createCampaign({
        campaignId, from, fromName, subject,
        to: toEmails,
        templateType: templateType as "html" | "plain",
        emailTemplate: encodeURIComponent(emailTemplate),
        mode: "manual",
        offerId, selectedIp, batchSize, delay,
      });
      showAlert("success", `Manual send queued. Job ID: ${response.jobId ?? "—"}`);
    } catch (err: unknown) {
      showAlert("error", ((err as {response?: {data?: {message?: string}}})?.response?.data?.message) ?? "Failed to queue manual send.");
    } finally {
      setLoading(false);
    }
  };

  // ── Mode 3: Bulk — Start ─────────────────────────────────────────────────────
  const handleStartCampaign = async () => {
    if (!validateSharedFields()) return;

    setLoading(true);
    try {
      const response = await CampaignService.createCampaign({
        campaignId, from, fromName, subject,
        to: [],
        templateType: templateType as "html" | "plain",
        emailTemplate: encodeURIComponent(emailTemplate),
        mode: "bulk",
        offerId, selectedIp, batchSize, delay, ipMode,
      });

      if (response.success) {
        showAlert(
          response.ipWarning ? "warning" : "success",
          response.ipWarning
            ? `Campaign started. Note: ${response.ipWarning}`
            : `Campaign started successfully.`,
        );
        await fetchCampaignStats(campaignId);
      }
    } catch (err: unknown) {
      showAlert("error", ((err as {response?: {data?: {message?: string}}})?.response?.data?.message) ?? "Failed to start campaign.");
    } finally {
      setLoading(false);
    }
  };

  // ── Mode 3: Bulk — Pause ─────────────────────────────────────────────────────
  const handlePauseCampaign = async () => {
    setLoading(true);
    try {
      await CampaignService.pauseCampaign(campaignId);
      showAlert("success", "Campaign paused.");
      await fetchCampaignStats(campaignId);
    } catch {
      showAlert("error", "Failed to pause campaign.");
    } finally {
      setLoading(false);
    }
  };

  // ── Mode 3: Bulk — Resume ────────────────────────────────────────────────────
  const handleResumeCampaign = async () => {
    if (!validateSharedFields()) return;

    setLoading(true);
    try {
      const response = await CampaignService.resumeCampaign({
        campaignId, from, fromName, subject,
        to: [],
        templateType: templateType as "html" | "plain",
        emailTemplate: encodeURIComponent(emailTemplate),
        mode: "bulk",
        offerId, selectedIp, batchSize, delay, ipMode,
      });

      if (response.success) {
        showAlert(
          response.ipWarning ? "warning" : "success",
          response.ipWarning ? `Campaign resumed. Note: ${response.ipWarning}` : "Campaign resumed.",
        );
        await fetchCampaignStats(campaignId);
      }
    } catch (err: unknown) {
      showAlert("error", ((err as {response?: {data?: {message?: string}}})?.response?.data?.message) ?? "Failed to resume campaign.");
    } finally {
      setLoading(false);
    }
  };

  // ── Progress ─────────────────────────────────────────────────────────────────
  const getProgress = () => {
    const c = campaignStats?.counts;
    if (!c || c.total === 0) return 0;
    return ((c.sent + c.failed) / c.total) * 100;
  };

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <Box sx={{ minHeight: "100vh", p: { xs: 1, sm: 3 }, background: "#fafafa" }}>

      {/* Header */}
      <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between"
        pb={1} mb={3} sx={{ borderBottom: "1px solid #e0e0e0" }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <EmailIcon sx={{ fontSize: 32, color: "#1976d2" }} />
          <Box>
            <Typography variant="h5" fontWeight={600} color="#333">Mailing</Typography>
            <Typography variant="body2" color="#666">Create and send email campaigns</Typography>
          </Box>
        </Stack>
        <Tooltip title="Clear all form fields and start fresh for a new campaign" arrow>
          <Button variant="outlined" size="small" startIcon={<AddIcon />}
            onClick={handleNewCampaign} sx={{ textTransform: "none", borderRadius: 2 }}>
            New Campaign
          </Button>
        </Tooltip>
      </Stack>

      <Grid container spacing={2}>

        {/* ── Left column: IP selector ── */}
        <Grid item xs={12} sm={3}>
          <Stack spacing={1.5}>
            <Typography variant="subtitle2" fontWeight={600}>Server IP</Typography>
            <Select
              value={selectedIp || serverIps[0]?.value || ""}
              onChange={(e: SelectChangeEvent) => setSelectedIp(e.target.value)}
              displayEmpty fullWidth size="small"
            >
              {serverIps.map((ip) => (
                <MenuItem key={ip.value} value={ip.value}>{ip.label}</MenuItem>
              ))}
            </Select>
          </Stack>
        </Grid>

        {/* ── Centre column: email form ── */}
        <Grid item xs={12} sm={6}>
          <Card sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Email Details</Typography>
            <Stack spacing={1.5}>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                <TextField label="From Email" value={from} size="small" fullWidth
                  onChange={(e) => setFrom(e.target.value)} placeholder="sender@domain.com" />
                <TextField label="From Name" value={fromName} size="small" fullWidth
                  onChange={(e) => setFromName(e.target.value)} placeholder="Sender Name" />
              </Stack>
              <TextField label="Subject" value={subject} size="small" fullWidth
                onChange={(e) => setSubject(e.target.value)} />

              {/* Recipients — only for test and manual */}
              {(mode === "test" || mode === "manual") && (
                <Box>
                  <Typography variant="caption" color="text.secondary" mb={0.5} display="block">
                    Recipients (comma separated)
                  </Typography>
                  <TextareaAutosize
                    minRows={3}
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    placeholder="email1@example.com, email2@example.com"
                    style={{ width: "100%", padding: "8px", fontFamily: "inherit", fontSize: 14, borderRadius: 4, border: "1px solid #ccc", resize: "vertical" }}
                  />
                </Box>
              )}

              {/* Template type + preview */}
              <Stack direction="row" spacing={2} alignItems="center">
                <FormControl component="fieldset">
                  <Typography variant="caption" color="text.secondary">Template Type</Typography>
                  <RadioGroup row value={templateType} onChange={(e) => setTemplateType(e.target.value)}>
                    <FormControlLabel value="plain" control={<Radio size="small" />} label="Plain" />
                    <FormControlLabel value="html" control={<Radio size="small" />} label="HTML" />
                  </RadioGroup>
                </FormControl>
                <Button variant="outlined" size="small" color="success" onClick={handlePreview}
                  sx={{ textTransform: "none" }}>
                  Preview
                </Button>
              </Stack>

              <Box>
                <Typography variant="caption" color="text.secondary" mb={0.5} display="block">
                  Email Template
                </Typography>
                <TextareaAutosize
                  minRows={5} maxRows={12}
                  value={emailTemplate}
                  onChange={(e) => setEmailTemplate(e.target.value)}
                  placeholder={`Enter ${templateType} email template`}
                  style={{ width: "100%", padding: "8px", fontFamily: "monospace", fontSize: 13, borderRadius: 4, border: "1px solid #ccc", resize: "vertical" }}
                />
              </Box>
            </Stack>
          </Card>
        </Grid>

        {/* ── Right column: campaign config + mode ── */}
        <Grid item xs={12} sm={3}>
          <Stack spacing={1.5}>

            {/* Offer ID */}
            <TextField label="Offer ID" value={offerId} size="small" fullWidth
              onChange={(e) => setOfferId(e.target.value)} placeholder="Enter Offer ID" />

            {/* Campaign ID */}
            <Box sx={{ position: "relative" }}>
              <TextField label="Campaign ID" value={campaignId} size="small" fullWidth
                onChange={(e) => setCampaignId(e.target.value)} placeholder="Enter Campaign ID"
                InputProps={{
                  endAdornment: (
                    <Tooltip title="Must match the campaign ID used when uploading recipients." arrow>
                      <InfoOutlinedIcon sx={{ fontSize: 16, color: "#9e9e9e", cursor: "help" }} />
                    </Tooltip>
                  ),
                }}
              />
            </Box>

            {/* Batch + Delay — only relevant for bulk */}
            {mode === "bulk" && (
              <Stack direction="row" spacing={1.5}>
                <TextField label="Batch Size" type="number" value={batchSize} size="small" fullWidth
                  onChange={(e) => setBatchSize(Number(e.target.value))}
                  InputProps={{
                    endAdornment: (
                      <Tooltip title="Emails per batch" arrow>
                        <InfoOutlinedIcon sx={{ fontSize: 14, color: "#9e9e9e" }} />
                      </Tooltip>
                    ),
                  }}
                />
                <TextField label="Delay (s)" type="number" value={delay} size="small" fullWidth
                  onChange={(e) => setDelay(Number(e.target.value))}
                  InputProps={{
                    endAdornment: (
                      <Tooltip title="Seconds between batches" arrow>
                        <InfoOutlinedIcon sx={{ fontSize: 14, color: "#9e9e9e" }} />
                      </Tooltip>
                    ),
                  }}
                />
              </Stack>
            )}

            <Divider />

            {/* Mode selector */}
            <Box>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>Mode</Typography>
              <FormControl component="fieldset">
                <RadioGroup value={mode} onChange={(e) => {
                  setMode(e.target.value as Mode);
                  if (e.target.value !== "bulk") setIpMode("single");
                }}>
                  <FormControlLabel value="test" control={<Radio size="small" />}
                    label={<Chip label="Test" size="small" color="primary" variant={mode === "test" ? "filled" : "outlined"} />} />
                  <FormControlLabel value="manual" control={<Radio size="small" />}
                    label={<Chip label="Manual" size="small" color="info" variant={mode === "manual" ? "filled" : "outlined"} />} />
                  <FormControlLabel value="bulk" control={<Radio size="small" />}
                    label={<Chip label="Bulk" size="small" color="secondary" variant={mode === "bulk" ? "filled" : "outlined"} />} />
                </RadioGroup>
              </FormControl>
            </Box>

            {/* IP Rotation — bulk only */}
            {mode === "bulk" && (
              <Box sx={{ p: 1.5, background: "#f5f8ff", borderRadius: 1, border: "1px solid #e3eaf7" }}>
                <Typography variant="subtitle2" fontWeight={600} color="#1976d2" gutterBottom>
                  IP Rotation
                </Typography>
                <RadioGroup row value={ipMode} onChange={(e) => setIpMode(e.target.value as "single" | "round-robin")}>
                  <FormControlLabel value="single" control={<Radio size="small" />}
                    label={<Chip label="Single IP" size="small" variant={ipMode === "single" ? "filled" : "outlined"} />} />
                  <FormControlLabel value="round-robin" control={<Radio size="small" />}
                    label={<Chip label="Round Robin" size="small" color="secondary" variant={ipMode === "round-robin" ? "filled" : "outlined"} />} />
                </RadioGroup>
                <Typography variant="caption" color="text.secondary">
                  {ipMode === "round-robin"
                    ? "Rotates across all warmed IPs. Cold/warming IPs excluded automatically."
                    : "Uses only the selected IP above."}
                </Typography>
              </Box>
            )}

            {/* Mode descriptions */}
            {mode === "test" && (
              <Alert severity="info" sx={{ fontSize: 12 }}>
                Sends immediately to the recipients above. No tracking. Use to verify SMTP and template.
              </Alert>
            )}
            {mode === "manual" && (
              <Alert severity="info" sx={{ fontSize: 12 }}>
                Queues a one-shot send to the recipients above. No pause/resume support.
              </Alert>
            )}
            {mode === "bulk" && (
              <Alert severity="info" sx={{ fontSize: 12 }}>
                Sends to pre-loaded recipients for this Campaign ID. Supports pause, resume, and stop.
              </Alert>
            )}

          </Stack>
        </Grid>
      </Grid>

      {/* ── Campaign Status Card (bulk only, driven by API) ── */}
      {mode === "bulk" && campaignId && (
        <Card variant="outlined" sx={{ mt: 3, p: 2, borderRadius: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
            <Typography variant="subtitle1" fontWeight={600}>Campaign Status</Typography>
            <Tooltip title="Refresh status">
              <IconButton size="small" onClick={() => fetchCampaignStats(campaignId)} disabled={statsLoading}>
                {statsLoading ? <CircularProgress size={16} /> : <RefreshIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
          </Stack>

          {!campaignStats || campaignStats.status === "unknown" ? (
            <Typography variant="body2" color="text.secondary">
              No campaign found for this ID. Start one below.
            </Typography>
          ) : (
            <Stack spacing={1.5}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip
                  label={campaignStatus?.toUpperCase() ?? "—"}
                  size="small"
                  color={isRunning ? "success" : isPaused ? "warning" : "default"}
                  variant="filled"
                />
                <Typography variant="body2" color="text.secondary">
                  Campaign: {campaignId}
                </Typography>
              </Stack>

              {campaignStats.counts && (
                <>
                  <Stack direction="row" spacing={2}>
                    {[
                      { label: "Total", value: campaignStats.counts.total, color: "#1976d2" },
                      { label: "Sent", value: campaignStats.counts.sent, color: "#2e7d32" },
                      { label: "Failed", value: campaignStats.counts.failed, color: "#c62828" },
                      { label: "Pending", value: campaignStats.counts.pending, color: "#e65100" },
                    ].map((s) => (
                      <Box key={s.label} textAlign="center">
                        <Typography variant="h6" fontWeight={700} sx={{ color: s.color }}>{s.value}</Typography>
                        <Typography variant="caption" color="text.secondary">{s.label}</Typography>
                      </Box>
                    ))}
                  </Stack>
                  {campaignStats.counts.total > 0 && (
                    <Box>
                      <Stack direction="row" justifyContent="space-between" mb={0.5}>
                        <Typography variant="caption" color="text.secondary">Progress</Typography>
                        <Typography variant="caption" color="text.secondary">{getProgress().toFixed(1)}%</Typography>
                      </Stack>
                      <LinearProgress variant="determinate" value={getProgress()}
                        sx={{ height: 6, borderRadius: 3 }} />
                    </Box>
                  )}
                </>
              )}
            </Stack>
          )}
        </Card>
      )}

      {/* ── Alert ── */}
      <Collapse in={alert.open} sx={{ mt: 2 }}>
        <Alert severity={alert.severity}
          action={
            <IconButton size="small" onClick={() => setAlert((p) => ({ ...p, open: false }))}>
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }
        >
          <AlertTitle>
            {alert.severity === "success" ? "Success"
              : alert.severity === "warning" ? "Warning"
              : alert.severity === "info" ? "Info"
              : "Error"}
          </AlertTitle>
          {alert.message}
        </Alert>
      </Collapse>

      {/* ── Action Buttons ── */}
      <Box sx={{ mt: 3, display: "flex", justifyContent: "center", gap: 2, flexWrap: "wrap" }}>

        {/* Test mode */}
        {mode === "test" && (
          <Button variant="contained" color="primary" onClick={handleSendTest}
            disabled={loading} sx={{ textTransform: "none", minWidth: 140 }}>
            {loading ? <CircularProgress size={20} color="inherit" /> : "Send Test Email"}
          </Button>
        )}

        {/* Manual mode */}
        {mode === "manual" && (
          <Button variant="contained" color="info" onClick={handleSendManual}
            disabled={loading} sx={{ textTransform: "none", minWidth: 140 }}>
            {loading ? <CircularProgress size={20} color="inherit" /> : "Send Manual Email"}
          </Button>
        )}

        {/* Bulk mode */}
        {mode === "bulk" && (
          <>
            {/* Not started or completed/ended — show Start */}
            {!isActive && (
              <Button variant="contained" color="primary" onClick={handleStartCampaign}
                disabled={loading} startIcon={<PlayArrowIcon />}
                sx={{ textTransform: "none", minWidth: 140 }}>
                {loading ? <CircularProgress size={20} color="inherit" /> : "Start Campaign"}
              </Button>
            )}

            {/* Running — show Pause only */}
            {isRunning && (
              <Button variant="outlined" color="warning" onClick={handlePauseCampaign}
                disabled={loading} startIcon={<PauseIcon />}
                sx={{ textTransform: "none" }}>
                {loading ? <CircularProgress size={20} /> : "Pause"}
              </Button>
            )}

            {/* Paused — show Resume only */}
            {isPaused && (
              <Button variant="contained" color="success" onClick={handleResumeCampaign}
                disabled={loading} startIcon={<PlayArrowIcon />}
                sx={{ textTransform: "none" }}>
                {loading ? <CircularProgress size={20} color="inherit" /> : "Resume Campaign"}
              </Button>
            )}
          </>
        )}
      </Box>
    </Box>
  );
};

export default EmailForm;
