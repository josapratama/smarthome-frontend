import { api, apiClient } from "../client/axios";
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  User,
} from "../../types";

export const authApi = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>("/auth/login", credentials);

    // Check if user is NOT ADMIN (frontend is for regular users only)
    if (data.user.role === "ADMIN") {
      throw new Error("Please use Admin Dashboard to login as administrator.");
    }

    apiClient.setAccessToken(data.accessToken);
    return data;
  },

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>("/auth/register", userData);

    // Check if user is NOT ADMIN
    if (data.user.role === "ADMIN") {
      throw new Error(
        "Admin accounts cannot be created through user registration.",
      );
    }

    apiClient.setAccessToken(data.accessToken);
    return data;
  },

  async logout(): Promise<void> {
    try {
      await api.post("/auth/logout");
    } finally {
      apiClient.clearAccessToken();
    }
  },

  async refreshToken(): Promise<{ accessToken: string }> {
    const { data } = await api.post("/auth/refresh");
    apiClient.setAccessToken(data.accessToken);
    return data;
  },

  async getCurrentUser(): Promise<User> {
    const { data } = await api.get<User>("/auth/me");

    // Double check user role
    if (data.role === "ADMIN") {
      throw new Error("Admin users should use Admin Dashboard.");
    }

    return data;
  },

  async changePassword(
    oldPassword: string,
    newPassword: string,
  ): Promise<void> {
    await api.post("/auth/change-password", { oldPassword, newPassword });
  },

  async forgotPassword(email: string): Promise<void> {
    await api.post("/auth/forgot-password", { email });
  },

  async resetPassword(token: string, newPassword: string): Promise<void> {
    await api.post("/auth/reset-password", { token, newPassword });
  },
};
