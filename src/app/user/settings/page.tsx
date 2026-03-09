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
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Moon,
  Sun,
  Monitor,
  Globe,
  Bell,
  Mail,
  Volume2,
  Clock,
  ChevronRight,
  Smartphone,
  Lock,
  Eye,
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

  const handleThemeChange = async (newTheme: string) => {
    setTheme(newTheme as "light" | "dark" | "system");
    try {
      await preferencesApi.update({ theme: newTheme as any });
      toast.success(t("settingsSaved"));
    } catch (error) {
      console.error("Failed to save theme preference:", error);
    }
  };

  const handleLanguageChange = async (newLanguage: string) => {
    setLanguage(newLanguage as any);
    try {
      await preferencesApi.update({ language: newLanguage });
      toast.success(t("settingsSaved"));
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

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-[200px]" />
        <Skeleton className="h-[200px]" />
        <Skeleton className="h-[200px]" />
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 pb-20">
      {/* Appearance Section */}
      <Card className="rounded-2xl shadow-sm border-0 bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Moon className="h-5 w-5 text-primary" />
            {t("theme")}
          </CardTitle>
          <CardDescription className="text-sm">
            {t("customizeAppearance")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Select value={theme} onValueChange={handleThemeChange}>
            <SelectTrigger className="h-12 rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">
                <div className="flex items-center gap-3 py-1">
                  <Sun className="h-5 w-5" />
                  <span>{t("lightTheme")}</span>
                </div>
              </SelectItem>
              <SelectItem value="dark">
                <div className="flex items-center gap-3 py-1">
                  <Moon className="h-5 w-5" />
                  <span>{t("darkTheme")}</span>
                </div>
              </SelectItem>
              <SelectItem value="system">
                <div className="flex items-center gap-3 py-1">
                  <Monitor className="h-5 w-5" />
                  <span>{t("system")}</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Language Section */}
      <Card className="rounded-2xl shadow-sm border-0 bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            {t("language")}
          </CardTitle>
          <CardDescription className="text-sm">
            {t("languageDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Select value={language} onValueChange={handleLanguageChange}>
            <SelectTrigger className="h-12 rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="id">
                <div className="flex items-center gap-3 py-1">
                  <span className="text-xl">🇮🇩</span>
                  <span>Bahasa Indonesia</span>
                </div>
              </SelectItem>
              <SelectItem value="en">
                <div className="flex items-center gap-3 py-1">
                  <span className="text-xl">🇬🇧</span>
                  <span>English</span>
                </div>
              </SelectItem>
              <SelectItem value="jv">
                <div className="flex items-center gap-3 py-1">
                  <span className="text-xl">🇮🇩</span>
                  <span>Basa Jawa</span>
                </div>
              </SelectItem>
              <SelectItem value="su">
                <div className="flex items-center gap-3 py-1">
                  <span className="text-xl">🇮🇩</span>
                  <span>Basa Sunda</span>
                </div>
              </SelectItem>
              <SelectItem value="plm">
                <div className="flex items-center gap-3 py-1">
                  <span className="text-xl">🇮🇩</span>
                  <span>Baso Palembang</span>
                </div>
              </SelectItem>
              <SelectItem value="es">
                <div className="flex items-center gap-3 py-1">
                  <span className="text-xl">🇪🇸</span>
                  <span>Español</span>
                </div>
              </SelectItem>
              <SelectItem value="ja">
                <div className="flex items-center gap-3 py-1">
                  <span className="text-xl">🇯🇵</span>
                  <span>日本語</span>
                </div>
              </SelectItem>
              <SelectItem value="zh">
                <div className="flex items-center gap-3 py-1">
                  <span className="text-xl">🇨🇳</span>
                  <span>中文</span>
                </div>
              </SelectItem>
              <SelectItem value="zhPinyin">
                <div className="flex items-center gap-3 py-1">
                  <span className="text-xl">🇨🇳</span>
                  <span>中文 (Pīnyīn)</span>
                </div>
              </SelectItem>
              <SelectItem value="ko">
                <div className="flex items-center gap-3 py-1">
                  <span className="text-xl">🇰🇷</span>
                  <span>한국어</span>
                </div>
              </SelectItem>
              <SelectItem value="ar">
                <div className="flex items-center gap-3 py-1">
                  <span className="text-xl">🇸🇦</span>
                  <span>العربية</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Notifications Section */}
      <Card className="rounded-2xl shadow-sm border-0 bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            {t("notificationPreferences")}
          </CardTitle>
          <CardDescription className="text-sm">
            {t("manageNotificationSettings")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div>
                <Label
                  htmlFor="email-notifications"
                  className="text-sm font-medium"
                >
                  {t("emailNotifications")}
                </Label>
                <p className="text-xs text-muted-foreground">
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

          <Separator />

          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Smartphone className="h-5 w-5 text-primary" />
              </div>
              <div>
                <Label
                  htmlFor="push-notifications"
                  className="text-sm font-medium"
                >
                  {t("pushNotifications")}
                </Label>
                <p className="text-xs text-muted-foreground">
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

          <Separator />

          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Volume2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <Label
                  htmlFor="sound-notifications"
                  className="text-sm font-medium"
                >
                  {t("soundNotifications")}
                </Label>
                <p className="text-xs text-muted-foreground">
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

      {/* Timezone Section */}
      <Card className="rounded-2xl shadow-sm border-0 bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            {t("timezone")}
          </CardTitle>
          <CardDescription className="text-sm">
            {t("selectYourTimezone")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Select
            value={preferences?.timezone || "UTC"}
            onValueChange={handleTimezoneChange}
          >
            <SelectTrigger className="h-12 rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="UTC">UTC (GMT+0)</SelectItem>
              <SelectItem value="Asia/Jakarta">Asia/Jakarta (GMT+7)</SelectItem>
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

      {/* Privacy & Security Section */}
      <Card className="rounded-2xl shadow-sm border-0 bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            {t("privacySecurity")}
          </CardTitle>
          <CardDescription className="text-sm">
            {t("managePrivacyAndSecurity")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <a
            href="/user/privacy"
            className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Eye className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{t("privacySettings")}</p>
                <p className="text-xs text-muted-foreground">
                  {t("controlDataAndPrivacy")}
                </p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </a>
        </CardContent>
      </Card>
    </div>
  );
}
