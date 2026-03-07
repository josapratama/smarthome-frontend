"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Zap, Activity } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";

interface DeviceEnergyData {
  deviceId: number;
  deviceName: string;
  deviceType: string;
  energyKwh: number;
  avgPowerW: number;
  peakPowerW: number;
  cost: number;
  status: string;
}

interface DeviceEnergyListProps {
  deviceEnergyData: DeviceEnergyData[];
  isLoading: boolean;
}

export function DeviceEnergyList({
  deviceEnergyData,
  isLoading,
}: DeviceEnergyListProps) {
  const { t } = useTranslation();

  const formatEnergy = (kwh: number | undefined) => {
    if (!kwh || kwh === 0) return "0 kWh";
    if (kwh >= 1000) {
      return `${(kwh / 1000).toFixed(2)} MWh`;
    }
    return `${kwh.toFixed(2)} kWh`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const totalEnergy = deviceEnergyData.reduce((sum, d) => sum + d.energyKwh, 0);
  const totalCost = deviceEnergyData.reduce((sum, d) => sum + d.cost, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          {t("energyConsumptionByDevice")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 rounded-lg" />
            ))}
          </div>
        ) : deviceEnergyData.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">⚡</div>
            <h3 className="text-lg font-semibold mb-2">
              {t("noPowerMetersFound")}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t("addPowerMeterToTrack")}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {deviceEnergyData.map((device) => (
              <div
                key={device.deviceId}
                className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{device.deviceName}</h4>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          device.status === "ONLINE"
                            ? "bg-green-500/10 text-green-600"
                            : "bg-gray-500/10 text-gray-600"
                        }`}
                      >
                        {device.status === "ONLINE"
                          ? t("online")
                          : t("offline")}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {device.deviceType}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg">
                    {formatEnergy(device.energyKwh)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatCurrency(device.cost)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {device.avgPowerW.toFixed(0)}W {t("currentUsage")}
                  </div>
                </div>
              </div>
            ))}

            {/* Total */}
            {deviceEnergyData.length > 1 && (
              <div className="flex items-center justify-between p-4 rounded-lg bg-primary/5 border-2 border-primary/20">
                <div className="font-semibold">{t("total")}</div>
                <div className="text-right">
                  <div className="font-bold text-xl">
                    {formatEnergy(totalEnergy)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatCurrency(totalCost)}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
