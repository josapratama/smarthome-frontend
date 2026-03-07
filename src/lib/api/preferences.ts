import { api } from "./client";

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sound: boolean;
}

export interface UserPreferences {
  theme?: "light" | "dark" | "system";
  language?: string;
  notifications?: NotificationPreferences;
  timezone?: string;
}

export const preferencesApi = {
  get: async () => {
    const res = await api.get<{ data: UserPreferences }>("/v1/preferences");
    return res.data.data;
  },

  update: async (preferences: Partial<UserPreferences>) => {
    const res = await api.patch<{ data: UserPreferences; message: string }>(
      "/v1/preferences",
      preferences,
    );
    return res.data;
  },

  replace: async (preferences: UserPreferences) => {
    const res = await api.put<{ data: UserPreferences; message: string }>(
      "/v1/preferences",
      preferences,
    );
    return res.data;
  },

  reset: async () => {
    const res = await api.post<{ message: string }>(
      "/v1/preferences/reset",
      {},
    );
    return res.data;
  },
};
