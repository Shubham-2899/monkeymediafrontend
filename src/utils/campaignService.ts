import { apiGet, apiPost, apiPut } from './api';
import { 
  CreateCampaignDto, 
  Campaign, 
  CampaignStats, 
  CampaignResponse, 
  CleanupStatusResponse
} from '../Interfaces';

export class CampaignService {
  // Create a new campaign
  static async createCampaign(campaignData: CreateCampaignDto): Promise<CampaignResponse> {
    try {
      const response = await apiPost('/campaign/create', campaignData);
      return response.data;
    } catch (error) {
      console.error('Error creating campaign:', error);
      throw error;
    }
  }

  // Pause a running campaign
  static async pauseCampaign(campaignId: string): Promise<{ message: string; success: boolean }> {
    try {
      const response = await apiPut(`/campaign/${campaignId}/pause`, {});
      return response.data;
    } catch (error) {
      console.error('Error pausing campaign:', error);
      throw error;
    }
  }

  // Resume a paused campaign
  static async resumeCampaign(campaignData: CreateCampaignDto): Promise<CampaignResponse> {
    try {
      const response = await apiPut(`/campaign/${campaignData.campaignId}/resume`, campaignData);
      return response.data;
    } catch (error) {
      console.error('Error resuming campaign:', error);
      throw error;
    }
  }

  // Get campaign statistics
  static async getCampaignStats(campaignId: string): Promise<CampaignStats> {
    try {
      const response = await apiGet(`/campaign/stats/${campaignId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching campaign stats:', error);
      throw error;
    }
  }

  // Get all campaigns
  static async getAllCampaigns(): Promise<Campaign[]> {
    try {
      const response = await apiGet('/campaign/all');
      return response.data;
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      throw error;
    }
  }

  // Stop a job
  static async stopJob(jobId: string): Promise<{ message: string; success: boolean }> {
    try {
      const response = await apiPost('/campaign/stopjob', { jobId });
      return response.data;
    } catch (error) {
      console.error('Error stopping job:', error);
      throw error;
    }
  }

  // Cleanup campaign data
  static async cleanupCampaignData(campaignId: string): Promise<{ message: string; success: boolean; deletedCount: number }> {
    try {
      const response = await apiPost(`/campaign/${campaignId}/cleanup`, {});
      return response.data;
    } catch (error) {
      console.error('Error cleaning up campaign data:', error);
      throw error;
    }
  }

  // Get campaign cleanup status
  static async getCampaignCleanupStatus(campaignId: string): Promise<CleanupStatusResponse> {
    try {
      const response = await apiGet(`/campaign/${campaignId}/cleanup-status`);
      return response.data;
    } catch (error) {
      console.error('Error fetching cleanup status:', error);
      throw error;
    }
  }

  // Get available server IPs
  static async getAvailableIps(): Promise<{ domainIp: Record<string, string[]> }> {
    try {
      const response = await apiGet('/availableIps');
      return response.data;
    } catch (error) {
      console.error('Error fetching available IPs:', error);
      throw error;
    }
  }

  // Add emails to campaign
  static async addEmails(emails: string[]): Promise<{ message: string; success: boolean }> {
    try {
      const response = await apiPost('/email_list/add-emails', { emails });
      return response.data;
    } catch (error) {
      console.error('Error adding emails:', error);
      throw error;
    }
  }

  // Upload CSV file for emails
  static async uploadEmailsCsv(file: File, campaignId: string): Promise<{ message: string; success: boolean }> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('campaignId', campaignId);

      const response = await apiPost('/email_list/upload-emails', formData, undefined, {
        'Content-Type': 'multipart/form-data'
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading CSV:', error);
      throw error;
    }
  }
} 