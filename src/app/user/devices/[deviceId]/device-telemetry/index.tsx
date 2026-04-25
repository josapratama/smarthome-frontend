"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3 } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { useTelemetry } from "./hooks/use-telemetry";
import { TelemetryControls } from "./components/telemetry-controls";
import { TelemetryStatsGrid } from "./components/telemetry-stats";
import { TelemetryChart } from "./components/telemetry-chart";
import { TelemetryTable } from "./components/telemetry-table";

interface DeviceTelemetryProps {
  deviceId: number;
}

export default function DeviceTelemetry({ deviceId }: DeviceTelemetryProps) {
  const { t } = useTranslation();
  const {
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
  } = useTelemetry(deviceId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 rounded-lg" />
        <Skeleton className="h-96 rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <TelemetryControls
        metrics={metrics}
        selectedMetric={selectedMetric}
        onMetricChange={setSelectedMetric}
        timeRange={timeRange}
        onTimeRangeChange={setTimeRange}
        onRefresh={loadData}
        onExport={handleExport}
      />

      <TelemetryStatsGrid stats={stats} />

      <TelemetryChart
        readings={readings}
        metrics={metrics}
        selectedMetric={selectedMetric}
      />

      {readings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              {t("dataTable")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TelemetryTable readings={readings} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
