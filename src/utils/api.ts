import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from "axios";
import { getIdToken } from "../../firebase";
import { isSessionExpired } from "../config/auth.config";

interface ApiParams {
  [key: string]: string | number | boolean | null | undefined;
}

interface ApiHeaders {
  [key: string]: string;
}

// Create a single axios instance with interceptors
const createApiInstance = (customBaseUrl?: string): AxiosInstance => {
  const api = axios.create({
    baseURL: customBaseUrl || import.meta.env.VITE_APP_API_BASE_URL,
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Request interceptor to add fresh token to every request
  api.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      // Check if absolute session timeout has been reached
      const loginTimestamp = parseInt(sessionStorage.getItem("loginTime") || "0");
      if (loginTimestamp && isSessionExpired(loginTimestamp)) {
        console.log("Session expired - logging out");
        sessionStorage.clear();
        window.location.href = "/signin?reason=session_expired";
        return Promise.reject(new Error("Session expired"));
      }
      
      const token = sessionStorage.getItem("authToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor to handle token expiry
  api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

      // If 401 Unauthorized, redirect to login
      if (error.response?.status === 401) {
        console.error("Unauthorized - redirecting to login");
        sessionStorage.clear();
        window.location.href = `/signin`;
        return Promise.reject(error);
      }

      // If 403 Forbidden and haven't retried yet, refresh token and retry
      if (error.response?.status === 403 && !originalRequest._retry) {
        originalRequest._retry = true;
        
        try {
          console.log("Token expired - refreshing...");
          const newToken = await getIdToken(true);
          
          if (newToken) {
            // Update the failed request with new token
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            // Retry the original request
            return api(originalRequest);
          } else {
            throw new Error("Failed to refresh token");
          }
        } catch (tokenError) {
          console.error("Error refreshing token:", tokenError);
          sessionStorage.clear();
          window.location.href = `/signin`;
          return Promise.reject(tokenError);
        }
      }

      // For other errors, just log and reject
      if (error.response) {
        console.error(`API Error:`, error.response.data);
      } else {
        console.error("Network Error:", error.message);
      }
      
      return Promise.reject(error);
    }
  );

  return api;
};

// Create a singleton instance
const api = createApiInstance();

const handleApiError = (error: AxiosError, url: string): void => {
  if (error.response) {
    console.error(`Error with ${url}:`, error.response.data);
  } else {
    console.error("Error:", error.message);
  }
  throw error;
};

export const apiGet = async (
  url: string,
  params: ApiParams = {},
  customBaseUrl?: string,
  additionalHeaders: ApiHeaders = {}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> => {
  const apiInstance = customBaseUrl ? createApiInstance(customBaseUrl) : api;

  try {
    const response = await apiInstance.get(url, {
      headers: additionalHeaders,
      params,
    });
    // console.log("🚀 ~ response:", response);
    return response;
  } catch (error) {
    handleApiError(error as AxiosError, url);
  }
};

export const apiPost = async (
  url: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any,
  customBaseUrl?: string,
  additionalHeaders: ApiHeaders = {}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> => {
  const apiInstance = customBaseUrl ? createApiInstance(customBaseUrl) : api;

  try {
    const response = await apiInstance.post(url, data, {
      headers: additionalHeaders,
    });
    return response;
  } catch (error) {
    handleApiError(error as AxiosError, url);
  }
};


export const apiPut = async (
  url: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any,
  customBaseUrl?: string,
  additionalHeaders: ApiHeaders = {}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> => {
  const apiInstance = customBaseUrl ? createApiInstance(customBaseUrl) : api;

  try {
    const response = await apiInstance.put(url, data, {
      headers: additionalHeaders,
    });
    return response;
  } catch (error) {
    handleApiError(error as AxiosError, url);
  }
};

export const apiDelete = async (
  url: string,
  customBaseUrl?: string,
  additionalHeaders: ApiHeaders = {}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> => {
  const apiInstance = customBaseUrl ? createApiInstance(customBaseUrl) : api;

  try {
    const response = await apiInstance.delete(url, { 
      headers: additionalHeaders 
    });
    return response;
  } catch (error) {
    handleApiError(error as AxiosError, url);
  }
};


export const apiPatch = async (
  url: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any,
  customBaseUrl?: string,
  additionalHeaders: ApiHeaders = {}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> => {
  const apiInstance = customBaseUrl ? createApiInstance(customBaseUrl) : api;

  try {
    const response = await apiInstance.patch(url, data, { 
      headers: additionalHeaders 
    });
    return response;
  } catch (error) {
    handleApiError(error as AxiosError, url);
  }
};
