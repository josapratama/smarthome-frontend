"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { qk } from "@/lib/api/queries";
import { apiFetchBrowser } from "@/lib/api/client/fetch";
import type { TelemetryDTO } from "@/lib/api/dto/telemetry.dto";
import type { DeviceDTO } from "@/lib/api/dto/devices.dto";
import { useTranslation } from "@/hooks/use-translation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Activity,
  Home as HomeIcon,
} from "lucide-react";

import {
  detectSensorType,
  hasSensorData,
  getTableColumns,
} from "../lib/sensor-detector";
import { SensorReadings } from "./sensor-readings";
import { HistoryTable } from "./history-table";

interface TelemetryViewProps {
  deviceId: number;
}

export function TelemetryView({ deviceId }: TelemetryViewProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const [autoRefresh, setAutoRefresh] = useState(true);

  // ── Queries ──────────────────────────────────────────────────
  const deviceQuery = useQuery({
    queryKey: qk.devices.detail(deviceId),
    queryFn: async () => {
      const res = await apiFetchBrowser<{ data: DeviceDTO }>(
        `/api/v1/devices/${deviceId}`,
      );
      return res.data;
    },
  });

  const latestQuery = useQuery({
    queryKey: ["telemetry-latest", deviceId],
    queryFn: async () => {
      const res = await apiFetchBrowser<{ data: TelemetryDTO[] }>(
        `/api/v1/devices/${deviceId}/telemetry?limit=1`,
      );
      return res.data?.[0] ?? null;
    },
    refetchInterval: autoRefresh ? 5_000 : false,
  });

  const historyQuery = useQuery({
    queryKey: ["telemetry-history", deviceId],
    queryFn: async () => {
      const res = await apiFetchBrowser<{ data: TelemetryDTO[] }>(
        `/api/v1/devices/${deviceId}/telemetry?limit=10`,
      );
      return res.data ?? [];
    },
    refetchInterval: autoRefresh ? 10_000 : false,
  });

  // ── Derived state ─────────────────────────────────────────────
  const device = deviceQuery.data;
  const latest = latestQuery.data ?? null;
  const history = historyQuery.data ?? [];

  const sensorType = detectSensorType(latest);
  const hasData = hasSensorData(latest);
  const columns = getTableColumns(sensorType);

  const lastUpdate = latest?.timestamp ? new Date(latest.timestamp) : null;
  const secondsSince = lastUpdate
    ? Math.floor((Date.now() - lastUpdate.getTime()) / 1000)
    : null;

  // ── Status ────────────────────────────────────────────────────
  const getStatus = () => {
    if (!device?.status)
      return {
        label: t("deviceOffline"),
        color: "text-red-600",
        icon: XCircle,
      };
    if (!hasData)
      return {
        label: t("noSensorData"),
        color: "text-yellow-600",
        icon: AlertCircle,
      };
    if (secondsSince && secondsSince > 60)
      return {
        label: t("dataStale"),
        color: "text-orange-600",
        icon: AlertCircle,
      };
    return {
      label: t("sensorActive"),
      color: "text-green-600",
      icon: CheckCircle2,
    };
  };

  const status = getStatus();
  const StatusIcon = status.icon;

  function handleRefresh() {
    latestQuery.refetch();
    historyQuery.refetch();
  }

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
            {device?.deviceName ?? `${t("device")} ${deviceId}`}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("sensorTelemetry")} — {t("realTimeMonitoring")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={latestQuery.isFetching}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${latestQuery.isFetching ? "animate-spin" : ""}`}
            />
            {t("refresh")}
          </Button>
          <Button
            variant={autoRefresh ? "default" : "outline"}
            size="sm"
            onClick={() => setAutoRefresh((v) => !v)}
          >
            <Activity className="mr-2 h-4 w-4" />
            {autoRefresh ? t("autoRefreshOn") : t("autoRefreshOff")}
          </Button>
        </div>
      </div>

      {/* Status card */}
      <Card className="rounded-2xl shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <StatusIcon className={`h-5 w-5 ${status.color}`} />
            {t("sensorStatusLabel")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">{t("status")}</p>
              <p className={`text-base font-semibold ${status.color}`}>
                {status.label}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">
                {t("deviceStatus")}
              </p>
              <Badge variant={device?.status ? "default" : "destructive"}>
                {device?.status ? t("online") : t("offline")}
              </Badge>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t("lastUpdate")}</p>
              <p className="text-sm font-medium">
                {secondsSince != null
                  ? secondsSince < 60
                    ? `${secondsSince} ${t("secondsAgo")}`
                    : `${Math.floor(secondsSince / 60)} ${t("minutesAgo")}`
                  : "-"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t("dataPoints")}</p>
              <p className="text-sm font-medium">
                {hasData ? columns.length : 0} {t("metrics")}
              </p>
            </div>
          </div>

          {/* Warning banners */}
          {!device?.status && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-700 dark:text-red-300">
                {t("deviceOfflineWarning")}
              </p>
            </div>
          )}
          {device?.status && !hasData && (
            <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                {t("noSensorDataWarning")}
              </p>
            </div>
          )}
          {device?.status && hasData && secondsSince && secondsSince > 60 && (
            <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-lg">
              <p className="text-sm text-orange-700 dark:text-orange-300">
                {t("staleSensorDataWarning").replace(
                  "{minutes}",
                  String(Math.floor(secondsSince / 60)),
                )}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sensor readings */}
      {hasData && latest && (
        <SensorReadings data={latest} sensorType={sensorType} />
      )}

      {/* Raw data (debug) */}
      {latest && (
        <Card className="rounded-2xl shadow-sm border-yellow-300 dark:border-yellow-700 border-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2 text-yellow-900 dark:text-yellow-100">
              <AlertCircle className="h-4 w-4" />
              {t("debugRawData")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
              {JSON.stringify(latest, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* History table */}
      <HistoryTable
        history={history}
        columns={columns}
        isLoading={historyQuery.isLoading}
      />
    </div>
  );
}
