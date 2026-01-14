import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// Create axios instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Enable cookies
});

// Flag to prevent multiple redirects
let isRedirectingToLogin = false;

// Function to reset redirect flag (call this on successful login)
export const resetRedirectFlag = () => {
  isRedirectingToLogin = false;
};

// Response interceptor - Handle token refresh
apiClient.interceptors.response.use(
  (response: any) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Skip token refresh only for login/register/refresh/logout endpoints
    const authSkipPaths = [
      "/auth/login",
      "/auth/register",
      "/auth/refresh",
      "/auth/logout",
    ];
    const shouldSkipRefresh = authSkipPaths.some((path) =>
      originalRequest.url?.includes(path)
    );

    // If error is 401, not an auth endpoint, and we haven't retried yet
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !shouldSkipRefresh
    ) {
      originalRequest._retry = true;

      try {
        // Try to refresh token via cookies
        await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        // Retry original request
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed - redirect to login (only once)
        if (!isRedirectingToLogin && window.location.pathname !== "/login") {
          isRedirectingToLogin = true;
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
