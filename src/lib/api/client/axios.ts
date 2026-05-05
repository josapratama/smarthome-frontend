import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from "axios";
import { config as appConfig } from "../../config";

const API_URL = appConfig.publicBackendUrl;

class ApiClient {
  private client: AxiosInstance;
  private accessToken: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: `${API_URL}/api`,
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true, // For refresh token cookie
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        if (this.accessToken && config.headers) {
          config.headers.Authorization = `Bearer ${this.accessToken}`;
        }
        return config;
      },
      (error: any) => Promise.reject(error),
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response: any) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
          _retry?: boolean;
        };

        // If 401 and not already retried, try to refresh token
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            // Refresh via Next.js route (tidak langsung ke backend)
            // Next.js route membaca httpOnly cookie dan meneruskan ke backend
            const refreshRes = await fetch("/api/auth/refresh", {
              method: "POST",
              credentials: "include",
            });

            if (!refreshRes.ok) {
              throw new Error("Refresh failed");
            }

            // Token baru sudah disimpan di cookie oleh Next.js route
            // Ambil token terbaru dari /api/auth/token
            const tokenRes = await fetch("/api/auth/token", {
              credentials: "include",
            });

            if (tokenRes.ok) {
              const { accessToken } = await tokenRes.json();
              if (accessToken) {
                this.setAccessToken(accessToken);
                if (originalRequest.headers) {
                  originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                }
                return this.client(originalRequest);
              }
            }

            throw new Error("Could not get new token");
          } catch (refreshError) {
            // Refresh failed, redirect to login
            this.clearAccessToken();
            if (typeof window !== "undefined") {
              window.location.href = "/login";
            }
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      },
    );
  }

  setAccessToken(token: string) {
    this.accessToken = token;
  }

  clearAccessToken() {
    this.accessToken = null;
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  getInstance(): AxiosInstance {
    return this.client;
  }
}

export const apiClient = new ApiClient();
export const api = apiClient.getInstance();
