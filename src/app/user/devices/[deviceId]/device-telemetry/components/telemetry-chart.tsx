"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, BarChart3 } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { SensorReading } from "@/lib/api/services/telemetry";

const CHART_COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
];

interface TelemetryChartProps {
  readings: SensorReading[];
  metrics: string[];
  selectedMetric: string;
}

function formatTime(timestamp: string) {
  return new Date(timestamp).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function readingValue(reading: SensorReading): number | null {
  if (reading.valueBool !== undefined) return reading.valueBool ? 1 : 0;
  return reading.valueNum ?? null;
}

export function TelemetryChart({
  readings,
  metrics,
  selectedMetric,
}: TelemetryChartProps) {
  const { t } = useTranslation();

  const chartData = useMemo(() => {
    if (selectedMetric === "all") {
      const grouped: Record<string, Record<string, unknown>> = {};
      readings.forEach((r) => {
        const time = formatTime(r.timestamp);
        if (!grouped[time]) grouped[time] = { time };
        grouped[time][r.metric] = readingValue(r);
      });
      return Object.values(grouped);
    }
    return readings.map((r) => ({
      time: formatTime(r.timestamp),
      value: readingValue(r),
    }));
  }, [readings, selectedMetric]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          {t("dataVisualization")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {readings.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>{t("noDataAvailable")}</p>
          </div>
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              {selectedMetric === "all" ? (
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="time"
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  {metrics.map((metric, i) => (
                    <Line
                      key={metric}
                      type="monotone"
                      dataKey={metric}
                      stroke={CHART_COLORS[i % CHART_COLORS.length]}
                      strokeWidth={2}
                      dot={false}
                      name={metric.replace(/_/g, " ")}
                    />
                  ))}
                </LineChart>
              ) : (
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="time"
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#3b82f6"
                    fillOpacity={1}
                    fill="url(#colorValue)"
                    name={selectedMetric.replace(/_/g, " ")}
                  />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
