import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserSettings } from "../types";

interface SettingsState extends UserSettings {
  updateSettings: (settings: Partial<UserSettings>) => void;
  resetSettings: () => void;
}

const defaultSettings: UserSettings = {
  theme: "system",
  language: "id",
  notifications: {
    email: true,
    push: true,
    sms: false,
    alarmSeverities: ["HIGH", "CRITICAL"],
    deviceOffline: true,
    energyThreshold: true,
  },
  energyCostPerKwh: 1500,
  currency: "IDR",
  timezone: "Asia/Jakarta",
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...defaultSettings,
      updateSettings: (settings) => set((state) => ({ ...state, ...settings })),
      resetSettings: () => set(defaultSettings),
    }),
    {
      name: "settings-storage",
    },
  ),
);
