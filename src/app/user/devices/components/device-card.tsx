"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Smartphone,
  Wifi,
  WifiOff,
  Lightbulb,
  Fan,
  Thermometer,
  Zap,
  Home as HomeIcon,
  DoorOpen,
  AlertCircle,
} from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import type { DeviceWithDetails } from "@/lib/api/services/devices";

interface DeviceCardProps {
  device: DeviceWithDetails;
}

function getDeviceIcon(type: string | undefined) {
  if (!type) return <Smartphone className="h-6 w-6 text-primary" />;
  const t = type.toLowerCase();
  if (t.includes("light") || t.includes("lampu"))
    return <Lightbulb className="h-6 w-6 text-yellow-500" />;
  if (t.includes("fan") || t.includes("kipas"))
    return <Fan className="h-6 w-6 text-blue-500" />;
  if (t.includes("ac") || t.includes("thermostat"))
    return <Thermometer className="h-6 w-6 text-blue-500" />;
  if (t.includes("power") || t.includes("meter"))
    return <Zap className="h-6 w-6 text-orange-500" />;
  return <Smartphone className="h-6 w-6 text-primary" />;
}

function DeviceStatusBadge({ status }: { status: string }) {
  const { t } = useTranslation();
  switch (status) {
    case "ONLINE":
      return (
        <Badge className="bg-green-600 flex items-center gap-1">
          <Wifi className="h-3 w-3" />
          {t("online")}
        </Badge>
      );
    case "OFFLINE":
      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          <WifiOff className="h-3 w-3" />
          {t("offline")}
        </Badge>
      );
    case "ERROR":
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {t("error")}
        </Badge>
      );
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

export function DeviceCard({ device }: DeviceCardProps) {
  return (
    <Link href={`/user/devices/${device.id}`}>
      <Card className="hover:shadow-lg hover:scale-[1.02] transition-all cursor-pointer border-l-4 border-l-primary h-full">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {getDeviceIcon(device.type)}
              <div>
                <CardTitle className="text-lg">{device.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{device.type}</p>
              </div>
            </div>
            <DeviceStatusBadge status={device.status} />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {device.home && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <HomeIcon className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{device.home.name}</span>
              </div>
              {device.room && (
                <div className="flex items-center gap-2 text-sm">
                  <DoorOpen className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {device.room.name}
                  </span>
                </div>
              )}
            </div>
          )}
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
            <span>
              {device.firmwareVersion ? `v${device.firmwareVersion}` : "-"}
            </span>
            {device.lastSeenAt && (
              <span>
                {new Date(device.lastSeenAt).toLocaleDateString("id-ID", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
