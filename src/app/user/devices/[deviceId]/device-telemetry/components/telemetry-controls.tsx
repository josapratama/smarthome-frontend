"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, RefreshCw } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import type { TimeRange } from "../hooks/use-telemetry";

interface TelemetryControlsProps {
  metrics: string[];
  selectedMetric: string;
  onMetricChange: (v: string) => void;
  timeRange: TimeRange;
  onTimeRangeChange: (v: TimeRange) => void;
  onRefresh: () => void;
  onExport: (format: "csv" | "json") => void;
}

export function TelemetryControls({
  metrics,
  selectedMetric,
  onMetricChange,
  timeRange,
  onTimeRangeChange,
  onRefresh,
  onExport,
}: TelemetryControlsProps) {
  const { t } = useTranslation();

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="text-sm font-medium mb-2 block">
              {t("metric")}
            </label>
            <Select value={selectedMetric} onValueChange={onMetricChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("allMetrics")}</SelectItem>
                {metrics.map((metric) => (
                  <SelectItem key={metric} value={metric}>
                    {metric.replace(/_/g, " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="text-sm font-medium mb-2 block">
              {t("timeRange")}
            </label>
            <Select
              value={timeRange}
              onValueChange={(v) => onTimeRangeChange(v as TimeRange)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">{t("last1Hour")}</SelectItem>
                <SelectItem value="6h">{t("last6Hours")}</SelectItem>
                <SelectItem value="24h">{t("last24Hours")}</SelectItem>
                <SelectItem value="7d">{t("last7Days")}</SelectItem>
                <SelectItem value="30d">{t("last30Days")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={onRefresh}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() => onExport("csv")}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              CSV
            </Button>
            <Button
              variant="outline"
              onClick={() => onExport("json")}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              JSON
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
