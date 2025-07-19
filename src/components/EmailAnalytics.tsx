import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  Collapse,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Stack,
} from "@mui/material";
import {
  Refresh,
  Download,
  Visibility,
  TrendingUp,
  TrendingDown,
  Email,
  CheckCircle,
  Error,
  Schedule,
  PlayArrow,
  Pause,
  Stop,
  Analytics,
} from "@mui/icons-material";
import { Campaign, CampaignStats } from "../Interfaces";
import { CampaignService } from "../utils/campaignService";

interface EmailAnalyticsProps {
  campaignId?: string;
}

const EmailAnalytics: React.FC<EmailAnalyticsProps> = () => {
  const [loading, setLoading] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [campaignStats, setCampaignStats] = useState<
    Record<string, CampaignStats>
  >({});

  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>(
    {}
  );
  const [alert, setAlert] = useState<{
    open: boolean;
    severity: "success" | "error" | "warning";
    message: string;
  }>({ open: false, severity: "success", message: "" });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const campaignsData = await CampaignService.getAllCampaigns();
      setCampaigns(campaignsData);

      // Fetch stats for each campaign
      const statsPromises = campaignsData.map(async (campaign) => {
        try {
          const stats = await CampaignService.getCampaignStats(
            campaign.campaignId
          );
          return { campaignId: campaign.campaignId, stats };
        } catch (error) {
          console.error(
            `Error fetching stats for campaign ${campaign.campaignId}:`,
            error
          );
          return { campaignId: campaign.campaignId, stats: null };
        }
      });

      const statsResults = await Promise.all(statsPromises);
      const statsMap: Record<string, CampaignStats> = {};

      statsResults.forEach((result) => {
        if (result.stats) {
          statsMap[result.campaignId] = result.stats;
        }
      });

      setCampaignStats(statsMap);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      setAlert({
        open: true,
        severity: "error",
        message: "Failed to fetch analytics data",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResumeCampaign = async (campaign: Campaign) => {
    setActionLoading((prev) => ({ ...prev, [campaign.campaignId]: true }));
    try {
      await CampaignService.resumeCampaign({
        campaignId: campaign.campaignId,
        from: campaign.from,
        fromName: campaign.fromName,
        subject: campaign.subject,
        to: [],
        templateType: campaign.templateType,
        emailTemplate: campaign.emailTemplate,
        mode: "bulk",
        offerId: campaign.offerId,
        selectedIp: campaign.selectedIp,
        batchSize: campaign.batchSize,
        delay: campaign.delay,
      });

      setAlert({
        open: true,
        severity: "success",
        message: `Campaign ${campaign.campaignId} resumed successfully`,
      });

      // Refresh analytics to get updated status
      await fetchAnalytics();
    } catch (error) {
      console.error("Error resuming campaign:", error);
      setAlert({
        open: true,
        severity: "error",
        message: `Failed to resume campaign ${campaign.campaignId}`,
      });
    } finally {
      setActionLoading((prev) => ({ ...prev, [campaign.campaignId]: false }));
    }
  };

  const handlePauseCampaign = async (campaignId: string) => {
    setActionLoading((prev) => ({ ...prev, [campaignId]: true }));
    try {
      await CampaignService.pauseCampaign(campaignId);

      setAlert({
        open: true,
        severity: "success",
        message: `Campaign ${campaignId} paused successfully`,
      });

      // Refresh analytics to get updated status
      await fetchAnalytics();
    } catch (error) {
      console.error("Error pausing campaign:", error);
      setAlert({
        open: true,
        severity: "error",
        message: `Failed to pause campaign ${campaignId}`,
      });
    } finally {
      setActionLoading((prev) => ({ ...prev, [campaignId]: false }));
    }
  };

  const handleStopCampaign = async (jobId: string, campaignId: string) => {
    setActionLoading((prev) => ({ ...prev, [campaignId]: true }));
    try {
      await CampaignService.stopJob(jobId);

      setAlert({
        open: true,
        severity: "success",
        message: `Campaign ${campaignId} stopped successfully`,
      });

      // Refresh analytics to get updated status
      await fetchAnalytics();
    } catch (error) {
      console.error("Error stopping campaign:", error);
      setAlert({
        open: true,
        severity: "error",
        message: `Failed to stop campaign ${campaignId}`,
      });
    } finally {
      setActionLoading((prev) => ({ ...prev, [campaignId]: false }));
    }
  };

  const getTotalStats = () => {
    const allStats = Object.values(campaignStats);
    return {
      total: allStats.reduce((sum, stats) => sum + stats.counts.total, 0),
      sent: allStats.reduce((sum, stats) => sum + stats.counts.sent, 0),
      failed: allStats.reduce((sum, stats) => sum + stats.counts.failed, 0),
      pending: allStats.reduce((sum, stats) => sum + stats.counts.pending, 0),
    };
  };

  const getDeliveryRate = () => {
    const stats = getTotalStats();
    const totalProcessed = stats.sent + stats.failed;
    return totalProcessed > 0 ? (stats.sent / totalProcessed) * 100 : 0;
  };

  const getBounceRate = () => {
    const stats = getTotalStats();
    const totalProcessed = stats.sent + stats.failed;
    return totalProcessed > 0 ? (stats.failed / totalProcessed) * 100 : 0;
  };

  const totalStats = getTotalStats();
  const deliveryRate = getDeliveryRate();
  const bounceRate = getBounceRate();

  const handleExportData = () => {
    // TODO: Implement export functionality
    console.log("Export data");
  };

  const handleViewDetails = (campaignId: string) => {
    const campaign = campaigns.find((c) => c.campaignId === campaignId);
    if (!campaign) return;

    // Only allow if status is paused or failed/stopped
    if (
      campaign.status === "paused" ||
      campaign.status === "running" ||
      campaign.status === "pending"
    ) {
      // Serialize campaign data and store in localStorage
      localStorage.setItem(
        "prepopulateMailingCampaign",
        JSON.stringify(campaign)
      );
      window.open("/mailing?fromAnalytics=1", "_blank");
    } else if (campaign.status === "completed") {
      setAlert({
        open: true,
        severity: "warning",
        message: "Cannot edit a completed campaign.",
      });
    } else {
      setAlert({
        open: true,
        severity: "warning",
        message: `Campaign status is ${campaign.status}. Only paused or stopped campaigns can be edited.`,
      });
    }
  };

  return (
    <Box sx={{ maxWidth: "100%", mx: "auto" }}>
      <Card elevation={1} sx={{ borderRadius: 2, overflow: "hidden", border: "1px solid #e0e0e0" }}>
        <CardContent sx={{ p: 0 }}>
          {/* Header */}
          <Box sx={{ 
            p: 3, 
            background: "#ffffff",
            color: "#333",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid #e0e0e0"
          }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Analytics sx={{ fontSize: 32, color: "#1976d2" }} />
              <Box>
                <Typography variant="h5" fontWeight={600} color="#333">
                  Email Analytics
                </Typography>
                <Typography variant="body2" sx={{ color: "#666" }}>
                  Campaign performance and delivery insights
                </Typography>
              </Box>
            </Stack>
            <Stack direction="row" spacing={1}>
              <Tooltip title="Export Data">
                <IconButton 
                  onClick={handleExportData}
                  sx={{ color: "#666" }}
                >
                  <Download />
                </IconButton>
              </Tooltip>
              <Tooltip title="Refresh">
                <IconButton 
                  onClick={fetchAnalytics} 
                  disabled={loading}
                  sx={{ color: "#666" }}
                >
                  <Refresh />
                </IconButton>
              </Tooltip>
            </Stack>
          </Box>

          {/* Content */}
          <Box sx={{ p: 3 }}>
            {/* Summary Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card elevation={0} sx={{ border: "1px solid #e0e0e0", borderRadius: 2, height: "100%" }}>
                  <CardContent>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <Email color="primary" sx={{ mr: 1 }} />
                      <Typography color="textSecondary" variant="body2" fontWeight={500}>
                        Total Emails
                      </Typography>
                    </Box>
                    <Typography variant="h4" color="primary" fontWeight={600}>
                      {totalStats.total.toLocaleString()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card elevation={0} sx={{ border: "1px solid #e0e0e0", borderRadius: 2, height: "100%" }}>
                  <CardContent>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <CheckCircle color="success" sx={{ mr: 1 }} />
                      <Typography color="textSecondary" variant="body2" fontWeight={500}>
                        Delivered
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
                      <Typography variant="h4" color="success.main" fontWeight={600}>
                        {totalStats.sent.toLocaleString()}
                      </Typography>
                      <Typography variant="caption" color="textSecondary" sx={{ fontSize: "0.75rem" }}>
                        ({deliveryRate.toFixed(1)}% delivery rate)
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card elevation={0} sx={{ border: "1px solid #e0e0e0", borderRadius: 2, height: "100%" }}>
                  <CardContent>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <Error color="error" sx={{ mr: 1 }} />
                      <Typography color="textSecondary" variant="body2" fontWeight={500}>
                        Failed
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
                      <Typography variant="h4" color="error" fontWeight={600}>
                        {totalStats.failed.toLocaleString()}
                      </Typography>
                      <Typography variant="caption" color="textSecondary" sx={{ fontSize: "0.75rem" }}>
                        ({bounceRate.toFixed(1)}% bounce rate)
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card elevation={0} sx={{ border: "1px solid #e0e0e0", borderRadius: 2, height: "100%" }}>
                  <CardContent>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <Schedule color="warning" sx={{ mr: 1 }} />
                      <Typography color="textSecondary" variant="body2" fontWeight={500}>
                        Pending
                      </Typography>
                    </Box>
                    <Typography variant="h4" color="warning.main" fontWeight={600}>
                      {totalStats.pending.toLocaleString()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Campaign Performance Table */}
            <Card elevation={0} sx={{ border: "1px solid #e0e0e0", borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom color="#333" fontWeight={600}>
                  Campaign Performance
                </Typography>
                {loading ? (
                  <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                    <CircularProgress color="primary" />
                  </Box>
                ) : (
                  <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #e0e0e0" }}>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ background: "#f8f9fa" }}>
                          <TableCell sx={{ fontWeight: 600 }}>Campaign</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>Total</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>Sent</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>Failed</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>Pending</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>Delivery Rate</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 600 }}>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {campaigns.map((campaign) => {
                          const stats = campaignStats[campaign.campaignId];
                          if (!stats) return null;

                          const deliveryRate =
                            stats.counts.sent + stats.counts.failed > 0
                              ? (stats.counts.sent /
                                  (stats.counts.sent + stats.counts.failed)) *
                                100
                              : 0;

                          return (
                            <TableRow key={campaign.campaignId} sx={{ '&:hover': { background: '#f8f9fa' } }}>
                              <TableCell>
                                <Box>
                                  <Typography variant="subtitle2" fontWeight={500}>
                                    {campaign.subject}
                                  </Typography>
                                  <Typography variant="body2" color="textSecondary">
                                    Campaign ID: {campaign.campaignId}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={campaign.status.toUpperCase()}
                                  color={
                                    campaign.status === "running"
                                      ? "success"
                                      : campaign.status === "paused"
                                      ? "warning"
                                      : campaign.status === "completed"
                                      ? "info"
                                      : "error"
                                  }
                                  size="small"
                                  sx={{ fontWeight: 500 }}
                                />
                              </TableCell>
                              <TableCell align="right">
                                <Typography variant="body2" fontWeight={500}>
                                  {stats.counts.total.toLocaleString()}
                                </Typography>
                              </TableCell>
                              <TableCell align="right">
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "flex-end",
                                  }}
                                >
                                  <CheckCircle
                                    color="success"
                                    sx={{ mr: 0.5, fontSize: 16 }}
                                  />
                                  <Typography variant="body2" fontWeight={500}>
                                    {stats.counts.sent.toLocaleString()}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell align="right">
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "flex-end",
                                  }}
                                >
                                  <Error
                                    color="error"
                                    sx={{ mr: 0.5, fontSize: 16 }}
                                  />
                                  <Typography variant="body2" fontWeight={500}>
                                    {stats.counts.failed.toLocaleString()}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell align="right">
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "flex-end",
                                  }}
                                >
                                  <Schedule
                                    color="warning"
                                    sx={{ mr: 0.5, fontSize: 16 }}
                                  />
                                  <Typography variant="body2" fontWeight={500}>
                                    {stats.counts.pending.toLocaleString()}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell align="right">
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "flex-end",
                                  }}
                                >
                                  {deliveryRate >= 95 ? (
                                    <TrendingUp
                                      color="success"
                                      sx={{ mr: 0.5, fontSize: 16 }}
                                    />
                                  ) : (
                                    <TrendingDown
                                      color="error"
                                      sx={{ mr: 0.5, fontSize: 16 }}
                                    />
                                  )}
                                  <Typography variant="body2" fontWeight={500}>
                                    {deliveryRate.toFixed(1)}%
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell align="center">
                                <Box
                                  sx={{
                                    display: "flex",
                                    gap: 1,
                                    justifyContent: "center",
                                  }}
                                >
                                  <Tooltip title="View Details">
                                    <IconButton
                                      size="small"
                                      onClick={() =>
                                        handleViewDetails(campaign.campaignId)
                                      }
                                      sx={{ color: "#666" }}
                                    >
                                      <Visibility />
                                    </IconButton>
                                  </Tooltip>

                                  {/* Campaign Control Actions */}
                                  {campaign.status === "paused" && (
                                    <Tooltip title="Resume Campaign">
                                      <IconButton
                                        size="small"
                                        color="success"
                                        onClick={() => handleResumeCampaign(campaign)}
                                        disabled={actionLoading[campaign.campaignId]}
                                      >
                                        {actionLoading[campaign.campaignId] ? (
                                          <CircularProgress size={16} />
                                        ) : (
                                          <PlayArrow />
                                        )}
                                      </IconButton>
                                    </Tooltip>
                                  )}

                                  {campaign.status === "running" && (
                                    <>
                                      <Tooltip title="Pause Campaign">
                                        <IconButton
                                          size="small"
                                          color="warning"
                                          onClick={() =>
                                            handlePauseCampaign(campaign.campaignId)
                                          }
                                          disabled={
                                            actionLoading[campaign.campaignId]
                                          }
                                        >
                                          {actionLoading[campaign.campaignId] ? (
                                            <CircularProgress size={16} />
                                          ) : (
                                            <Pause />
                                          )}
                                        </IconButton>
                                      </Tooltip>

                                      {campaign.jobId && (
                                        <Tooltip title="Stop Campaign">
                                          <IconButton
                                            size="small"
                                            color="error"
                                            onClick={() =>
                                              handleStopCampaign(
                                                campaign.jobId!,
                                                campaign.campaignId
                                              )
                                            }
                                            disabled={
                                              actionLoading[campaign.campaignId]
                                            }
                                          >
                                            {actionLoading[campaign.campaignId] ? (
                                              <CircularProgress size={16} />
                                            ) : (
                                              <Stop />
                                            )}
                                          </IconButton>
                                        </Tooltip>
                                      )}
                                    </>
                                  )}
                                </Box>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </Card>

            {/* Alert */}
            <Collapse in={alert.open} sx={{ mt: 2 }}>
              <Alert
                severity={alert.severity}
                sx={{ mb: 2 }}
                onClose={() => setAlert({ ...alert, open: false })}
              >
                {alert.message}
              </Alert>
            </Collapse>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default EmailAnalytics;
