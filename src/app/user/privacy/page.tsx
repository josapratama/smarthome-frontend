"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Eye,
  Users,
  Shield,
  Lock,
  Activity,
  MapPin,
  UserCheck,
  Globe,
  Download,
  Trash2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/language-context";
import {
  getPrivacySettings,
  updatePrivacySettings,
  downloadUserData,
  deleteUserData,
  type PrivacySettings,
} from "@/lib/api/privacy";

export default function PrivacyPage() {
  const { t } = useLanguage();
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
  const [isSaving, setIsSaving] = useState(false);

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
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = async (key: keyof PrivacySettings, value: boolean) => {
    const updatedSettings = { ...settings, [key]: value };
    setSettings(updatedSettings);

    try {
      await updatePrivacySettings({ [key]: value });
      toast.success(t("settingsSaved"));
    } catch (error) {
      toast.error(t("failedToSaveSettings"));
      // Revert on error
      setSettings(settings);
    }
  };

  const handleDownloadData = async () => {
    setIsSaving(true);
    try {
      const data = await downloadUserData();
      // Convert to JSON and download
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `my-data-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success(t("dataDownloaded"));
    } catch (error) {
      toast.error(t("failedToDownloadData"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteData = async () => {
    if (!confirm(t("deleteDataConfirm"))) return;

    setIsSaving(true);
    try {
      await deleteUserData();
      toast.success(t("dataDeleted"));
      // Redirect to login after a delay
      setTimeout(() => {
        window.location.href = "/auth/login";
      }, 2000);
    } catch (error) {
      toast.error(t("failedToDeleteData"));
    } finally {
      setIsSaving(false);
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
      {/* Profile Visibility */}
      <Card className="rounded-2xl shadow-sm border-0 bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" />
            {t("profileVisibility")}
          </CardTitle>
          <CardDescription className="text-sm">
            {t("controlWhoCanSeeProfile")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Activity className="h-5 w-5 text-primary" />
              </div>
              <div>
                <Label htmlFor="show-online" className="text-sm font-medium">
                  {t("showOnlineStatus")}
                </Label>
                <p className="text-xs text-muted-foreground">
                  {t("letOthersSeeOnline")}
                </p>
              </div>
            </div>
            <Switch
              id="show-online"
              checked={settings.showOnlineStatus}
              onCheckedChange={(checked) =>
                handleToggle("showOnlineStatus", checked)
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <div>
                <Label htmlFor="show-location" className="text-sm font-medium">
                  {t("showLocation")}
                </Label>
                <p className="text-xs text-muted-foreground">
                  {t("shareLocationInfo")}
                </p>
              </div>
            </div>
            <Switch
              id="show-location"
              checked={settings.showLocation}
              onCheckedChange={(checked) =>
                handleToggle("showLocation", checked)
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Activity className="h-5 w-5 text-primary" />
              </div>
              <div>
                <Label htmlFor="show-activity" className="text-sm font-medium">
                  {t("showActivity")}
                </Label>
                <p className="text-xs text-muted-foreground">
                  {t("shareActivityStatus")}
                </p>
              </div>
            </div>
            <Switch
              id="show-activity"
              checked={settings.showActivity}
              onCheckedChange={(checked) =>
                handleToggle("showActivity", checked)
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Communication Preferences */}
      <Card className="rounded-2xl shadow-sm border-0 bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            {t("communicationPreferences")}
          </CardTitle>
          <CardDescription className="text-sm">
            {t("controlWhoCanContact")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <UserCheck className="h-5 w-5 text-primary" />
              </div>
              <div>
                <Label
                  htmlFor="friend-requests"
                  className="text-sm font-medium"
                >
                  {t("allowFriendRequests")}
                </Label>
                <p className="text-xs text-muted-foreground">
                  {t("receiveFriendRequests")}
                </p>
              </div>
            </div>
            <Switch
              id="friend-requests"
              checked={settings.allowFriendRequests}
              onCheckedChange={(checked) =>
                handleToggle("allowFriendRequests", checked)
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <Label htmlFor="allow-messages" className="text-sm font-medium">
                  {t("allowMessages")}
                </Label>
                <p className="text-xs text-muted-foreground">
                  {t("receiveDirectMessages")}
                </p>
              </div>
            </div>
            <Switch
              id="allow-messages"
              checked={settings.allowMessages}
              onCheckedChange={(checked) =>
                handleToggle("allowMessages", checked)
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Data & Privacy */}
      <Card className="rounded-2xl shadow-sm border-0 bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            {t("dataPrivacy")}
          </CardTitle>
          <CardDescription className="text-sm">
            {t("manageDataCollection")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Globe className="h-5 w-5 text-primary" />
              </div>
              <div>
                <Label
                  htmlFor="data-collection"
                  className="text-sm font-medium"
                >
                  {t("dataCollection")}
                </Label>
                <p className="text-xs text-muted-foreground">
                  {t("allowDataCollection")}
                </p>
              </div>
            </div>
            <Switch
              id="data-collection"
              checked={settings.dataCollection}
              onCheckedChange={(checked) =>
                handleToggle("dataCollection", checked)
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Activity className="h-5 w-5 text-primary" />
              </div>
              <div>
                <Label htmlFor="analytics" className="text-sm font-medium">
                  {t("analyticsTracking")}
                </Label>
                <p className="text-xs text-muted-foreground">
                  {t("allowAnalyticsTracking")}
                </p>
              </div>
            </div>
            <Switch
              id="analytics"
              checked={settings.analyticsTracking}
              onCheckedChange={(checked) =>
                handleToggle("analyticsTracking", checked)
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card className="rounded-2xl shadow-sm border-0 bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            {t("dataManagement")}
          </CardTitle>
          <CardDescription className="text-sm">
            {t("manageYourData")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={handleDownloadData}
            disabled={isSaving}
          >
            <Download className="h-4 w-4 mr-2" />
            {t("downloadMyData")}
          </Button>

          <div className="p-3 bg-muted/50 rounded-xl">
            <div className="flex gap-2 text-xs text-muted-foreground">
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <p>{t("downloadDataInfo")}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="rounded-2xl shadow-sm border-0 bg-card border-destructive/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium flex items-center gap-2 text-destructive">
            <Trash2 className="h-5 w-5" />
            {t("dangerZone")}
          </CardTitle>
          <CardDescription className="text-sm">
            {t("irreversibleActions")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            variant="destructive"
            className="w-full justify-start"
            onClick={handleDeleteData}
            disabled={isSaving}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {isSaving ? t("deleting") : t("deleteAllMyData")}
          </Button>

          <div className="p-3 bg-destructive/10 rounded-xl">
            <div className="flex gap-2 text-xs text-destructive">
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <p>{t("deleteDataWarning")}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
