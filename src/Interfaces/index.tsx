import { Auth, User, UserCredential } from "firebase/auth";
import { ReactNode } from "react";

export interface AuthProviderProps {
  children?: ReactNode;
}

export interface UserContextState {
  isAuthenticated: boolean;
  isLoading: boolean;
  id?: string;
}

export interface AuthContextModel {
  auth?: Auth;
  user: User | null;
  login: boolean;
  isAdmin: boolean;
  loading: boolean;
  setLogin: React.Dispatch<React.SetStateAction<boolean>>;
  logIn(email: string, password: string): Promise<void | UserCredential>;
  signUp(
    email: string,
    password: string,
    username: string
  ): Promise<UserCredential>;
  sendPasswordResetEmail?: (email: string) => Promise<void>;
  logOut(): Promise<void>;
  googleSignIn: () => Promise<UserCredential>;
  resetPassword(email: string): Promise<void>;
}

export interface IUserData {
  username: string;
  email: string;
  password: string;
  contact_number: string;
}

export interface Errors {
  emailError: string;
  passwordError: string;
  confirmPassError: string;
  nameError: string;
  contactError: string;
}

export interface ServerErrorResponse {
  code: number;
  message: string;
  errors: ServerError[];
}

export interface ServerError {
  message: string;
  domain: string;
  reason: string;
}

export type Mode = 'test' | 'bulk' | 'manual';

// Email Campaign Interfaces
export interface CreateCampaignDto {
  campaignId: string;
  from: string;
  fromName: string;
  subject: string;
  emailTemplate: string;
  templateType: 'html' | 'plain';
  offerId: string;
  selectedIp: string;
  to: string[];
  mode: Mode;
  batchSize?: number;
  delay?: number;
}

export interface Campaign {
  _id?: string;
  campaignId: string;
  from: string;
  fromName: string;
  subject: string;
  emailTemplate: string;
  templateType: 'html' | 'plain';
  offerId: string;
  selectedIp: string;
  status: 'pending' | 'running' | 'paused' | 'completed' | 'failed';
  mode: 'test' | 'bulk';
  batchSize?: number;
  delay?: number;
  jobId?: string;
  startedAt?: Date;
  completedAt?: Date;
  totalEmails?: number;
  sentEmails?: number;
  failedEmails?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CampaignStats {
  campaignId: string;
  status: string;
  counts: {
    sent: number;
    failed: number;
    pending: number;
    total: number;
  };
  campaign?: {
    from: string;
    fromName: string;
    subject: string;
    offerId: string;
    selectedIp: string;
    batchSize: number;
    delay: number;
    startedAt: Date;
    completedAt?: Date;
    totalEmails: number;
    sentEmails: number;
    failedEmails: number;
  };
}

export interface EmailTracking {
  _id?: string;
  campaignId: string;
  to_email: string;
  status: 'pending' | 'sent' | 'failed';
  sentAt?: Date;
  errorMessage?: string;
  isProcessed: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface EmailRecord {
  _id?: string;
  from: string;
  to: string;
  offerId: string;
  campaignId: string;
  sentAt: Date;
  response: string;
  mode: 'test' | 'bulk';
  createdAt?: Date;
}

export interface ServerIp {
  label: string;
  value: string;
  domain: string;
  ip: string;
}

export interface ApiResponse<T = unknown> {
  data: T;
  status: number;
  message?: string;
  success?: boolean;
}

export interface CampaignResponse {
  message: string;
  success: boolean;
  jobId?: string;
  sent?: string[];
  failed?: string[];
  emailSent?: number;
  emailFailed?: number;
}

export interface CampaignListResponse {
  campaigns: (Campaign & { stats: CampaignStats['counts'] })[];
}

export interface CleanupStatusResponse {
  campaignId: string;
  status: string;
  trackingDataCount: number;
  needsCleanup: boolean;
}
