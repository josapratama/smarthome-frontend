"use client";

import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/use-translation";
import { useTheme } from "@/contexts/theme-context";
import { useLanguage } from "@/contexts/language-context";
import {
  preferencesApi,
  type UserPreferences,
  type NotificationPreferences,
} from "@/lib/api/services/preferences";

import { AppearanceCard } from "./appearance-card";
import { LanguageCard } from "./language-card";
import { NotificationsCard } from "./notifications-card";
import { TimezoneCard } from "./timezone-card";
import { SecurityLinkCard } from "./security-link-card";

export function SettingsView() {
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage } = useLanguage();

  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    preferencesApi
      .get()
      .then(setPreferences)
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  async function savePreference(patch: Partial<UserPreferences>) {
    try {
      await preferencesApi.update(patch as any);
      toast.success(t("settingsSaved"));
    } catch {
      toast.error(t("failedToSaveSettings"));
    }
  }

  async function handleThemeChange(newTheme: string) {
    setTheme(newTheme as "light" | "dark" | "system");
    await savePreference({ theme: newTheme as any });
  }

  async function handleLanguageChange(newLang: string) {
    setLanguage(newLang as any);
    await savePreference({ language: newLang });
  }

  async function handleNotificationChange(
    key: keyof NotificationPreferences,
    value: boolean,
  ) {
    if (!preferences) return;
    const updated: NotificationPreferences = {
      email: preferences.notifications?.email ?? true,
      push: preferences.notifications?.push ?? true,
      sound: preferences.notifications?.sound ?? true,
      [key]: value,
    };
    setPreferences({ ...preferences, notifications: updated });
    await savePreference({ notifications: updated });
  }

  async function handleTimezoneChange(tz: string) {
    if (!preferences) return;
    setPreferences({ ...preferences, timezone: tz });
    await savePreference({ timezone: tz });
  }

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-[200px]" />
        ))}
      </div>
    );
  }

  const notifications: NotificationPreferences = {
    email: preferences?.notifications?.email ?? true,
    push: preferences?.notifications?.push ?? true,
    sound: preferences?.notifications?.sound ?? true,
  };

  return (
    <div className="space-y-4 p-4 pb-20">
      <AppearanceCard onSaved={() => savePreference({ theme: theme as any })} />
      <LanguageCard onSaved={() => savePreference({ language })} />
      <NotificationsCard
        notifications={notifications}
        onChange={handleNotificationChange}
      />
      <TimezoneCard
        timezone={preferences?.timezone ?? "UTC"}
        onChange={handleTimezoneChange}
      />
      <SecurityLinkCard />
    </div>
  );
}
