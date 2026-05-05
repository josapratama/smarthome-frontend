"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "@/hooks/use-translation";
import type { DeviceDTO } from "@/lib/api/dto/devices.dto";
import { fmtDateTime } from "../../lib/firmware.utils";

interface OtaTriggerCardProps {
  devices: DeviceDTO[];
  releases: any[];
  deviceId: number | undefined;
  releaseId: number | undefined;
  selectedDevice: DeviceDTO | undefined;
  isDevicesLoading: boolean;
  isReleasesLoading: boolean;
  isTriggering: boolean;
  triggerError: Error | null;
  onDeviceChange: (id: number) => void;
  onReleaseChange: (id: number) => void;
  onTrigger: () => void;
}

export function OtaTriggerCard({
  devices,
  releases,
  deviceId,
  releaseId,
  selectedDevice,
  isDevicesLoading,
  isReleasesLoading,
  isTriggering,
  triggerError,
  onDeviceChange,
  onReleaseChange,
  onTrigger,
}: OtaTriggerCardProps) {
  const { t } = useTranslation();

  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader>
        <CardTitle>{t("triggerOta")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          {/* Device selector */}
          <div className="space-y-2">
            <p className="text-sm font-medium">{t("device")}</p>
            {isDevicesLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Select
                value={deviceId ? String(deviceId) : ""}
                onValueChange={(v) => onDeviceChange(Number(v))}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("selectDevice")} />
                </SelectTrigger>
                <SelectContent>
                  {devices.map((d) => (
                    <SelectItem key={d.id} value={String(d.id)}>
                      #{d.id} {d.deviceName ? `- ${d.deviceName}` : ""} (
                      {d.mqttClientId ?? "no-mqtt"})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {selectedDevice && (
              <div className="flex items-center gap-2 text-xs">
                <Badge
                  variant={selectedDevice.status ? "default" : "secondary"}
                >
                  {selectedDevice.status ? t("online") : t("offline")}
                </Badge>
                <span className="text-muted-foreground">
                  {t("lastSeen")}: {fmtDateTime(selectedDevice.lastSeenAt)}
                </span>
              </div>
            )}
          </div>

          {/* Release selector */}
          <div className="space-y-2">
            <p className="text-sm font-medium">{t("release")}</p>
            {isReleasesLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Select
                value={releaseId ? String(releaseId) : ""}
                onValueChange={(v) => onReleaseChange(Number(v))}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("selectFirmware")} />
                </SelectTrigger>
                <SelectContent>
                  {releases.map((r: any) => (
                    <SelectItem key={r.id} value={String(r.id)}>
                      {r.version} ({r.platform})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Trigger button */}
          <div className="flex items-end">
            <Button
              className="w-full"
              disabled={isTriggering || !deviceId || !releaseId}
              onClick={onTrigger}
            >
              {isTriggering ? t("triggering") : t("triggerOta")}
            </Button>
          </div>
        </div>

        {triggerError && (
          <div className="text-sm text-destructive rounded-lg bg-destructive/10 p-3">
            {triggerError.message}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
