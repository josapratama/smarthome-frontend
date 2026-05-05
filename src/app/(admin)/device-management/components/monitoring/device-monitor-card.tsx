import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Wifi, WifiOff } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import type { DeviceDTO } from "@/lib/api/dto/devices.dto";
import {
  getLastSeenStatus,
  getRelativeTime,
  fmtDateTime,
  isCriticalDevice,
} from "./monitoring.utils";

interface DeviceMonitorCardProps {
  device: DeviceDTO;
}

export function DeviceMonitorCard({ device }: DeviceMonitorCardProps) {
  const { t } = useTranslation();
  const { status } = getLastSeenStatus(device.lastSeenAt);
  const critical = isCriticalDevice(device);

  return (
    <Link
      href={`/device-management/devices/${device.id}`}
      className="block group"
    >
      <div
        className={`p-4 rounded-xl border transition-all hover:shadow-md ${
          critical
            ? "border-orange-500 dark:border-orange-600"
            : "border-gray-200 dark:border-gray-700 hover:border-primary/50"
        } bg-white dark:bg-gray-800`}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            {/* Status icon */}
            <div className="relative flex-shrink-0">
              <div
                className={`h-10 w-10 rounded-full flex items-center justify-center ${
                  status === "online"
                    ? "bg-green-100 dark:bg-green-900"
                    : status === "recent"
                      ? "bg-yellow-100 dark:bg-yellow-900"
                      : "bg-gray-100 dark:bg-gray-700"
                }`}
              >
                {status === "offline" ? (
                  <WifiOff className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                ) : (
                  <Wifi
                    className={`h-5 w-5 ${
                      status === "online"
                        ? "text-green-600 dark:text-green-400"
                        : "text-yellow-600 dark:text-yellow-400"
                    }`}
                  />
                )}
              </div>
              {status === "online" && (
                <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-green-500 animate-pulse" />
              )}
              {critical && (
                <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-orange-500 flex items-center justify-center">
                  <AlertTriangle className="h-2.5 w-2.5 text-white" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold truncate group-hover:text-primary transition-colors">
                  {device.deviceName}
                </h4>
                <Badge
                  variant={device.status ? "default" : "secondary"}
                  className="text-xs flex-shrink-0"
                >
                  {device.status ? t("online") : t("offline")}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>ID: #{device.id}</span>
                <span>•</span>
                <span>
                  {t("home")} #{device.homeId}
                </span>
                <span>•</span>
                <span className="truncate">{device.deviceType}</span>
              </div>
            </div>
          </div>

          {/* Last seen */}
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            <span className="text-xs font-medium text-muted-foreground">
              {t("lastSeen")}
            </span>
            <span className="text-sm font-semibold">
              {getRelativeTime(device.lastSeenAt)}
            </span>
            <span className="text-xs text-muted-foreground">
              {fmtDateTime(device.lastSeenAt)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
