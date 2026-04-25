"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/use-translation";
import {
  getPrivacySettings,
  updatePrivacySettings,
  type PrivacySettings,
} from "@/lib/api/services/privacy";

export function usePrivacySettings() {
  const { t } = useTranslation();
  const [settings, setSettings] = useState<PrivacySettings>({
    profileVisibility: "FRIENDS",
    showOnlineStatus: true,
    showLocation: false,
    showActivity: true,
    allowFriendRequests: true,
    allowMessages: true,
    dataCollection: true,
    analyticsTracking: true,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPrivacySettings();
  }, []);

  const loadPrivacySettings = async () => {
    setIsLoading(true);
    try {
      const data = await getPrivacySettings();
      setSettings(data);
    } catch (error) {
      console.error("Failed to load privacy settings:", error);
      toast.error(t("failedToLoadSettings"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = async (key: keyof PrivacySettings, value: boolean) => {
    const previousSettings = { ...settings };
    const updatedSettings = { ...settings, [key]: value };

    // Optimistic update
    setSettings(updatedSettings);

    try {
      await updatePrivacySettings({ [key]: value });
      toast.success(t("settingsSaved"));
    } catch (error) {
      toast.error(t("failedToSaveSettings"));
      // Revert on error
      setSettings(previousSettings);
    }
  };

  return {
    settings,
    isLoading,
    handleToggle,
    refetch: loadPrivacySettings,
  };
}
