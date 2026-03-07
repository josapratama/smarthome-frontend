"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Moon,
  Sun,
  Monitor,
  Globe,
  Bell,
  Mail,
  Volume2,
  Clock,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "@/contexts/theme-context";
import { useLanguage } from "@/contexts/language-context";
import {
  preferencesApi,
  UserPreferences,
  NotificationPreferences,
} from "@/lib/api/preferences";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

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
      // Silent fail - use local storage values
    } finally {
      setIsLoading(false);
    }
  };

  const handleThemeChange = async (newTheme: string) => {
    setTheme(newTheme as "light" | "dark" | "system");
    try {
      await preferencesApi.update({ theme: newTheme as any });
    } catch (error) {
      console.error("Failed to save theme preference:", error);
    }
  };

  const handleLanguageChange = async (newLanguage: string) => {
    setLanguage(newLanguage as any);
    try {
      await preferencesApi.update({ language: newLanguage });
    } catch (error) {
      console.error("Failed to save language preference:", error);
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

    setPreferences({
      ...preferences,
      notifications: updatedNotifications,
    });

    try {
      await preferencesApi.update({ notifications: updatedNotifications });
      toast.success(t("settingsSaved"));
    } catch (error) {
      toast.error(t("failedToSaveSettings"));
    }
  };

  const handleTimezoneChange = async (newTimezone: string) => {
    if (!preferences) return;

    setPreferences({ ...preferences, timezone: newTimezone });

    try {
      await preferencesApi.update({ timezone: newTimezone });
      toast.success(t("settingsSaved"));
    } catch (error) {
      toast.error(t("failedToSaveSettings"));
    }
  };

  const handleResetPreferences = async () => {
    if (!confirm(t("resetPreferencesConfirm"))) return;

    setIsSaving(true);
    try {
      await preferencesApi.reset();
      toast.success(t("settingsReset"));
      loadPreferences();
    } catch (error) {
      toast.error(t("failedToResetSettings"));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container max-w-4xl mx-auto p-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-[400px]" />
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-6">
      <div className="space-y-6">
        {/* Theme Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Moon className="h-5 w-5" />
              {t("theme")}
            </CardTitle>
            <CardDescription>{t("customizeAppearance")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={theme} onValueChange={handleThemeChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">
                  <div className="flex items-center gap-2">
                    <Sun className="h-4 w-4" />
                    {t("lightTheme")}
                  </div>
                </SelectItem>
                <SelectItem value="dark">
                  <div className="flex items-center gap-2">
                    <Moon className="h-4 w-4" />
                    {t("darkTheme")}
                  </div>
                </SelectItem>
                <SelectItem value="system">
                  <div className="flex items-center gap-2">
                    <Monitor className="h-4 w-4" />
                    {t("system")}
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Language Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              {t("language")}
            </CardTitle>
            <CardDescription>{t("languageDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={language} onValueChange={handleLanguageChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="id">🇮🇩 Bahasa Indonesia</SelectItem>
                <SelectItem value="en">🇬🇧 English</SelectItem>
                <SelectItem value="es">🇪🇸 Español</SelectItem>
                <SelectItem value="ja">🇯🇵 日本語</SelectItem>
                <SelectItem value="zh">🇨🇳 中文</SelectItem>
                <SelectItem value="ko">🇰🇷 한국어</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Notification Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              {t("notificationPreferences")}
            </CardTitle>
            <CardDescription>{t("manageNotificationSettings")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Label htmlFor="email-notifications" className="text-base">
                    {t("enableEmailNotifications")}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {t("receiveEmailNotifications")}
                  </p>
                </div>
              </div>
              <Switch
                id="email-notifications"
                checked={preferences?.notifications?.email ?? true}
                onCheckedChange={(checked) =>
                  handleNotificationChange("email", checked)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Label htmlFor="push-notifications" className="text-base">
                    {t("enablePushNotifications")}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {t("receivePushNotifications")}
                  </p>
                </div>
              </div>
              <Switch
                id="push-notifications"
                checked={preferences?.notifications?.push ?? true}
                onCheckedChange={(checked) =>
                  handleNotificationChange("push", checked)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Volume2 className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Label htmlFor="sound-notifications" className="text-base">
                    {t("enableSoundNotifications")}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {t("playSoundForNotifications")}
                  </p>
                </div>
              </div>
              <Switch
                id="sound-notifications"
                checked={preferences?.notifications?.sound ?? true}
                onCheckedChange={(checked) =>
                  handleNotificationChange("sound", checked)
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Timezone Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              {t("timezone")}
            </CardTitle>
            <CardDescription>{t("selectYourTimezone")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Select
              value={preferences?.timezone || "UTC"}
              onValueChange={handleTimezoneChange}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="UTC">UTC (GMT+0)</SelectItem>
                <SelectItem value="Asia/Jakarta">
                  Asia/Jakarta (GMT+7)
                </SelectItem>
                <SelectItem value="Asia/Tokyo">Asia/Tokyo (GMT+9)</SelectItem>
                <SelectItem value="Europe/London">
                  Europe/London (GMT+0)
                </SelectItem>
                <SelectItem value="America/New_York">
                  America/New York (GMT-5)
                </SelectItem>
                <SelectItem value="America/Los_Angeles">
                  America/Los Angeles (GMT-8)
                </SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Reset Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RotateCcw className="h-5 w-5" />
              {t("resetSettings")}
            </CardTitle>
            <CardDescription>{t("resetToDefaultSettings")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="destructive"
              onClick={handleResetPreferences}
              disabled={isSaving}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              {isSaving ? t("resetting") : t("resetToDefaults")}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
