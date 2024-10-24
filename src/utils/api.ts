import axios, { AxiosInstance, AxiosError } from "axios";

interface ApiParams {
  [key: string]: any;
}

interface ApiHeaders {
  [key: string]: string;
}

const createApiInstance = (customBaseUrl?: string): AxiosInstance => {
  return axios.create({
    baseURL: customBaseUrl || import.meta.env.VITE_APP_API_BASE_URL,
    headers: {
      "Content-Type": "application/json",
    },
  });
};

const handleApiError = (error: AxiosError, url: string): void => {
  if (error.response) {
    if (error.response.status === 401 || error.response.status === 403) {
      sessionStorage.clear();
      window.location.href = `/signin`;
    } else {
      console.error(`Error with ${url}:`, error.response.data);
    }
  } else {
    console.error("Error:", error.message);
  }
  throw error;
};

const getAuthHeaders = (): ApiHeaders => {
  const token = sessionStorage.getItem("authToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const apiGet = async (
  url: string,
  params: ApiParams = {},
  customBaseUrl?: string,
  additionalHeaders: ApiHeaders = {}
): Promise<any> => {
  const api = createApiInstance(customBaseUrl);
  const headers = { ...getAuthHeaders(), ...additionalHeaders };

  try {
    const response = await api.get(url, {
      headers,
      params,
    });
    console.log("🚀 ~ response:", response);
    return response;
  } catch (error) {
    handleApiError(error as AxiosError, url);
  }
};

export const apiPost = async (
  url: string,
  data: any,
  customBaseUrl?: string,
  additionalHeaders: ApiHeaders = {}
): Promise<any> => {
  const api = createApiInstance(customBaseUrl);
  const headers = { ...getAuthHeaders(), ...additionalHeaders };

  try {
    const response = await api.post(url, data, {
      headers,
    });
    return response;
  } catch (error) {
    handleApiError(error as AxiosError, url);
  }
};
