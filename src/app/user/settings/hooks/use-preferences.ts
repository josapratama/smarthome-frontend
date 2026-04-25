"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/use-translation";
import {
  preferencesApi,
  type UserPreferences,
  type NotificationPreferences,
} from "@/lib/api/services/preferences";

export function usePreferences() {
  const { t } = useTranslation();
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    setIsLoading(true);
    try {
      const data = await preferencesApi.get();
      setPreferences(data);
    } catch (error) {
      console.error("Failed to load preferences:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationChange = async (
    key: keyof NotificationPreferences,
    value: boolean,
  ) => {
    if (!preferences) return;

    const updatedNotifications: NotificationPreferences = {
      email: preferences.notifications?.email ?? true,
      push: preferences.notifications?.push ?? true,
      sound: preferences.notifications?.sound ?? true,
      [key]: value,
    };

    // Optimistic update
    setPreferences({ ...preferences, notifications: updatedNotifications });

    try {
      await preferencesApi.update({ notifications: updatedNotifications });
      toast.success(t("settingsSaved"));
    } catch (error) {
      toast.error(t("failedToSaveSettings"));
      // Revert on error
      setPreferences(preferences);
    }
  };

  const handleTimezoneChange = async (newTimezone: string) => {
    if (!preferences) return;

    const previous = preferences;
    setPreferences({ ...preferences, timezone: newTimezone });

    try {
      await preferencesApi.update({ timezone: newTimezone });
      toast.success(t("settingsSaved"));
    } catch (error) {
      toast.error(t("failedToSaveSettings"));
      setPreferences(previous);
    }
  };

  return {
    preferences,
    isLoading,
    handleNotificationChange,
    handleTimezoneChange,
  };
}
