"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  Wifi,
  WifiOff,
  MapPin,
  Home,
  Calendar,
  Cpu,
  Edit,
  Trash2,
  Power,
  PowerOff,
} from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import type { DeviceWithDetails } from "@/lib/api/services/devices";

interface DeviceInfoCardProps {
  device: DeviceWithDetails;
  deviceId: number;
  onTogglePower: () => void;
  onDeleteClick: () => void;
}

export function DeviceInfoCard({
  device,
  deviceId,
  onTogglePower,
  onDeleteClick,
}: DeviceInfoCardProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const isOnline = device.status === "ONLINE";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-2xl">{device.name}</CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Cpu className="h-4 w-4" />
              <span>{device.type}</span>
            </div>
          </div>
          {isOnline ? (
            <Badge className="bg-green-600 gap-1">
              <Wifi className="h-3 w-3" />
              {t("online")}
            </Badge>
          ) : (
            <Badge variant="secondary" className="gap-1">
              <WifiOff className="h-3 w-3" />
              {t("offline")}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Info grid */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <InfoRow icon={<Home className="h-4 w-4" />} label={t("home")}>
              {device.home?.name ?? "N/A"}
            </InfoRow>
            <InfoRow icon={<MapPin className="h-4 w-4" />} label={t("room")}>
              {device.room?.name ?? "N/A"}
            </InfoRow>
            <InfoRow
              icon={<Calendar className="h-4 w-4" />}
              label={t("paired")}
            >
              {(device as any).pairedAt
                ? new Date((device as any).pairedAt).toLocaleDateString()
                : "N/A"}
            </InfoRow>
          </div>
          <div className="space-y-2">
            <InfoRow
              icon={<Activity className="h-4 w-4" />}
              label={t("lastSeen")}
            >
              {device.lastSeenAt
                ? new Date(device.lastSeenAt).toLocaleString()
                : "N/A"}
            </InfoRow>
            {(device as any).mqttClientId && (
              <InfoRow label={t("mqttId")}>
                <code className="text-xs bg-muted px-2 py-1 rounded">
                  {(device as any).mqttClientId}
                </code>
              </InfoRow>
            )}
            {device.deviceKey && (
              <InfoRow label={t("deviceKey")}>
                <code className="text-xs bg-muted px-2 py-1 rounded">
                  {device.deviceKey.substring(0, 8)}...
                </code>
              </InfoRow>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 pt-4 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={onTogglePower}
            className="gap-2"
          >
            {isOnline ? (
              <>
                <PowerOff className="h-4 w-4" />
                {t("turnOff")}
              </>
            ) : (
              <>
                <Power className="h-4 w-4" />
                {t("turnOn")}
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/user/devices/${deviceId}/edit`)}
            className="gap-2"
          >
            <Edit className="h-4 w-4" />
            {t("edit")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onDeleteClick}
            className="gap-2 text-red-600 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" />
            {t("delete")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Small helper ──────────────────────────────────────────────────────────────

function InfoRow({
  icon,
  label,
  children,
}: {
  icon?: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {icon && <span className="text-muted-foreground shrink-0">{icon}</span>}
      <span className="text-muted-foreground shrink-0">{label}:</span>
      <span className="font-medium">{children}</span>
    </div>
  );
}
