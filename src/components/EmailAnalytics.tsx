import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
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
} from '@mui/icons-material';
import { Campaign, CampaignStats } from '../Interfaces';
import { CampaignService } from '../utils/campaignService';

interface EmailAnalyticsProps {
  campaignId?: string;
}

const EmailAnalytics: React.FC<EmailAnalyticsProps> = () => {
  const [loading, setLoading] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [campaignStats, setCampaignStats] = useState<Record<string, CampaignStats>>({});

  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});
  const [alert, setAlert] = useState<{
    open: boolean;
    severity: 'success' | 'error' | 'warning';
    message: string;
  }>({ open: false, severity: 'success', message: '' });

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
          const stats = await CampaignService.getCampaignStats(campaign.campaignId);
          return { campaignId: campaign.campaignId, stats };
        } catch (error) {
          console.error(`Error fetching stats for campaign ${campaign.campaignId}:`, error);
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
      console.error('Error fetching analytics:', error);
      setAlert({
        open: true,
        severity: 'error',
        message: 'Failed to fetch analytics data',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResumeCampaign = async (campaign: Campaign) => {
    setActionLoading(prev => ({ ...prev, [campaign.campaignId]: true }));
    try {
      await CampaignService.resumeCampaign({
        campaignId: campaign.campaignId,
        from: campaign.from,
        fromName: campaign.fromName,
        subject: campaign.subject,
        to: [],
        templateType: campaign.templateType,
        emailTemplate: campaign.emailTemplate,
        mode: 'bulk',
        offerId: campaign.offerId,
        selectedIp: campaign.selectedIp,
        batchSize: campaign.batchSize,
        delay: campaign.delay,
      });
      
      setAlert({
        open: true,
        severity: 'success',
        message: `Campaign ${campaign.campaignId} resumed successfully`,
      });
      
      // Refresh analytics to get updated status
      await fetchAnalytics();
    } catch (error) {
      console.error('Error resuming campaign:', error);
      setAlert({
        open: true,
        severity: 'error',
        message: `Failed to resume campaign ${campaign.campaignId}`,
      });
    } finally {
      setActionLoading(prev => ({ ...prev, [campaign.campaignId]: false }));
    }
  };

  const handlePauseCampaign = async (campaignId: string) => {
    setActionLoading(prev => ({ ...prev, [campaignId]: true }));
    try {
      await CampaignService.pauseCampaign(campaignId);
      
      setAlert({
        open: true,
        severity: 'success',
        message: `Campaign ${campaignId} paused successfully`,
      });
      
      // Refresh analytics to get updated status
      await fetchAnalytics();
    } catch (error) {
      console.error('Error pausing campaign:', error);
      setAlert({
        open: true,
        severity: 'error',
        message: `Failed to pause campaign ${campaignId}`,
      });
    } finally {
      setActionLoading(prev => ({ ...prev, [campaignId]: false }));
    }
  };

  const handleStopCampaign = async (jobId: string, campaignId: string) => {
    setActionLoading(prev => ({ ...prev, [campaignId]: true }));
    try {
      await CampaignService.stopJob(jobId);
      
      setAlert({
        open: true,
        severity: 'success',
        message: `Campaign ${campaignId} stopped successfully`,
      });
      
      // Refresh analytics to get updated status
      await fetchAnalytics();
    } catch (error) {
      console.error('Error stopping campaign:', error);
      setAlert({
        open: true,
        severity: 'error',
        message: `Failed to stop campaign ${campaignId}`,
      });
    } finally {
      setActionLoading(prev => ({ ...prev, [campaignId]: false }));
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
    console.log('Export data');
  };

  const handleViewDetails = (campaignId: string) => {
    console.log('View details for campaign:', campaignId);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Email Analytics
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Export Data">
            <IconButton onClick={handleExportData}>
              <Download />
            </IconButton>
          </Tooltip>
          <Tooltip title="Refresh">
            <IconButton onClick={fetchAnalytics} disabled={loading}>
              <Refresh />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Email color="primary" sx={{ mr: 1 }} />
                <Typography color="textSecondary">
                  Total Emails
                </Typography>
              </Box>
              <Typography variant="h4" color="primary">
                {totalStats.total.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CheckCircle color="success" sx={{ mr: 1 }} />
                <Typography color="textSecondary">
                  Delivered
                </Typography>
              </Box>
              <Typography variant="h4" color="success.main">
                {totalStats.sent.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {deliveryRate.toFixed(1)}% delivery rate
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Error color="error" sx={{ mr: 1 }} />
                <Typography color="textSecondary">
                  Failed
                </Typography>
              </Box>
              <Typography variant="h4" color="error">
                {totalStats.failed.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {bounceRate.toFixed(1)}% bounce rate
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Schedule color="warning" sx={{ mr: 1 }} />
                <Typography color="textSecondary">
                  Pending
                </Typography>
              </Box>
              <Typography variant="h4" color="warning.main">
                {totalStats.pending.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Campaign Performance Table */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Campaign Performance
          </Typography>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Campaign</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Total</TableCell>
                    <TableCell align="right">Sent</TableCell>
                    <TableCell align="right">Failed</TableCell>
                    <TableCell align="right">Pending</TableCell>
                    <TableCell align="right">Delivery Rate</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {campaigns.map((campaign) => {
                    const stats = campaignStats[campaign.campaignId];
                    if (!stats) return null;

                    const deliveryRate = stats.counts.sent + stats.counts.failed > 0
                      ? (stats.counts.sent / (stats.counts.sent + stats.counts.failed)) * 100
                      : 0;

                    return (
                      <TableRow key={campaign.campaignId}>
                        <TableCell>
                          <Box>
                            <Typography variant="subtitle2">
                              {campaign.subject}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              {campaign.campaignId}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={campaign.status.toUpperCase()}
                            color={
                              campaign.status === 'running' ? 'success' :
                              campaign.status === 'paused' ? 'warning' :
                              campaign.status === 'completed' ? 'info' :
                              'error'
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="right">
                          {stats.counts.total.toLocaleString()}
                        </TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                            <CheckCircle color="success" sx={{ mr: 0.5, fontSize: 16 }} />
                            {stats.counts.sent.toLocaleString()}
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                            <Error color="error" sx={{ mr: 0.5, fontSize: 16 }} />
                            {stats.counts.failed.toLocaleString()}
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                            <Schedule color="warning" sx={{ mr: 0.5, fontSize: 16 }} />
                            {stats.counts.pending.toLocaleString()}
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                            {deliveryRate >= 95 ? (
                              <TrendingUp color="success" sx={{ mr: 0.5, fontSize: 16 }} />
                            ) : (
                              <TrendingDown color="error" sx={{ mr: 0.5, fontSize: 16 }} />
                            )}
                            {deliveryRate.toFixed(1)}%
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                            <Tooltip title="View Details">
                              <IconButton
                                size="small"
                                onClick={() => handleViewDetails(campaign.campaignId)}
                              >
                                <Visibility />
                              </IconButton>
                            </Tooltip>
                            
                            {/* Campaign Control Actions */}
                            {campaign.status === 'paused' && (
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
                            
                            {campaign.status === 'running' && (
                              <>
                                <Tooltip title="Pause Campaign">
                                  <IconButton
                                    size="small"
                                    color="warning"
                                    onClick={() => handlePauseCampaign(campaign.campaignId)}
                                    disabled={actionLoading[campaign.campaignId]}
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
                                      onClick={() => handleStopCampaign(campaign.jobId!, campaign.campaignId)}
                                      disabled={actionLoading[campaign.campaignId]}
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
      <Collapse in={alert.open}>
        <Alert
          severity={alert.severity}
          sx={{ mb: 2 }}
          onClose={() => setAlert({ ...alert, open: false })}
        >
          {alert.message}
        </Alert>
      </Collapse>
    </Box>
  );
};

export default EmailAnalytics; 