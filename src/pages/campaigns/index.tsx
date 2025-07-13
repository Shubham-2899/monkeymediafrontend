import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Collapse,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { Add, Refresh } from "@mui/icons-material";
import { Campaign, CampaignStats } from "../../Interfaces";
import { CampaignService } from "../../utils/campaignService";
import CampaignDashboard from "../../components/CampaignDashboard";
import EmailCampaignForm from "../../components/EmailCampaignForm";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`campaign-tabpanel-${index}`}
      aria-labelledby={`campaign-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const CampaignsPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [campaignStats, setCampaignStats] = useState<
    Record<string, CampaignStats>
  >({});
  const [loading, setLoading] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [alert, setAlert] = useState<{
    open: boolean;
    severity: "success" | "error" | "warning";
    message: string;
  }>({ open: false, severity: "success", message: "" });

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
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
      console.error("Error fetching campaigns:", error);
      setAlert({
        open: true,
        severity: "error",
        message: "Failed to fetch campaigns",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleCampaignCreated = (campaignId: string) => {
    setShowCreateDialog(false);
    fetchCampaigns();
    setAlert({
      open: true,
      severity: "success",
      message: `Campaign ${campaignId} created successfully`,
    });
  };

  const handleCampaignStarted = (jobId: string) => {
    setAlert({
      open: true,
      severity: "success",
      message: `Campaign started with job ID: ${jobId}`,
    });
  };

  const handleEditCampaign = (campaign: Campaign) => {
    // TODO: Implement edit functionality
    console.log("Edit campaign:", campaign);
  };

  const handleViewDetails = (campaign: Campaign) => {
    // TODO: Implement view details functionality
    console.log("View campaign details:", campaign);
  };

  const getFilteredCampaigns = () => {
    switch (tabValue) {
      case 0: // All campaigns
        return campaigns;
      case 1: // Running campaigns
        return campaigns.filter((c) => c.status === "running");
      case 2: // Paused campaigns
        return campaigns.filter((c) => c.status === "paused");
      case 3: // Completed campaigns
        return campaigns.filter((c) => c.status === "completed");
      case 4: // Failed campaigns
        return campaigns.filter((c) => c.status === "failed");
      default:
        return campaigns;
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

  const totalStats = getTotalStats();

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4" component="h1">
          Email Campaigns
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Tooltip title="Refresh">
            <IconButton onClick={fetchCampaigns} disabled={loading}>
              <Refresh />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setShowCreateDialog(true)}
          >
            Create Campaign
          </Button>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Emails
              </Typography>
              <Typography variant="h4" color="primary">
                {totalStats.total}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Sent
              </Typography>
              <Typography variant="h4" color="success.main">
                {totalStats.sent}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Failed
              </Typography>
              <Typography variant="h4" color="error">
                {totalStats.failed}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Pending
              </Typography>
              <Typography variant="h4" color="warning.main">
                {totalStats.pending}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="campaign tabs"
        >
          <Tab label={`All (${campaigns.length})`} />
          <Tab
            label={`Running (${
              campaigns.filter((c) => c.status === "running").length
            })`}
          />
          <Tab
            label={`Paused (${
              campaigns.filter((c) => c.status === "paused").length
            })`}
          />
          <Tab
            label={`Completed (${
              campaigns.filter((c) => c.status === "completed").length
            })`}
          />
          <Tab
            label={`Failed (${
              campaigns.filter((c) => c.status === "failed").length
            })`}
          />
        </Tabs>
      </Box>

      {/* Campaign List */}
      <TabPanel value={tabValue} index={0}>
        <TabPanel value={tabValue} index={1}>
          <TabPanel value={tabValue} index={2}>
            <TabPanel value={tabValue} index={3}>
              <TabPanel value={tabValue} index={4}>
                {loading ? (
                  <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : getFilteredCampaigns().length === 0 ? (
                  <Box sx={{ textAlign: "center", p: 4 }}>
                    <Typography variant="h6" color="textSecondary" gutterBottom>
                      No campaigns found
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Create your first campaign to get started
                    </Typography>
                  </Box>
                ) : (
                  <Box>
                    {getFilteredCampaigns().map((campaign) => {
                      const stats = campaignStats[campaign.campaignId];
                      return stats ? (
                        <CampaignDashboard
                          key={campaign.campaignId}
                          campaign={campaign}
                          stats={stats}
                          onRefresh={fetchCampaigns}
                          onEdit={handleEditCampaign}
                          onViewDetails={handleViewDetails}
                        />
                      ) : null;
                    })}
                  </Box>
                )}
              </TabPanel>
            </TabPanel>
          </TabPanel>
        </TabPanel>
      </TabPanel>

      {/* Create Campaign Dialog */}
      <Dialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Create New Campaign</DialogTitle>
        <DialogContent>
          <EmailCampaignForm
            onCampaignCreated={handleCampaignCreated}
            onCampaignStarted={handleCampaignStarted}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCreateDialog(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>

      {/* Alert */}
      <Collapse in={alert.open}>
        <Alert
          severity={alert.severity}
          sx={{ position: "fixed", bottom: 16, right: 16, zIndex: 1000 }}
          onClose={() => setAlert({ ...alert, open: false })}
        >
          {alert.message}
        </Alert>
      </Collapse>
    </Box>
  );
};

export default CampaignsPage;
