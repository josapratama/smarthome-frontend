"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

  useEffect(() => {
    loadData();
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
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{t("energyAnalytics")}</h1>
          <p className="text-sm text-muted-foreground">
            {t("monitorEnergyConsumption")}
          </p>
        </div>
        <Button onClick={loadData} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          {t("refresh")}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <Zap className="h-4 w-4" />
              {t("totalDevices")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{stats.totalDevices}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {t("powerMeters")}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              {t("thisMonth")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">
              {stats.totalUsageMonth.toFixed(1)}
              <span className="text-lg text-muted-foreground ml-1">kWh</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t("totalConsumption")}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              {t("estimatedCost")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">
              ${stats.estimatedCost.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t("thisMonth")}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              {t("aiPredictions")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">
              {stats.activePredictions}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t("activePredictions")}
            </p>
          </CardContent>
        </Card>
      </div>

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
      {devices.length > 0 ? (
        <Card className="rounded-2xl shadow-sm">
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
