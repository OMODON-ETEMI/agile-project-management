import axios, { AxiosInstance } from "axios";

/**
 * Creates a configured Axios instance for the client.
 * This function is pure and does not use React hooks to avoid circular dependencies.
 * It accepts an optional onUnauthorized callback to handle 401 errors.
 */
export const createClientApi = (token: string | null, onUnauthorized?: () => void): AxiosInstance => {
  const client = axios.create({
    baseURL: "/api",
    withCredentials: true,
  });

  client.interceptors.request.use((config) => {
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response?.status === 401 && onUnauthorized) {
        onUnauthorized();
      }
      return Promise.reject(error);
    },
  );

  return client;
};