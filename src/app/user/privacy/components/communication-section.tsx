"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Users, UserCheck } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { PrivacyToggleItem } from "./privacy-toggle-item";
import type { PrivacySettings } from "@/lib/api/services/privacy";

interface CommunicationSectionProps {
  settings: PrivacySettings;
  onToggle: (key: keyof PrivacySettings, value: boolean) => void;
}

export function CommunicationSection({
  settings,
  onToggle,
}: CommunicationSectionProps) {
  const { t } = useTranslation();

  return (
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
        <PrivacyToggleItem
          id="friend-requests"
          icon={UserCheck}
          label={t("allowFriendRequests")}
          description={t("receiveFriendRequests")}
          checked={settings.allowFriendRequests}
          onCheckedChange={(checked) =>
            onToggle("allowFriendRequests", checked)
          }
        />

        <Separator />

        <PrivacyToggleItem
          id="allow-messages"
          icon={Users}
          label={t("allowMessages")}
          description={t("receiveDirectMessages")}
          checked={settings.allowMessages}
          onCheckedChange={(checked) => onToggle("allowMessages", checked)}
        />
      </CardContent>
    </Card>
  );
}
