"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Bell, Mail, Smartphone, Volume2 } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import type { NotificationPreferences } from "@/lib/api/services/preferences";

interface NotificationsSectionProps {
  notifications: NotificationPreferences | undefined;
  onNotificationChange: (
    key: keyof NotificationPreferences,
    value: boolean,
  ) => void;
}

interface NotificationToggleProps {
  id: string;
  icon: React.ReactNode;
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

function NotificationToggle({
  id,
  icon,
  label,
  description,
  checked,
  onCheckedChange,
}: NotificationToggleProps) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
          {icon}
        </div>
        <div>
          <Label htmlFor={id} className="text-sm font-medium">
            {label}
          </Label>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

export function NotificationsSection({
  notifications,
  onNotificationChange,
}: NotificationsSectionProps) {
  const { t } = useTranslation();

  return (
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
        <NotificationToggle
          id="email-notifications"
          icon={<Mail className="h-5 w-5 text-primary" />}
          label={t("emailNotifications")}
          description={t("receiveEmailNotifications")}
          checked={notifications?.email ?? true}
          onCheckedChange={(checked) => onNotificationChange("email", checked)}
        />

        <Separator />

        <NotificationToggle
          id="push-notifications"
          icon={<Smartphone className="h-5 w-5 text-primary" />}
          label={t("pushNotifications")}
          description={t("receivePushNotifications")}
          checked={notifications?.push ?? true}
          onCheckedChange={(checked) => onNotificationChange("push", checked)}
        />

        <Separator />

        <NotificationToggle
          id="sound-notifications"
          icon={<Volume2 className="h-5 w-5 text-primary" />}
          label={t("soundNotifications")}
          description={t("playSoundForNotifications")}
          checked={notifications?.sound ?? true}
          onCheckedChange={(checked) => onNotificationChange("sound", checked)}
        />
      </CardContent>
    </Card>
  );
}
