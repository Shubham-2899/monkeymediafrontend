/**
 * Authentication Configuration
 * 
 * Centralized configuration for authentication behavior
 */

export const AUTH_CONFIG = {
  /**
   * Maximum session duration in hours
   * After this time, user will be automatically logged out regardless of activity
   * 
   * Recommended values:
   * - 8 hours: Standard business day
   * - 12 hours: Extended work session
   * - 24 hours: Full day access
   */
  MAX_SESSION_HOURS: 8,

  /**
   * Token refresh interval in minutes
   * Should be less than Firebase token expiry (60 minutes)
   * 
   * Recommended: 50 minutes (10 minutes before expiry)
   */
  TOKEN_REFRESH_MINUTES: 50,

  /**
   * Firebase ID token expiry time (fixed by Firebase)
   * Do not change this value
   */
  FIREBASE_TOKEN_EXPIRY_MINUTES: 60,
};

/**
 * Get maximum session duration in milliseconds
 */
export const getMaxSessionDuration = (): number => {
  return AUTH_CONFIG.MAX_SESSION_HOURS * 60 * 60 * 1000;
};

/**
 * Get token refresh interval in milliseconds
 */
export const getTokenRefreshInterval = (): number => {
  return AUTH_CONFIG.TOKEN_REFRESH_MINUTES * 60 * 1000;
};

/**
 * Check if session has expired
 */
export const isSessionExpired = (loginTimestamp: number): boolean => {
  const sessionDuration = Date.now() - loginTimestamp;
  return sessionDuration >= getMaxSessionDuration();
};

/**
 * Get remaining session time in minutes
 */
export const getRemainingSessionTime = (loginTimestamp: number): number => {
  const sessionDuration = Date.now() - loginTimestamp;
  const remainingMs = getMaxSessionDuration() - sessionDuration;
  return Math.max(0, Math.floor(remainingMs / (60 * 1000)));
};
