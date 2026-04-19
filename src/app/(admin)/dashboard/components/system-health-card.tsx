import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";

interface SystemHealthCardProps {
  onlineDevices: number;
  offlineDevices: number;
  criticalAlarms: number;
}

export function SystemHealthCard({
  onlineDevices,
  offlineDevices,
  criticalAlarms,
}: SystemHealthCardProps) {
  const { t } = useTranslation();
  const total = onlineDevices + offlineDevices;
  const pct = total > 0 ? Math.round((onlineDevices / total) * 100) : 0;

  const barColor =
    pct >= 90 ? "bg-green-500" : pct >= 70 ? "bg-yellow-500" : "bg-red-500";

  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Activity className="h-4 w-4" />
          {t("systemHealth")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {t("deviceConnectivity")}
            </span>
            <span className="text-2xl font-semibold">{pct}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${barColor}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="grid grid-cols-3 gap-4 pt-2">
            <div className="text-center">
              <p className="text-2xl font-semibold text-green-600 dark:text-green-400">
                {onlineDevices}
              </p>
              <p className="text-xs text-muted-foreground">{t("online")}</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-semibold text-red-600 dark:text-red-400">
                {offlineDevices}
              </p>
              <p className="text-xs text-muted-foreground">{t("offline")}</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-semibold text-amber-600 dark:text-amber-400">
                {criticalAlarms}
              </p>
              <p className="text-xs text-muted-foreground">{t("alarms")}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
