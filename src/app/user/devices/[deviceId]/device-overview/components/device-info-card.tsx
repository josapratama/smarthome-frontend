"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Activity,
  MapPin,
  Home,
  Calendar,
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
      <CardContent className="pt-4 space-y-3">
        {/* Info rows — compact on mobile */}
        <div className="grid gap-x-6 gap-y-1.5 sm:grid-cols-2">
          <InfoRow icon={<Home className="h-3.5 w-3.5" />} label={t("home")}>
            {device.home?.name ??
              (device.homeId ? `Home #${device.homeId}` : "—")}
          </InfoRow>
          <InfoRow icon={<MapPin className="h-3.5 w-3.5" />} label={t("room")}>
            {device.room?.name ??
              (device.roomId ? `Room #${device.roomId}` : "—")}
          </InfoRow>
          <InfoRow
            icon={<Calendar className="h-3.5 w-3.5" />}
            label={t("paired")}
          >
            {(device as any).pairedAt
              ? new Date((device as any).pairedAt).toLocaleDateString()
              : device.createdAt
                ? new Date(device.createdAt).toLocaleDateString()
                : "—"}
          </InfoRow>
          <InfoRow
            icon={<Activity className="h-3.5 w-3.5" />}
            label={t("lastSeen")}
          >
            {device.lastSeenAt
              ? new Date(device.lastSeenAt).toLocaleString()
              : "N/A"}
          </InfoRow>
          {(device as any).mqttClientId && (
            <InfoRow label="MQTT ID">
              <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                {(device as any).mqttClientId}
              </code>
            </InfoRow>
          )}
          {device.deviceKey && (
            <InfoRow label={t("deviceKey")}>
              <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                {device.deviceKey.substring(0, 8)}...
              </code>
            </InfoRow>
          )}
        </div>

        {/* Actions — compact row */}
        <div className="flex flex-wrap gap-2 pt-2 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={onTogglePower}
            className="gap-1.5 h-8 text-xs"
          >
            {isOnline ? (
              <>
                <PowerOff className="h-3.5 w-3.5" />
                {t("turnOff")}
              </>
            ) : (
              <>
                <Power className="h-3.5 w-3.5" />
                {t("turnOn")}
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/user/devices/${deviceId}?tab=config`)}
            className="gap-1.5 h-8 text-xs"
          >
            <Edit className="h-3.5 w-3.5" />
            {t("edit")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onDeleteClick}
            className="gap-1.5 h-8 text-xs text-red-600 hover:text-red-600"
          >
            <Trash2 className="h-3.5 w-3.5" />
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
    <div className="flex items-center gap-1.5 text-xs sm:text-sm">
      {icon && <span className="text-muted-foreground shrink-0">{icon}</span>}
      <span className="text-muted-foreground shrink-0">{label}:</span>
      <span className="font-medium truncate">{children}</span>
    </div>
  );
}
