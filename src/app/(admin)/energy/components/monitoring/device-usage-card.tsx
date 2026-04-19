import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Zap,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Activity,
} from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";

export interface DeviceEnergy {
  deviceId: number;
  deviceName: string;
  deviceType: string;
  currentPower: number | null;
  todayUsage: number;
  monthUsage: number;
  cost: number;
  trend: "up" | "down" | "stable";
  lastUpdate: string;
}

interface DeviceUsageCardProps {
  devices: DeviceEnergy[];
  filterRef: React.RefObject<HTMLDivElement>;
}

function TrendIcon({ trend }: { trend: string }) {
  if (trend === "up") return <TrendingUp className="h-4 w-4 text-red-500" />;
  if (trend === "down")
    return <TrendingDown className="h-4 w-4 text-green-500" />;
  return <Activity className="h-4 w-4 text-blue-500" />;
}

function trendColor(trend: string): string {
  if (trend === "up") return "text-red-600 dark:text-red-400";
  if (trend === "down") return "text-green-600 dark:text-green-400";
  return "text-blue-600 dark:text-blue-400";
}

export function DeviceUsageCard({ devices, filterRef }: DeviceUsageCardProps) {
  const { t } = useTranslation();
  const totalUsage = devices.reduce((sum, d) => sum + d.monthUsage, 0);

  if (devices.length === 0) {
    return (
      <div ref={filterRef}>
        <Card className="rounded-2xl shadow-sm">
          <CardContent className="pt-6">
            <div className="text-center py-8 text-muted-foreground">
              <Zap className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>{t("noPowerMetersFound")}</p>
              <p className="text-sm mt-2">{t("addPowerMeterToTrack")}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div ref={filterRef}>
      <Card className="rounded-2xl shadow-sm transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            {t("energyConsumptionByDevice")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {devices.map((device) => (
              <div key={device.deviceId} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{device.deviceName}</span>
                    <TrendIcon trend={device.trend} />
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {device.monthUsage.toFixed(1)} kWh
                    </p>
                    <p className="text-xs text-muted-foreground">
                      ${device.cost.toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-primary"
                    style={{
                      width: `${totalUsage > 0 ? (device.monthUsage / totalUsage) * 100 : 0}%`,
                    }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {t("currentUsage")}:{" "}
                    {device.currentPower?.toFixed(1) ?? "0.0"}W
                  </span>
                  <span>
                    {t("today")}: {device.todayUsage.toFixed(2)} kWh
                  </span>
                  <span className={trendColor(device.trend)}>
                    {device.trend === "up"
                      ? t("increasing")
                      : device.trend === "down"
                        ? t("decreasing")
                        : t("stable")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
