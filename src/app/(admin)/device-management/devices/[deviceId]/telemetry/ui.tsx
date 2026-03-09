"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { qk } from "@/lib/api/queries";
import { apiFetchBrowser } from "@/lib/api/client/fetch";
import type { TelemetryDTO } from "@/lib/api/dto/telemetry.dto";
import type { DeviceDTO } from "@/lib/api/dto/devices.dto";
import { useTranslation } from "@/hooks/use-translation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Activity,
  Home as HomeIcon,
} from "lucide-react";

// Import sensor components and utilities
import {
  PZEMCards,
  MQ2Cards,
  FlameCards,
  UltrasonicCards,
  CurrentCards,
} from "./sensor-cards";
import {
  TemperatureHumidityCards,
  PressureCards,
  SoilMoistureCards,
  LightSensorCards,
} from "./sensor-cards-extended";
import {
  detectSensorType,
  hasSensorData,
  getSensorInfo,
  type SensorType,
} from "./sensor-detector";

function fmtDateTime(v?: string | null) {
  if (!v) return "-";
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? v : d.toLocaleString();
}

function formatValue(
  value: number | null | undefined,
  unit: string,
  decimals: number = 2,
) {
  if (value === null || value === undefined) return "-";
  return `${value.toFixed(decimals)} ${unit}`;
}

