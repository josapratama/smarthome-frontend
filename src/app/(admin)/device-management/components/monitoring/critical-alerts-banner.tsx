import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "@/hooks/use-translation";
import type { DeviceDTO } from "@/lib/api/dto/devices.dto";
import { getRelativeTime } from "../monitoring/monitoring.utils";

interface CriticalAlertsBannerProps {
  devices: DeviceDTO[];
}

export function CriticalAlertsBanner({ devices }: CriticalAlertsBannerProps) {
  const { t } = useTranslation();
  if (devices.length === 0) return null;

  return (
    <Card className="border-l-4 border-l-orange-500 dark:border-l-orange-600 shadow-md">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="h-10 w-10 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-orange-900 dark:text-orange-100 mb-1">
              {t("criticalAlerts")}
            </h3>
            <p className="text-sm text-orange-800 dark:text-orange-300 mb-4">
              {devices.length} {t("offlineOver1Hour")}
            </p>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {devices.slice(0, 3).map((device) => (
                <Link
                  key={device.id}
                  href={`/device-management/devices/${device.id}`}
                  className="block"
                >
                  <div className="p-4 rounded-lg bg-orange-50 dark:bg-gray-700 border border-orange-200 dark:border-orange-800 hover:border-orange-300 hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm truncate">
                        {device.deviceName}
                      </span>
                      <Badge variant="destructive" className="text-xs">
                        {t("offline")}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {t("lastSeen")}: {getRelativeTime(device.lastSeenAt)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
            {devices.length > 3 && (
              <p className="text-xs text-orange-700 dark:text-orange-400 mt-3">
                +{devices.length - 3} {t("moreDevices")}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
