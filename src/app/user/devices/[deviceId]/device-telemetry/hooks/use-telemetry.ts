"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslation } from "@/hooks/use-translation";
import { toast } from "sonner";
import {
  telemetryApi,
  type SensorReading,
  type TelemetryStats,
} from "@/lib/api/services/telemetry";

export type TimeRange = "1h" | "6h" | "24h" | "7d" | "30d";

function getFromDate(timeRange: TimeRange): Date {
  const now = new Date();
  const from = new Date(now);
  switch (timeRange) {
    case "1h":
      from.setHours(now.getHours() - 1);
      break;
    case "6h":
      from.setHours(now.getHours() - 6);
      break;
    case "24h":
      from.setHours(now.getHours() - 24);
      break;
    case "7d":
      from.setDate(now.getDate() - 7);
      break;
    case "30d":
      from.setDate(now.getDate() - 30);
      break;
  }
  return from;
}

export function useTelemetry(deviceId: number) {
  const { t } = useTranslation();
  const [readings, setReadings] = useState<SensorReading[]>([]);
  const [metrics, setMetrics] = useState<string[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<string>("all");
  const [timeRange, setTimeRange] = useState<TimeRange>("1h");
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<TelemetryStats[]>([]);

  const loadMetrics = useCallback(async () => {
    try {
      const data = await telemetryApi.getMetrics(deviceId);
      setMetrics(data);
      if (data.length > 0) {
        setSelectedMetric((prev) => (prev === "all" ? data[0] : prev));
      }
    } catch {
      // silently fail — metrics are optional
    }
  }, [deviceId]);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const now = new Date();
      const from = getFromDate(timeRange);

      const [readingsData, statsData] = await Promise.all([
        telemetryApi.getHistory(deviceId, {
          from: from.toISOString(),
          to: now.toISOString(),
          metric: selectedMetric !== "all" ? selectedMetric : undefined,
          limit: 1000,
        }),
        telemetryApi.getStats(deviceId, {
          from: from.toISOString(),
          to: now.toISOString(),
          metrics: selectedMetric !== "all" ? [selectedMetric] : metrics,
        }),
      ]);

      setReadings(readingsData);
      setStats(statsData);
    } catch (error: any) {
      toast.error(error.message || t("failedToLoadTelemetry"));
    } finally {
      setIsLoading(false);
    }
  }, [deviceId, selectedMetric, timeRange, metrics, t]);

  const handleExport = useCallback(
    async (format: "csv" | "json") => {
      try {
        const now = new Date();
        const from = getFromDate(timeRange);

        const blob = await telemetryApi.export(deviceId, {
          from: from.toISOString(),
          to: now.toISOString(),
          format,
        });

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `telemetry_${deviceId}_${Date.now()}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        toast.success(t("dataExported"));
      } catch (error: any) {
        toast.error(error.message || t("failedToExportData"));
      }
    },
    [deviceId, timeRange, t],
  );

  useEffect(() => {
    loadMetrics();
  }, [loadMetrics]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    readings,
    metrics,
    selectedMetric,
    setSelectedMetric,
    timeRange,
    setTimeRange,
    isLoading,
    stats,
    loadData,
    handleExport,
  };
}
