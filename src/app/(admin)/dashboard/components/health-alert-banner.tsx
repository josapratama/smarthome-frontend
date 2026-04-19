import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, AlertCircle } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";

interface HealthAlertBannerProps {
  offlineDevices: number;
  totalDevices: number;
  criticalAlarms: number;
}

export function HealthAlertBanner({
  offlineDevices,
  totalDevices,
  criticalAlarms,
}: HealthAlertBannerProps) {
  const { t } = useTranslation();
  const healthPct =
    totalDevices > 0
      ? Math.round(((totalDevices - offlineDevices) / totalDevices) * 100)
      : 100;

  return (
    <>
      {/* Low connectivity warning */}
      {healthPct < 80 && totalDevices > 0 && (
        <Card className="rounded-2xl shadow-sm border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-medium text-amber-900 dark:text-amber-100">
                  {t("systemHealthWarning")}
                </h3>
                <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                  {offlineDevices} {t("devicesOffline")} —{" "}
                  {t("checkDeviceConnections")}
                </p>
              </div>
              <Link href="/device-management">
                <Button
                  size="sm"
                  variant="outline"
                  className="border-amber-300 dark:border-amber-700"
                >
                  {t("viewDetails")}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Critical alarms warning */}
      {criticalAlarms > 0 && (
        <Card className="rounded-2xl shadow-sm border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-medium text-red-900 dark:text-red-100">
                  {t("criticalAlertsActive")}
                </h3>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                  {criticalAlarms} {t("openAlarms")} {t("requireAttention")}
                </p>
              </div>
              <Link href="/alarms">
                <Button
                  size="sm"
                  variant="outline"
                  className="border-red-300 dark:border-red-700"
                >
                  {t("viewAlarms")}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
