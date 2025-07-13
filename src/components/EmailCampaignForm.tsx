import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  RadioGroup,
  FormControlLabel,
  Radio,
  Chip,
  Alert,
  Collapse,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  IconButton,
  Tooltip,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Send,
  Preview,
  PlayArrow,
  Refresh,
  Email,
  Settings,
  Description,
} from '@mui/icons-material';
import { validateEmail, validateEmails } from '../heplers/UserDataValidation';
import { CampaignService } from '../utils/campaignService';
import { CreateCampaignDto, ServerIp } from '../Interfaces';

interface EmailCampaignFormProps {
  onCampaignCreated?: (campaignId: string) => void;
  onCampaignStarted?: (jobId: string) => void;
}

const EmailCampaignForm: React.FC<EmailCampaignFormProps> = ({
  onCampaignCreated,
  onCampaignStarted,
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [serverIps, setServerIps] = useState<ServerIp[]>([]);
  const [alert, setAlert] = useState<{
    open: boolean;
    severity: 'success' | 'error' | 'warning';
    message: string;
  }>({ open: false, severity: 'success', message: '' });

  // Form state
  const [formData, setFormData] = useState<CreateCampaignDto>({
    campaignId: '',
    from: '',
    fromName: '',
    subject: '',
    emailTemplate: '',
    templateType: 'html',
    offerId: '',
    selectedIp: '',
    to: [],
    mode: 'test',
    batchSize: 5,
    delay: 5,
  });

  const [recipients, setRecipients] = useState<string>('');
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    fetchServerIps();
  }, []);

  const fetchServerIps = async () => {
    try {
      const response = await CampaignService.getAvailableIps();
      const domainIp = response.domainIp as Record<string, string[]>;
      
      const formattedIps: ServerIp[] = Object.entries(domainIp).flatMap(
        ([domain, ips]) =>
          ips.map((ip: string) => ({
            label: `${domain} - ${ip}`,
            value: `${domain} - ${ip}`,
            domain,
            ip,
          }))
      );

      setServerIps(formattedIps);
      if (formattedIps.length > 0) {
        setFormData(prev => ({ ...prev, selectedIp: formattedIps[0].value }));
      }
    } catch (error) {
      console.error('Error fetching server IPs:', error);
      setAlert({
        open: true,
        severity: 'error',
        message: 'Failed to fetch server IPs',
      });
    }
  };

  const handleInputChange = (field: keyof CreateCampaignDto, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleRecipientsChange = (value: string) => {
    setRecipients(value);
    const emails = validateEmails(value);
    setFormData(prev => ({ ...prev, to: emails }));
  };

  const validateForm = (): string | null => {
    if (!formData.campaignId) return 'Campaign ID is required';
    if (!formData.from) return 'From email is required';
    if (!validateEmail(formData.from)) return 'Invalid from email format';
    if (!formData.fromName) return 'From name is required';
    if (!formData.subject) return 'Subject is required';
    if (!formData.emailTemplate) return 'Email template is required';
    if (!formData.offerId) return 'Offer ID is required';
    if (!formData.selectedIp) return 'Server IP is required';
    if (formData.to.length === 0) return 'At least one recipient is required';
    if (formData.mode === 'bulk' && (!formData.batchSize || !formData.delay)) {
      return 'Batch size and delay are required for bulk mode';
    }
    return null;
  };

  const handlePreview = () => {
    setPreviewMode(!previewMode);
  };

  const handleTestMode = async () => {
    const validationError = validateForm();
    if (validationError) {
      setAlert({
        open: true,
        severity: 'error',
        message: validationError,
      });
      return;
    }

    setLoading(true);
    try {
      const campaignData = { ...formData, mode: 'test' as const };
      const response = await CampaignService.createCampaign(campaignData);
      
      setAlert({
        open: true,
        severity: 'success',
        message: `Test completed! ${response.emailSent} emails sent successfully${response.emailFailed ? `, ${response.emailFailed} failed` : ''}`,
      });

      if (onCampaignCreated) {
        onCampaignCreated(formData.campaignId);
      }
    } catch (error) {
      setAlert({
        open: true,
        severity: 'error',
        message: 'Failed to send test emails',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBulkMode = async () => {
    const validationError = validateForm();
    if (validationError) {
      setAlert({
        open: true,
        severity: 'error',
        message: validationError,
      });
      return;
    }

    setLoading(true);
    try {
      const campaignData = { ...formData, mode: 'bulk' as const };
      const response = await CampaignService.createCampaign(campaignData);
      
      setAlert({
        open: true,
        severity: 'success',
        message: `Campaign started successfully! Job ID: ${response.jobId}`,
      });

      if (onCampaignCreated) {
        onCampaignCreated(formData.campaignId);
      }
      if (onCampaignStarted && response.jobId) {
        onCampaignStarted(response.jobId);
      }
    } catch (error) {
      setAlert({
        open: true,
        severity: 'error',
        message: 'Failed to start campaign',
      });
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    {
      label: 'Campaign Details',
      icon: <Email />,
      content: (
        <Box sx={{ p: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Campaign ID"
                value={formData.campaignId}
                onChange={(e) => handleInputChange('campaignId', e.target.value)}
                placeholder="Enter unique campaign ID"
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Offer ID"
                value={formData.offerId}
                onChange={(e) => handleInputChange('offerId', e.target.value)}
                placeholder="Enter offer ID"
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="From Email"
                value={formData.from}
                onChange={(e) => handleInputChange('from', e.target.value)}
                placeholder="sender@domain.com"
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="From Name"
                value={formData.fromName}
                onChange={(e) => handleInputChange('fromName', e.target.value)}
                placeholder="Sender Name"
                size="small"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Subject"
                value={formData.subject}
                onChange={(e) => handleInputChange('subject', e.target.value)}
                placeholder="Email subject line"
                size="small"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth size="small">
                <InputLabel>Server IP</InputLabel>
                <Select
                  value={formData.selectedIp}
                  onChange={(e) => handleInputChange('selectedIp', e.target.value)}
                  label="Server IP"
                >
                  {serverIps.map((ip) => (
                    <MenuItem key={ip.value} value={ip.value}>
                      {ip.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>
      ),
    },
    {
      label: 'Recipients',
      icon: <Email />,
      content: (
        <Box sx={{ p: 2 }}>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Recipients"
            value={recipients}
            onChange={(e) => handleRecipientsChange(e.target.value)}
            placeholder="Enter email addresses separated by commas"
            helperText={`${formData.to.length} valid email(s) found`}
          />
          {formData.to.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Valid recipients:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {formData.to.slice(0, 10).map((email, index) => (
                  <Chip key={index} label={email} size="small" />
                ))}
                {formData.to.length > 10 && (
                  <Chip label={`+${formData.to.length - 10} more`} size="small" />
                )}
              </Box>
            </Box>
          )}
        </Box>
      ),
    },
         {
       label: 'Email Template',
       icon: <Description />,
      content: (
        <Box sx={{ p: 2 }}>
          <Box sx={{ mb: 2 }}>
            <FormControl component="fieldset">
              <Typography variant="subtitle2" gutterBottom>
                Template Type:
              </Typography>
              <RadioGroup
                row
                value={formData.templateType}
                onChange={(e) => handleInputChange('templateType', e.target.value as 'html' | 'plain')}
              >
                <FormControlLabel value="html" control={<Radio />} label="HTML" />
                <FormControlLabel value="plain" control={<Radio />} label="Plain Text" />
              </RadioGroup>
            </FormControl>
          </Box>
          
          <TextField
            fullWidth
            multiline
            rows={8}
            label="Email Template"
            value={formData.emailTemplate}
            onChange={(e) => handleInputChange('emailTemplate', e.target.value)}
            placeholder={`Enter ${formData.templateType} email template`}
          />
          
          <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<Preview />}
              onClick={handlePreview}
            >
              Preview
            </Button>
          </Box>
        </Box>
      ),
    },
    {
      label: 'Settings',
      icon: <Settings />,
      content: (
        <Box sx={{ p: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Batch Size"
                value={formData.batchSize}
                onChange={(e) => handleInputChange('batchSize', Number(e.target.value))}
                size="small"
                inputProps={{ min: 1, max: 100 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Delay (seconds)"
                value={formData.delay}
                onChange={(e) => handleInputChange('delay', Number(e.target.value))}
                size="small"
                inputProps={{ min: 1, max: 300 }}
              />
            </Grid>
          </Grid>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 2 }}>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" component="h1" sx={{ flexGrow: 1 }}>
              Email Campaign
            </Typography>
            <Tooltip title="Refresh Server IPs">
              <IconButton onClick={fetchServerIps}>
                <Refresh />
              </IconButton>
            </Tooltip>
          </Box>

          <Stepper activeStep={activeStep} orientation="vertical">
            {steps.map((step, index) => (
              <Step key={step.label}>
                <StepLabel
                  StepIconComponent={() => step.icon}
                  optional={index === 0 && (
                    <Chip label="Required" size="small" color="primary" />
                  )}
                >
                  {step.label}
                </StepLabel>
                <StepContent>
                  {step.content}
                  <Box sx={{ mb: 2, mt: 2 }}>
                    <Button
                      variant="contained"
                      onClick={() => setActiveStep((prevActiveStep) => prevActiveStep + 1)}
                      sx={{ mr: 1 }}
                    >
                      {index === steps.length - 1 ? 'Finish' : 'Continue'}
                    </Button>
                    <Button
                      disabled={index === 0}
                      onClick={() => setActiveStep((prevActiveStep) => prevActiveStep - 1)}
                    >
                      Back
                    </Button>
                  </Box>
                </StepContent>
              </Step>
            ))}
          </Stepper>

          {activeStep === steps.length && (
            <Paper square elevation={0} sx={{ p: 3, bgcolor: 'grey.50' }}>
              <Typography variant="h6" gutterBottom>
                Campaign Ready
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                All steps completed. You can now send test emails or start the bulk campaign.
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<Send />}
                  onClick={handleTestMode}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={20} /> : 'Send Test Emails'}
                </Button>
                
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<PlayArrow />}
                  onClick={handleBulkMode}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={20} /> : 'Start Bulk Campaign'}
                </Button>
              </Box>
            </Paper>
          )}

          <Collapse in={alert.open}>
            <Alert
              severity={alert.severity}
              sx={{ mt: 2 }}
              onClose={() => setAlert({ ...alert, open: false })}
            >
              {alert.message}
            </Alert>
          </Collapse>

          {previewMode && (
            <Dialog
              open={previewMode}
              onClose={() => setPreviewMode(false)}
              maxWidth="md"
              fullWidth
            >
              <DialogTitle>Email Preview</DialogTitle>
              <DialogContent>
                <Box
                  dangerouslySetInnerHTML={{ __html: formData.emailTemplate }}
                  sx={{ border: '1px solid #ddd', p: 2, borderRadius: 1 }}
                />
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setPreviewMode(false)}>Close</Button>
              </DialogActions>
            </Dialog>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default EmailCampaignForm; 