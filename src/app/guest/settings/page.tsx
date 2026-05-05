"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, Moon, Globe, Bell } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { useTheme } from "@/contexts/theme-context";
import { toast } from "sonner";

export default function GuestSettingsPage() {
  const { t, language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();

  const handleLanguageChange = (newLang: string) => {
    setLanguage(newLang as "en" | "id");
    toast.success(t("languageChanged"));
  };

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme as "light" | "dark" | "system");
    toast.success(t("themeChanged"));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t("settings")}</h1>
          <p className="text-muted-foreground mt-1">
            {t("manageYourPreferences")}
          </p>
        </div>
        <Badge variant="outline" className="gap-1">
          <Eye className="h-3 w-3" />
          {t("guest")}
        </Badge>
      </div>

      {/* Appearance Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Moon className="h-5 w-5" />
            {t("appearance")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>{t("theme")}</Label>
              <p className="text-sm text-muted-foreground">
                {t("selectThemePreference")}
              </p>
            </div>
            <Select value={theme} onValueChange={handleThemeChange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">{t("light")}</SelectItem>
                <SelectItem value="dark">{t("dark")}</SelectItem>
                <SelectItem value="system">{t("system")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Language Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            {t("language")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>{t("selectLanguage")}</Label>
              <p className="text-sm text-muted-foreground">
                {t("choosePreferredLanguage")}
              </p>
            </div>
            <Select value={language} onValueChange={handleLanguageChange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="id">English</SelectItem>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="jv">Basa Jawa</SelectItem>
                <SelectItem value="su">Basa Sunda</SelectItem>
                <SelectItem value="plm">Baso Palembang</SelectItem>
                <SelectItem value="es">Español</SelectItem>
                <SelectItem value="ja">日本語</SelectItem>
                <SelectItem value="zh">中文</SelectItem>
                <SelectItem value="zhPinyin">中文 (Pīnyīn)</SelectItem>
                <SelectItem value="ko">한국어</SelectItem>
                <SelectItem value="ar">العربية</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings (Read-only for guests) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            {t("notifications")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between opacity-50">
            <div className="space-y-0.5">
              <Label>{t("emailNotifications")}</Label>
              <p className="text-sm text-muted-foreground">
                {t("receiveEmailUpdates")}
              </p>
            </div>
            <Switch disabled />
          </div>
          <div className="flex items-center justify-between opacity-50">
            <div className="space-y-0.5">
              <Label>{t("pushNotifications")}</Label>
              <p className="text-sm text-muted-foreground">
                {t("receivePushUpdates")}
              </p>
            </div>
            <Switch disabled />
          </div>
          <p className="text-xs text-muted-foreground">
            {t("notificationSettingsReadOnly")}
          </p>
        </CardContent>
      </Card>

      {/* Guest Info */}
      <Card className="border-purple-200 bg-purple-50 dark:border-purple-900 dark:bg-purple-950">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Eye className="h-5 w-5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-purple-900 dark:text-purple-100">
                {t("limitedSettings")}
              </h3>
              <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
                {t("guestSettingsLimited")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
