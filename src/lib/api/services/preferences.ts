import { apiFetchBrowser } from "../client/fetch";

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
  get: async (): Promise<UserPreferences> => {
    const res = await apiFetchBrowser<{ data: UserPreferences }>(
      "/api/v1/preferences",
    );
    return res.data;
  },

  update: async (
    preferences: Partial<UserPreferences>,
  ): Promise<UserPreferences> => {
    const res = await apiFetchBrowser<{ data: UserPreferences }>(
      "/api/v1/preferences",
      { method: "PATCH", body: JSON.stringify(preferences) },
    );
    return res.data;
  },

  replace: async (preferences: UserPreferences): Promise<UserPreferences> => {
    const res = await apiFetchBrowser<{ data: UserPreferences }>(
      "/api/v1/preferences",
      { method: "PUT", body: JSON.stringify(preferences) },
    );
    return res.data;
  },

  reset: async (): Promise<void> => {
    await apiFetchBrowser("/api/v1/preferences/reset", { method: "POST" });
  },
};
