"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import {
  RefreshCw,
  AlertCircle,
  Zap,
  TrendingUp,
  DollarSign,
  BarChart3,
} from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { apiFetchBrowser } from "@/lib/api/client/fetch";

import {
  EnergyPredictionsCard,
  type EnergyPrediction,
} from "./energy-predictions-card";
import { DeviceUsageCard, type DeviceEnergy } from "./device-usage-card";
import { EnergyTipsCard } from "./energy-tips-card";

interface EnergyStats {
  totalDevices: number;
  totalUsageToday: number;
  totalUsageMonth: number;
  estimatedCost: number;
  activePredictions: number;
}

export function MonitoringView() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<EnergyStats | null>(null);
  const [devices, setDevices] = useState<DeviceEnergy[]>([]);
  const [predictions, setPredictions] = useState<EnergyPrediction[]>([]);
  const [error, setError] = useState<string | null>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  // ── Topbar events ─────────────────────────────────────────
  useEffect(() => {
    const onRefresh = () => loadData();
    const onFilter = () => {
      filterRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      filterRef.current?.classList.add(
        "ring-2",
        "ring-primary",
        "ring-offset-2",
      );
      setTimeout(
        () =>
          filterRef.current?.classList.remove(
            "ring-2",
            "ring-primary",
            "ring-offset-2",
          ),
        2000,
      );
    };
    window.addEventListener("topbar-refresh", onRefresh);
    window.addEventListener("topbar-filter", onFilter);
    return () => {
      window.removeEventListener("topbar-refresh", onRefresh);
      window.removeEventListener("topbar-filter", onFilter);
    };
  }, []);

  async function loadData() {
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
      setError(err instanceof Error ? err.message : t("errorLoadingData"));
    } finally {
      setLoading(false);
    }
  }

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
          <CardContent className="pt-6 text-center">
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
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
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

      <EnergyPredictionsCard predictions={predictions} />
      <DeviceUsageCard devices={devices} filterRef={filterRef} />
      <EnergyTipsCard />
    </div>
  );
}
