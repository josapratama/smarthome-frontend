"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { useLanguage } from "@/contexts/language-context";
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Zap,
  DollarSign,
  BarChart3,
  Lightbulb,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { apiFetchBrowser } from "@/lib/api/client.browser";

interface EnergyStats {
  totalDevices: number;
  totalUsageToday: number;
  totalUsageMonth: number;
  estimatedCost: number;
  activePredictions: number;
}

interface DeviceEnergy {
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

interface EnergyPrediction {
  id: number;
  deviceId: number;
  deviceName: string;
  predictedUsage: number;
  confidence: number;
  predictionDate: string;
  createdAt: string;
}

export default function EnergyClient() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<EnergyStats | null>(null);
  const [devices, setDevices] = useState<DeviceEnergy[]>([]);
  const [predictions, setPredictions] = useState<EnergyPrediction[]>([]);
  const [error, setError] = useState<string | null>(null);

  const filterSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const handleRefresh = () => {
      loadData();
    };

    const handleFilter = () => {
      if (filterSectionRef.current) {
        filterSectionRef.current.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        filterSectionRef.current.classList.add(
          "ring-2",
          "ring-primary",
          "ring-offset-2",
        );
        setTimeout(() => {
          filterSectionRef.current?.classList.remove(
            "ring-2",
            "ring-primary",
            "ring-offset-2",
          );
        }, 2000);
      }
    };

    window.addEventListener("topbar-refresh", handleRefresh);
    window.addEventListener("topbar-filter", handleFilter);

    return () => {
      window.removeEventListener("topbar-refresh", handleRefresh);
      window.removeEventListener("topbar-filter", handleFilter);
    };
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, devicesRes, predictionsRes] = await Promise.all([
        apiFetchBrowser<{ data: EnergyStats }>("/api/v1/energy/stats"),
        apiFetchBrowser<{ data: { devices: DeviceEnergy[] } }>(
          "/api/v1/energy/devices",
        ),
        apiFetchBrowser<{ data: { predictions: EnergyPrediction[] } }>(
          "/api/v1/energy/predictions",
        ),
      ]);

      setStats(statsRes.data);
      setDevices(devicesRes.data.devices);
      setPredictions(predictionsRes.data.predictions);
    } catch (err) {
      console.error("Failed to load energy data:", err);
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-red-500" />;
      case "down":
        return <TrendingDown className="h-4 w-4 text-green-500" />;
      default:
        return <Activity className="h-4 w-4 text-blue-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "up":
        return "text-red-600 dark:text-red-400";
      case "down":
        return "text-green-600 dark:text-green-400";
      default:
        return "text-blue-600 dark:text-blue-400";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">{t("loading")}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="rounded-2xl shadow-sm border-red-200 dark:border-red-800">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 mx-auto mb-3 text-red-500" />
              <h3 className="font-medium text-red-900 dark:text-red-100 mb-2">
                {t("errorLoadingData")}
              </h3>
              <p className="text-sm text-red-700 dark:text-red-300 mb-4">
                {error}
              </p>
              <Button onClick={loadData} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                {t("retry")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!stats) return null;

  const totalUsage = devices.reduce((sum, d) => sum + d.monthUsage, 0);

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <PageHeader
        stats={[
          {
            label: t("totalConsumption"),
            value: `${stats.totalUsageMonth.toFixed(1)} kWh`,
            icon: Zap,
            color: "text-yellow-500",
          },
          {
            label: t("today"),
            value: `${stats.totalUsageToday.toFixed(1)} kWh`,
            icon: TrendingUp,
            color: "text-blue-500",
          },
          {
            label: t("estimatedCost"),
            value: `$${stats.estimatedCost.toFixed(2)}`,
            icon: DollarSign,
            color: "text-green-500",
          },
          {
            label: t("totalDevices"),
            value: stats.totalDevices,
            icon: BarChart3,
            color: "text-purple-500",
          },
        ]}
      />

      {/* AI Predictions */}
      {predictions.length > 0 && (
        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              {t("aiEnergyPredictions")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {predictions.slice(0, 5).map((pred) => (
                <div
                  key={pred.id}
                  className="flex items-center justify-between p-4 rounded-xl border"
                >
                  <div className="flex-1">
                    <div className="font-medium">{pred.deviceName}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {t("predictedUsage")}: {pred.predictedUsage.toFixed(2)}{" "}
                      kWh
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={
                        pred.confidence >= 0.9
                          ? "default"
                          : pred.confidence >= 0.8
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {(pred.confidence * 100).toFixed(0)}% {t("confidence")}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Energy Consumption by Device */}
      <div ref={filterSectionRef}>
        {devices.length > 0 ? (
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
                        {getTrendIcon(device.trend)}
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">
                          {device.monthUsage.toFixed(1)} kWh
                        </div>
                        <div className="text-xs text-muted-foreground">
                          ${device.cost.toFixed(2)}
                        </div>
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
                        {device.currentPower?.toFixed(1) || "0.0"}W
                      </span>
                      <span>
                        {t("today")}: {device.todayUsage.toFixed(2)} kWh
                      </span>
                      <span className={getTrendColor(device.trend)}>
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
        ) : (
          <Card className="rounded-2xl shadow-sm">
            <CardContent className="pt-6">
              <div className="text-center py-8 text-muted-foreground">
                <Zap className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>{t("noPowerMetersFound")}</p>
                <p className="text-sm mt-2">{t("addPowerMeterToTrack")}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Energy Saving Tips */}
      <Card className="rounded-2xl shadow-sm border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2 text-green-900 dark:text-green-100">
            <Lightbulb className="h-4 w-4" />
            {t("energySavingTips")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-green-800 dark:text-green-200">
            <li className="flex items-start gap-2">
              <span className="text-green-600 dark:text-green-400">•</span>
              <span>{t("tip1")}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 dark:text-green-400">•</span>
              <span>{t("tip2")}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 dark:text-green-400">•</span>
              <span>{t("tip3")}</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
