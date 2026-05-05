"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Eye, Activity, MapPin } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { PrivacyToggleItem } from "./privacy-toggle-item";
import type { PrivacySettings } from "@/lib/api/services/privacy";

interface ProfileVisibilitySectionProps {
  settings: PrivacySettings;
  onToggle: (key: keyof PrivacySettings, value: boolean) => void;
}

export function ProfileVisibilitySection({
  settings,
  onToggle,
}: ProfileVisibilitySectionProps) {
  const { t } = useTranslation();

  return (
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
        <PrivacyToggleItem
          id="show-online"
          icon={Activity}
          label={t("showOnlineStatus")}
          description={t("letOthersSeeOnline")}
          checked={settings.showOnlineStatus}
          onCheckedChange={(checked) => onToggle("showOnlineStatus", checked)}
        />

        <Separator />

        <PrivacyToggleItem
          id="show-location"
          icon={MapPin}
          label={t("showLocation")}
          description={t("shareLocationInfo")}
          checked={settings.showLocation}
          onCheckedChange={(checked) => onToggle("showLocation", checked)}
        />

        <Separator />

        <PrivacyToggleItem
          id="show-activity"
          icon={Activity}
          label={t("showActivity")}
          description={t("shareActivityStatus")}
          checked={settings.showActivity}
          onCheckedChange={(checked) => onToggle("showActivity", checked)}
        />
      </CardContent>
    </Card>
  );
}
