"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Shield, Globe, Activity } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { PrivacyToggleItem } from "./privacy-toggle-item";
import type { PrivacySettings } from "@/lib/api/services/privacy";

interface DataPrivacySectionProps {
  settings: PrivacySettings;
  onToggle: (key: keyof PrivacySettings, value: boolean) => void;
}

export function DataPrivacySection({
  settings,
  onToggle,
}: DataPrivacySectionProps) {
  const { t } = useTranslation();

  return (
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
        <PrivacyToggleItem
          id="data-collection"
          icon={Globe}
          label={t("dataCollection")}
          description={t("allowDataCollection")}
          checked={settings.dataCollection}
          onCheckedChange={(checked) => onToggle("dataCollection", checked)}
        />

        <Separator />

        <PrivacyToggleItem
          id="analytics"
          icon={Activity}
          label={t("analyticsTracking")}
          description={t("allowAnalyticsTracking")}
          checked={settings.analyticsTracking}
          onCheckedChange={(checked) => onToggle("analyticsTracking", checked)}
        />
      </CardContent>
    </Card>
  );
}
