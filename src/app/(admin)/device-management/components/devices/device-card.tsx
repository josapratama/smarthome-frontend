"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, Zap, Pencil, Trash2, Wifi, WifiOff } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import type { DeviceDTO } from "@/lib/api/dto/devices.dto";

const TYPE_COLORS: Record<string, string> = {
  LIGHT:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  FAN: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  SENSOR_NODE:
    "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  POWER_METER:
    "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  ENERGY_MONITOR:
    "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  DOOR: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  OTHER: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
};

interface DeviceCardProps {
  device: DeviceDTO;
  onEdit: (device: DeviceDTO) => void;
  onDelete: (device: DeviceDTO) => void;
}

export function DeviceCard({ device, onEdit, onDelete }: DeviceCardProps) {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <Card
      className="cursor-pointer transition-all hover:shadow-md hover:border-primary/50"
      onClick={() => router.push(`/device-management/devices/${device.id}`)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-lg truncate">
                {device.deviceName}
              </span>
              {device.status ? (
                <Badge className="bg-green-500">
                  <Wifi className="mr-1 h-3 w-3" />
                  {t("online")}
                </Badge>
              ) : (
                <Badge variant="secondary">
                  <WifiOff className="mr-1 h-3 w-3" />
                  {t("offline")}
                </Badge>
              )}
            </div>
            <div className="flex flex-wrap gap-1">
              <Badge
                variant="outline"
                className={TYPE_COLORS[device.deviceType] ?? TYPE_COLORS.OTHER}
              >
                {device.deviceType.replace(/_/g, " ")}
              </Badge>
              <Badge variant="outline" className="text-xs">
                #{device.id}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="text-xs text-muted-foreground space-y-1">
          <div className="flex justify-between">
            <span>{t("lastSeen")}:</span>
            <span className="font-mono">
              {device.lastSeenAt
                ? new Date(device.lastSeenAt).toLocaleString()
                : "-"}
            </span>
          </div>
          <div className="flex justify-between">
            <span>{t("home")}:</span>
            <span>#{device.homeId}</span>
          </div>
          {device.roomId && (
            <div className="flex justify-between">
              <span>{t("room")}:</span>
              <span>#{device.roomId}</span>
            </div>
          )}
          {device.mqttClientId && (
            <div className="flex justify-between">
              <span>MQTT:</span>
              <span className="font-mono text-xs truncate">
                {device.mqttClientId}
              </span>
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-2 border-t">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/device-management/devices/${device.id}/telemetry`);
            }}
          >
            <Activity className="mr-1 h-3 w-3" />
            {t("telemetry")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/firmware?deviceId=${device.id}`);
            }}
          >
            <Zap className="mr-1 h-3 w-3" />
            OTA
          </Button>
        </div>

        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="flex-1"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(device);
            }}
          >
            <Pencil className="mr-1 h-3 w-3" />
            {t("edit")}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(device);
            }}
          >
            <Trash2 className="mr-1 h-3 w-3" />
            {t("delete")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
