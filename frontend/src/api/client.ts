// =============================================================================
// Guttenberg API Client
// Axios instance configured for the Django REST Framework backend.
// Handles Bearer token authentication and automatic JWT refresh on 401.
// =============================================================================

import axios, {
  AxiosError,
  InternalAxiosRequestConfig,
} from 'axios';

const BASE_URL =
  process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

const client = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// ---------------------------------------------------------------------------
// Request interceptor -- attach access token
// ---------------------------------------------------------------------------

client.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ---------------------------------------------------------------------------
// Response interceptor -- automatic token refresh on 401
// ---------------------------------------------------------------------------

/** Prevents multiple concurrent refresh requests. */
let isRefreshing = false;

/** Queue of requests that arrived while a refresh was in-flight. */
let failedQueue: {
  resolve: (token: string) => void;
  reject: (error: any) => void;
}[] = [];

/**
 * Replay every queued request once a new access token is available,
 * or reject them all if the refresh itself failed.
 */
function processQueue(error: any, token: string | null = null): void {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token!);
    }
  });
  failedQueue = [];
}

client.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Only attempt refresh on 401 responses that have not already been retried.
    // Skip refresh for the refresh endpoint itself to avoid infinite loops.
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/refresh/')
    ) {
      if (isRefreshing) {
        // Another refresh is in progress -- queue this request.
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return client(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refresh_token');

      if (!refreshToken) {
        // No refresh token available -- force re-login.
        processQueue(error, null);
        isRefreshing = false;
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post<{ access: string }>(
          `${BASE_URL}/auth/refresh/`,
          { refresh: refreshToken },
        );

        const newAccessToken = data.access;
        localStorage.setItem('access_token', newAccessToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }

        processQueue(null, newAccessToken);
        return client(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default client;
