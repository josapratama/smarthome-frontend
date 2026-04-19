"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, Zap, Activity, Key } from "lucide-react";

interface DeviceQuickActionsProps {
  deviceId: number;
  isEnergyMonitor: boolean;
  isSendingCredentials: boolean;
  onSendCredentials: () => void;
  t: (key: string) => string;
}

export function DeviceQuickActions({
  deviceId,
  isEnergyMonitor,
  isSendingCredentials,
  onSendCredentials,
  t,
}: DeviceQuickActionsProps) {
  const router = useRouter();

  const actions = [
    {
      label: t("configuration"),
      icon: Settings,
      onClick: () =>
        router.push(`/device-management/devices/${deviceId}/config`),
      show: true,
    },
    {
      label: t("manageChannels"),
      icon: Zap,
      onClick: () =>
        router.push(`/device-management/devices/${deviceId}/channels`),
      show: !isEnergyMonitor,
    },
    {
      label: t("telemetry"),
      icon: Activity,
      onClick: () =>
        router.push(`/device-management/devices/${deviceId}/telemetry`),
      show: true,
    },
    {
      label: isSendingCredentials ? t("sending") : t("sendCredentials"),
      icon: Key,
      onClick: onSendCredentials,
      disabled: isSendingCredentials,
      show: true,
    },
    {
      label: t("otaUpdate"),
      icon: Zap,
      onClick: () => router.push(`/firmware?deviceId=${deviceId}`),
      show: true,
    },
  ].filter((a) => a.show);

  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">{t("quickActions")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {actions.map(({ label, icon: Icon, onClick, disabled }) => (
            <Button
              key={label}
              variant="outline"
              className="justify-start h-auto py-3"
              onClick={onClick}
              disabled={disabled}
            >
              <Icon className="mr-2 h-4 w-4" />
              {label}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