export function TelemetryClient() {
  const params = useParams();
  const router = useRouter();
  const { t } = useTranslation();
  const deviceId = Number(params.deviceId);

  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch device info
  const deviceQuery = useQuery({
    queryKey: qk.devices.detail(deviceId),
    queryFn: async () => {
      const payload = await apiFetchBrowser<{ data: DeviceDTO }>(
        `/api/v1/devices/${deviceId}`,
      );
      return payload.data;
    },
  });

  // Fetch latest telemetry
  const telemetryQuery = useQuery({
    queryKey: ["telemetry", deviceId],
    queryFn: async () => {
      const payload = await apiFetchBrowser<{ data: TelemetryDTO[] }>(
        `/api/v1/devices/${deviceId}/telemetry?limit=1`,
      );
      return payload.data?.[0] || null;
    },
    refetchInterval: autoRefresh ? 5000 : false, // Auto-refresh every 5 seconds
  });

  // Fetch telemetry history (last 10 readings)
  const historyQuery = useQuery({
    queryKey: ["telemetry-history", deviceId],
    queryFn: async () => {
      const payload = await apiFetchBrowser<{ data: TelemetryDTO[] }>(
        `/api/v1/devices/${deviceId}/telemetry?limit=10`,
      );
      return payload.data || [];
    },
    refetchInterval: autoRefresh ? 10000 : false,
  });

  const device = deviceQuery.data;
  const latestTelemetry = telemetryQuery.data;
  const history = historyQuery.data || [];

  // Detect sensor type and check if working
  const sensorType = detectSensorType(latestTelemetry || null);
  const isSensorWorking = hasSensorData(latestTelemetry || null);
  const sensorInfo = getSensorInfo(sensorType, t);

  const lastUpdate = latestTelemetry?.timestamp
    ? new Date(latestTelemetry.timestamp)
    : null;

  const timeSinceUpdate = lastUpdate
    ? Math.floor((Date.now() - lastUpdate.getTime()) / 1000)
    : null;

  // Determine sensor status
  const getSensorStatus = () => {
    if (!device?.status) {
      return {
        status: "offline",
        label: t("deviceOffline"),
        color: "text-red-600",
        icon: XCircle,
      };
    }
    if (!isSensorWorking) {
      return {
        status: "no-data",
        label: t("noSensorData"),
        color: "text-yellow-600",
        icon: AlertCircle,
      };
    }
    if (timeSinceUpdate && timeSinceUpdate > 60) {
      return {
        status: "stale",
        label: t("dataStale"),
        color: "text-orange-600",
        icon: AlertCircle,
      };
    }
    return {
      status: "active",
      label: t("sensorActive"),
      color: "text-green-600",
      icon: CheckCircle2,
    };
  };

  const sensorStatus = getSensorStatus();
  const StatusIcon = sensorStatus.icon;

  // Render sensor-specific cards based on detected type
  const renderSensorCards = () => {
    if (!isSensorWorking || !latestTelemetry) return null;

    switch (sensorType) {
      case "ENERGY_MONITOR":
        return <PZEMCards data={latestTelemetry} />;
      case "GAS_SENSOR":
        return <MQ2Cards data={latestTelemetry} />;
      case "FLAME_SENSOR":
        return <FlameCards data={latestTelemetry} />;
      case "ULTRASONIC":
        return <UltrasonicCards data={latestTelemetry} />;
      case "CURRENT_SENSOR":
        return <CurrentCards data={latestTelemetry} />;
      case "TEMPERATURE_HUMIDITY":
        return <TemperatureHumidityCards data={latestTelemetry} />;
      case "PRESSURE":
        return <PressureCards data={latestTelemetry} />;
      case "SOIL_MOISTURE":
        return <SoilMoistureCards data={latestTelemetry} />;
      case "LIGHT_SENSOR":
        return <LightSensorCards data={latestTelemetry} />;
      default:
        return (
          <Card className="rounded-2xl shadow-sm">
            <CardContent className="py-8 text-center text-muted-foreground">
              <AlertCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>{t("unknownSensorType")}</p>
            </CardContent>
          </Card>
        );
    }
  };

  // Get table columns based on sensor type
  const getTableColumns = () => {
    switch (sensorType) {
      case "ENERGY_MONITOR":
        return [
          { key: "voltageV", label: "Voltage", unit: "V", decimals: 2 },
          { key: "currentA", label: "Current", unit: "A", decimals: 3 },
          { key: "powerW", label: "Power", unit: "W", decimals: 2 },
          { key: "energyKwh", label: "Energy", unit: "kWh", decimals: 3 },
          { key: "frequencyHz", label: "Frequency", unit: "Hz", decimals: 1 },
          { key: "powerFactor", label: "PF", unit: "", decimals: 2 },
        ];
      case "GAS_SENSOR":
        return [
          { key: "gasPpm", label: "Gas PPM", unit: "ppm", decimals: 0 },
          { key: "gasAlarm", label: "Alarm", unit: "", decimals: 0 },
          { key: "gasAnalog", label: "Analog", unit: "", decimals: 0 },
        ];
      case "FLAME_SENSOR":
        return [
          { key: "flame", label: "Flame", unit: "", decimals: 0 },
          { key: "flameIntensity", label: "Intensity", unit: "%", decimals: 1 },
          { key: "analogValue", label: "Analog", unit: "", decimals: 0 },
          { key: "digitalValue", label: "Digital", unit: "", decimals: 0 },
        ];
      case "ULTRASONIC":
        return [
          { key: "distanceCm", label: "Distance", unit: "cm", decimals: 1 },
          { key: "binLevel", label: "Bin Level", unit: "%", decimals: 0 },
          { key: "binStatus", label: "Status", unit: "", decimals: 0 },
        ];
      case "CURRENT_SENSOR":
        return [{ key: "currentA", label: "Current", unit: "A", decimals: 3 }];
      default:
        return [];
    }
  };

  const tableColumns = getTableColumns();

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <button
          onClick={() => router.push("/device-management")}
          className="hover:text-foreground transition-colors flex items-center gap-1"
        >
          <HomeIcon className="h-4 w-4" />
          {t("deviceManagement")}
        </button>
        <span>/</span>
        <button
          onClick={() => router.push(`/device-management/devices/${deviceId}`)}
          className="hover:text-foreground transition-colors"
        >
          {t("device")} #{deviceId}
        </button>
        <span>/</span>
        <span className="text-foreground font-medium">{t("telemetry")}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            {device?.deviceName || `${t("device")} ${deviceId}`}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("sensorTelemetry")} - {t("realTimeMonitoring")}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              telemetryQuery.refetch();
              historyQuery.refetch();
            }}
            disabled={telemetryQuery.isFetching}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${telemetryQuery.isFetching ? "animate-spin" : ""}`}
            />
            {t("refresh")}
          </Button>

          <Button
            variant={autoRefresh ? "default" : "outline"}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <Activity className="mr-2 h-4 w-4" />
            {autoRefresh ? t("autoRefreshOn") : t("autoRefreshOff")}
          </Button>
        </div>
      </div>

      {/* Info Card - What is Telemetry */}
      <Card className="rounded-2xl shadow-sm border-2 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-300 dark:border-blue-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2 text-blue-900 dark:text-blue-100">
            <AlertCircle className="h-4 w-4" />
            {t("whatIsTelemetry")}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-xs space-y-2 text-blue-800 dark:text-blue-200">
          <p>
            <strong>Telemetry</strong> {t("telemetryDescription")}
          </p>
          <div>
            <p className="font-semibold mb-1">{sensorInfo.description}</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {sensorInfo.metrics.map((metric, idx) => (
                <div key={idx}>{metric}</div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sensor Status Card */}
      <Card className="rounded-2xl shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <StatusIcon className={`h-5 w-5 ${sensorStatus.color}`} />
            {t("sensorStatusLabel")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">{t("status")}</p>
              <p className={`text-lg font-semibold ${sensorStatus.color}`}>
                {sensorStatus.label}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                {t("deviceStatus")}
              </p>
              <Badge variant={device?.status ? "default" : "destructive"}>
                {device?.status ? t("online") : t("offline")}
              </Badge>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">{t("lastUpdate")}</p>
              <p className="text-sm font-medium">
                {lastUpdate ? (
                  <>
                    {timeSinceUpdate! < 60
                      ? `${timeSinceUpdate} ${t("secondsAgo")}`
                      : `${Math.floor(timeSinceUpdate! / 60)} ${t("minutesAgo")}`}
                  </>
                ) : (
                  "-"
                )}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">{t("dataPoints")}</p>
              <p className="text-sm font-medium">
                {isSensorWorking ? tableColumns.length : 0} {t("metrics")}
              </p>
            </div>
          </div>

          {!device?.status && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">
                {t("deviceOfflineWarning")}
              </p>
            </div>
          )}

          {device?.status && !isSensorWorking && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-700">
                {t("noSensorDataWarning")}
              </p>
            </div>
          )}

          {device?.status &&
            isSensorWorking &&
            timeSinceUpdate &&
            timeSinceUpdate > 60 && (
              <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-sm text-orange-700">
                  {t("staleSensorDataWarning").replace(
                    "{minutes}",
                    String(Math.floor(timeSinceUpdate / 60)),
                  )}
                </p>
              </div>
            )}
        </CardContent>
      </Card>

      {/* Latest Readings - Dynamic based on sensor type */}
      {renderSensorCards()}

      {/* Debug Info - Raw Data */}
      {latestTelemetry && (
        <Card className="rounded-2xl shadow-sm border-2 border-yellow-300 dark:border-yellow-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2 text-yellow-900 dark:text-yellow-100">
              <AlertCircle className="h-4 w-4" />
              {t("debugRawData")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-3 rounded overflow-x-auto">
              {JSON.stringify(latestTelemetry, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Telemetry History */}
      <Card className="rounded-2xl shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-5 w-5" />
            {t("recentReadings")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {historyQuery.isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>{t("noTelemetryData")}</p>
              <p className="text-sm mt-1">{t("telemetryWillAppear")}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">{t("time")}</th>
                    {tableColumns.map((col) => (
                      <th key={col.key} className="text-right p-2">
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {history.map((item, idx) => (
                    <tr key={idx} className="border-b hover:bg-muted/50">
                      <td className="p-2">{fmtDateTime(item.timestamp)}</td>
                      {tableColumns.map((col) => {
                        const value = item[col.key as keyof TelemetryDTO];
                        let displayValue = "-";

                        if (value !== null && value !== undefined) {
                          if (typeof value === "number") {
                            displayValue =
                              `${value.toFixed(col.decimals)} ${col.unit}`.trim();
                          } else if (typeof value === "boolean") {
                            displayValue = value ? "Yes" : "No";
                          } else {
                            displayValue = String(value);
                          }
                        }

                        return (
                          <td
                            key={col.key}
                            className="text-right p-2 font-mono"
                          >
                            {displayValue}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
