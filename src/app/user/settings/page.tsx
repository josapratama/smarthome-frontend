"use client";

import { useState, useEffect } from "react";
import { usePreferences } from "@/hooks/use-preferences";
import { useTranslation } from "@/hooks/use-translation";
import { useTheme } from "@/contexts/theme-context";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Info } from "lucide-react";

const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "id", name: "Bahasa Indonesia" },
  { code: "es", name: "Español" },
];

type Theme = "light" | "dark" | "system";

export default function UserSettingsPage() {
  const { preferences, isLoading, updatePreferences, isUpdating } =
    usePreferences();
  const { t } = useTranslation();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();

  const [localPrefs, setLocalPrefs] = useState<{
    theme: Theme;
    language: string;
    timezone: string;
    notifications: {
      email: boolean;
      push: boolean;
      sound: boolean;
    };
  }>({
    theme: "system",
    language: "en",
    timezone: "UTC",
    notifications: {
      email: true,
      push: true,
      sound: true,
    },
  });

  useEffect(() => {
    if (preferences) {
      setLocalPrefs({
        theme: (preferences.theme as Theme) || "system",
        language: preferences.language || "en",
        timezone: preferences.timezone || "UTC",
        notifications: {
          email: preferences.notifications?.email ?? true,
          push: preferences.notifications?.push ?? true,
          sound: preferences.notifications?.sound ?? true,
        },
      });
    }
  }, [preferences]);

  const handleThemeChange = (newTheme: Theme) => {
    setLocalPrefs((p) => ({ ...p, theme: newTheme }));
    setTheme(newTheme);
  };

  const handleSave = () => {
    console.log("Saving preferences:", localPrefs);
    updatePreferences(localPrefs);

    // Show toast immediately (optimistic)
    toast({
      title: t("settingsSaved"),
      description: t("settingsSavedDesc"),
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">{t("settings")}</h1>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t("settings")}</h1>
        <p className="text-muted-foreground mt-2">
          {t("manageYourPreferences")}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("appearance")}</CardTitle>
          <CardDescription>{t("customizeAppearance")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="theme">{t("theme")}</Label>
            <Select value={localPrefs.theme} onValueChange={handleThemeChange}>
              <SelectTrigger id="theme">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">{t("light")}</SelectItem>
                <SelectItem value="dark">{t("dark")}</SelectItem>
                <SelectItem value="system">{t("system")}</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              {t("themeDescription")}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("languageRegion")}</CardTitle>
          <CardDescription>{t("languageDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="language">{t("language")}</Label>
            <Select
              value={localPrefs.language}
              onValueChange={(v) =>
                setLocalPrefs((p) => ({ ...p, language: v }))
              }
            >
              <SelectTrigger id="language">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("appInfo")}</CardTitle>
          <CardDescription>{t("appInfoDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b">
            <span className="text-sm font-medium">{t("version")}</span>
            <span className="text-sm text-muted-foreground">1.0.0</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b">
            <span className="text-sm font-medium">{t("buildDate")}</span>
            <span className="text-sm text-muted-foreground">
              {new Date().toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg mt-4">
            <Info className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">{t("appInfoNote")}</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button onClick={handleSave} disabled={isUpdating}>
          {isUpdating ? t("saving") : t("saveChanges")}
        </Button>
      </div>
    </div>
  );
}
