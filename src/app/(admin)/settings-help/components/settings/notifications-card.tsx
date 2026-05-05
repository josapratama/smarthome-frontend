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

interface NotificationsCardProps {
  notifications: NotificationPreferences;
  onChange: (key: keyof NotificationPreferences, value: boolean) => void;
}

export function NotificationsCard({
  notifications,
  onChange,
}: NotificationsCardProps) {
  const { t } = useTranslation();

  const items = [
    {
      id: "email",
      key: "email" as const,
      icon: Mail,
      label: t("emailNotifications"),
      desc: t("receiveEmailNotifications"),
    },
    {
      id: "push",
      key: "push" as const,
      icon: Smartphone,
      label: t("pushNotifications"),
      desc: t("receivePushNotifications"),
    },
    {
      id: "sound",
      key: "sound" as const,
      icon: Volume2,
      label: t("soundNotifications"),
      desc: t("playSoundForNotifications"),
    },
  ];

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
        {items.map(({ id, key, icon: Icon, label, desc }, idx) => (
          <div key={id}>
            {idx > 0 && <Separator className="mb-4" />}
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <Label htmlFor={id} className="text-sm font-medium">
                    {label}
                  </Label>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
              </div>
              <Switch
                id={id}
                checked={notifications[key] ?? true}
                onCheckedChange={(v) => onChange(key, v)}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
