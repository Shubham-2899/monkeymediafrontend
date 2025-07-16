import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Chip,
  LinearProgress,
  IconButton,
  Tooltip,
  Alert,
  Collapse,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  Stop,
  Refresh,
  Delete,
  Visibility,
  Edit,
} from '@mui/icons-material';
import { Campaign, CampaignStats } from '../Interfaces';
import { CampaignService } from '../utils/campaignService';

interface CampaignDashboardProps {
  campaign: Campaign;
  stats: CampaignStats;
  onRefresh: () => void;
  onEdit: (campaign: Campaign) => void;
  onViewDetails: (campaign: Campaign) => void;
}

const CampaignDashboard: React.FC<CampaignDashboardProps> = ({
  campaign,
  stats,
  onRefresh,
  onEdit,
  onViewDetails,
}) => {
  const [loading, setLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [alert, setAlert] = useState<{
    open: boolean;
    severity: 'success' | 'error' | 'warning';
    message: string;
  }>({ open: false, severity: 'success', message: '' });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'success';
      case 'paused':
        return 'warning';
      case 'completed':
        return 'info';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  const getProgressPercentage = () => {
    const total = stats.counts.total;
    const sent = stats.counts.sent;
    const failed = stats.counts.failed;
    return total > 0 ? ((sent + failed) / total) * 100 : 0;
  };

  const handlePauseResume = async () => {
    setLoading(true);
    try {
      if (campaign.status === 'running') {
        await CampaignService.pauseCampaign(campaign.campaignId);
        setAlert({
          open: true,
          severity: 'success',
          message: 'Campaign paused successfully',
        });
      } else if (campaign.status === 'paused') {
        // For resume, we need the full campaign data
        const campaignData = {
          campaignId: campaign.campaignId,
          from: campaign.from,
          fromName: campaign.fromName,
          subject: campaign.subject,
          emailTemplate: campaign.emailTemplate,
          templateType: campaign.templateType,
          offerId: campaign.offerId,
          selectedIp: campaign.selectedIp,
          to: [], // This will be fetched from the backend
          mode: campaign.mode,
          batchSize: campaign.batchSize,
          delay: campaign.delay,
        };
        await CampaignService.resumeCampaign(campaignData);
        setAlert({
          open: true,
          severity: 'success',
          message: 'Campaign resumed successfully',
        });
      }
      onRefresh();
    } catch (error) {
      setAlert({
        open: true,
        severity: 'error',
        message: `Failed to ${campaign.status === 'running' ? 'pause' : 'resume'} campaign`,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStopJob = async () => {
    if (!campaign.jobId) return;
    
    setLoading(true);
    try {
      await CampaignService.stopJob(campaign.jobId);
      setAlert({
        open: true,
        severity: 'success',
        message: 'Job stopped successfully',
      });
      onRefresh();
    } catch (error) {
      setAlert({
        open: true,
        severity: 'error',
        message: 'Failed to stop job',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCleanup = async () => {
    setLoading(true);
    try {
      await CampaignService.cleanupCampaignData(campaign.campaignId);
      setAlert({
        open: true,
        severity: 'success',
        message: 'Campaign data cleaned up successfully',
      });
      onRefresh();
    } catch (error) {
      setAlert({
        open: true,
        severity: 'error',
        message: 'Failed to cleanup campaign data',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h6" gutterBottom>
              {campaign.subject}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Campaign ID: {campaign.campaignId}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              From: {campaign.fromName} &lt;{campaign.from}&gt;
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
                         <Chip
               label={campaign.status.toUpperCase()}
               color={getStatusColor(campaign.status) as 'success' | 'warning' | 'info' | 'error' | 'default'}
               size="small"
             />
            <Tooltip title="View Details">
              <IconButton size="small" onClick={() => onViewDetails(campaign)}>
                <Visibility />
              </IconButton>
            </Tooltip>
            <Tooltip title="Edit Campaign">
              <IconButton size="small" onClick={() => onEdit(campaign)}>
                <Edit />
              </IconButton>
            </Tooltip>
            <Tooltip title="Refresh">
              <IconButton size="small" onClick={onRefresh}>
                <Refresh />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={3}>
            <Box textAlign="center">
              <Typography variant="h4" color="primary">
                {stats.counts.sent}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Sent
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Box textAlign="center">
              <Typography variant="h4" color="error">
                {stats.counts.failed}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Failed
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Box textAlign="center">
              <Typography variant="h4" color="warning.main">
                {stats.counts.pending}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pending
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Box textAlign="center">
              <Typography variant="h4">
                {stats.counts.total}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2">Progress</Typography>
            <Typography variant="body2">{getProgressPercentage().toFixed(1)}%</Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={getProgressPercentage()}
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {(campaign.status === 'running' || campaign.status === 'paused') && (
            <Button
              variant="contained"
              startIcon={campaign.status === 'running' ? <Pause /> : <PlayArrow />}
              onClick={handlePauseResume}
              disabled={loading}
              color={campaign.status === 'running' ? 'warning' : 'success'}
            >
              {loading ? <CircularProgress size={20} /> : campaign.status === 'running' ? 'Pause' : 'Resume'}
            </Button>
          )}

          {campaign.status === 'running' && campaign.jobId && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<Stop />}
              onClick={handleStopJob}
              disabled={loading}
            >
              Stop Job
            </Button>
          )}

          {campaign.status === 'completed' && (
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<Delete />}
              onClick={() => setShowDeleteDialog(true)}
              disabled={loading}
            >
              Cleanup Data
            </Button>
          )}
        </Box>

        <Collapse in={alert.open}>
          <Alert
            severity={alert.severity}
            sx={{ mt: 2 }}
            onClose={() => setAlert({ ...alert, open: false })}
          >
            {alert.message}
          </Alert>
        </Collapse>
      </CardContent>

      <Dialog open={showDeleteDialog} onClose={() => setShowDeleteDialog(false)}>
        <DialogTitle>Confirm Cleanup</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to cleanup the campaign data? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleCleanup} color="error" variant="contained">
            Cleanup
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default CampaignDashboard; 