"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TrendingUp, Download, RefreshCw, BarChart3 } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { telemetryApi, SensorReading } from "@/lib/api/services/telemetry";
import { toast } from "sonner";
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

interface DeviceTelemetryProps {
  deviceId: number;
}

export default function DeviceTelemetry({ deviceId }: DeviceTelemetryProps) {
  const { t } = useTranslation();
  const [readings, setReadings] = useState<SensorReading[]>([]);
  const [metrics, setMetrics] = useState<string[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<string>("all");
  const [timeRange, setTimeRange] = useState<string>("1h");
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<any[]>([]);

  useEffect(() => {
    loadMetrics();
  }, [deviceId]);

  useEffect(() => {
    loadData();
  }, [deviceId, selectedMetric, timeRange]);

  const loadMetrics = async () => {
    try {
      const data = await telemetryApi.getMetrics(deviceId);
      setMetrics(data);
      if (data.length > 0 && selectedMetric === "all") {
        setSelectedMetric(data[0]);
      }
    } catch (error: any) {
      console.error("Failed to load metrics:", error);
    }
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const now = new Date();
      const from = new Date(now);

      // Calculate time range
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
  };

  const prepareChartData = () => {
    if (selectedMetric === "all") {
      // Group by timestamp for multiple metrics
      const grouped = readings.reduce((acc: any, reading) => {
        const time = new Date(reading.timestamp).toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        });
        if (!acc[time]) {
          acc[time] = { time };
        }
        const value =
          reading.valueBool !== undefined
            ? reading.valueBool
              ? 1
              : 0
            : reading.valueNum;
        acc[time][reading.metric] = value;
        return acc;
      }, {});
      return Object.values(grouped);
    } else {
      // Single metric
      return readings.map((reading) => ({
        time: new Date(reading.timestamp).toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        value:
          reading.valueBool !== undefined
            ? reading.valueBool
              ? 1
              : 0
            : reading.valueNum,
      }));
    }
  };

  const getChartColors = () => {
    const colors = [
      "#3b82f6", // blue
      "#10b981", // green
      "#f59e0b", // amber
      "#ef4444", // red
      "#8b5cf6", // violet
      "#ec4899", // pink
    ];
    return colors;
  };

  const handleExport = async (format: "csv" | "json") => {
    try {
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

      const blob = await telemetryApi.export(deviceId, {
        from: from.toISOString(),
        to: now.toISOString(),
        format,
      });

      // Download file
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
  };

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
      {/* Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium mb-2 block">
                {t("metric")}
              </label>
              <Select value={selectedMetric} onValueChange={setSelectedMetric}>
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
              <Select value={timeRange} onValueChange={setTimeRange}>
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

            <div className="flex items-end gap-2">
              <Button variant="outline" size="icon" onClick={loadData}>
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                onClick={() => handleExport("csv")}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                CSV
              </Button>
              <Button
                variant="outline"
                onClick={() => handleExport("json")}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                JSON
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      {stats.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground capitalize">
                  {stat.metric.replace(/_/g, " ")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-muted-foreground">
                    {t("average")}
                  </span>
                  <span className="text-lg font-bold">
                    {stat.avg.toFixed(2)}
                    {stat.unit && ` ${stat.unit}`}
                  </span>
                </div>
                <div className="flex items-baseline justify-between text-sm">
                  <span className="text-xs text-muted-foreground">
                    {t("min")}
                  </span>
                  <span>
                    {stat.min.toFixed(2)}
                    {stat.unit && ` ${stat.unit}`}
                  </span>
                </div>
                <div className="flex items-baseline justify-between text-sm">
                  <span className="text-xs text-muted-foreground">
                    {t("max")}
                  </span>
                  <span>
                    {stat.max.toFixed(2)}
                    {stat.unit && ` ${stat.unit}`}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground pt-2 border-t">
                  {stat.count} {t("readings")}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Chart Visualization */}
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
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground mb-2">
                {t("showing")} {readings.length} {t("readings")}
              </div>

              {/* Chart */}
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  {selectedMetric === "all" ? (
                    <LineChart data={prepareChartData()}>
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
                      {metrics.map((metric, index) => (
                        <Line
                          key={metric}
                          type="monotone"
                          dataKey={metric}
                          stroke={
                            getChartColors()[index % getChartColors().length]
                          }
                          strokeWidth={2}
                          dot={false}
                          name={metric.replace(/_/g, " ")}
                        />
                      ))}
                    </LineChart>
                  ) : (
                    <AreaChart data={prepareChartData()}>
                      <defs>
                        <linearGradient
                          id="colorValue"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#3b82f6"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor="#3b82f6"
                            stopOpacity={0}
                          />
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

              {/* Data Table */}
              <div className="max-h-96 overflow-y-auto border rounded mt-4">
                <table className="w-full text-sm">
                  <thead className="bg-muted sticky top-0">
                    <tr>
                      <th className="text-left p-2">{t("timestamp")}</th>
                      <th className="text-left p-2">{t("metric")}</th>
                      <th className="text-right p-2">{t("value")}</th>
                      <th className="text-left p-2">{t("unit")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {readings.map((reading, index) => (
                      <tr key={index} className="border-t hover:bg-muted/50">
                        <td className="p-2">
                          {new Date(reading.timestamp).toLocaleString()}
                        </td>
                        <td className="p-2 capitalize">
                          {reading.metric.replace(/_/g, " ")}
                        </td>
                        <td className="p-2 text-right font-mono">
                          {reading.valueBool !== undefined
                            ? reading.valueBool
                              ? t("true")
                              : t("false")
                            : reading.valueNum?.toFixed(2) || "N/A"}
                        </td>
                        <td className="p-2">{reading.unit || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
