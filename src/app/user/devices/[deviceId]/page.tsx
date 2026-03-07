"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { devicesApi, DeviceWithDetails } from "@/lib/api/client/devices";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Wifi,
  WifiOff,
  MapPin,
  Home,
  Cpu,
  Activity,
} from "lucide-react";
import { toast } from "sonner";
import { DeviceControl } from "@/app/user/devices/device-control";
import { SensorCard } from "@/app/user/devices/sensor-card";
import { useTranslation } from "@/hooks/use-translation";

interface TelemetryData {
  voltage?: number;
  current?: number;
  power?: number;
  temperature?: number;
  humidity?: number;
  timestamp: string;
}

export default function DeviceDetailPage() {
  const { t } = useTranslation();
  const params = useParams();
  const router = useRouter();
  const deviceId = parseInt(params.deviceId as string);

  const [device, setDevice] = useState<DeviceWithDetails | null>(null);
  const [telemetry, setTelemetry] = useState<TelemetryData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDevice();
    loadTelemetry();
    // Poll telemetry every 5 seconds
    const interval = setInterval(loadTelemetry, 5000);
    return () => clearInterval(interval);
  }, [deviceId]);

  const loadDevice = async () => {
    setIsLoading(true);
    try {
      const data = await devicesApi.getById(deviceId);
      setDevice(data);
    } catch (error: any) {
      toast.error(error.message || t("failedLoadDevice"));
      router.push("/user/devices");
    } finally {
      setIsLoading(false);
    }
  };

  const loadTelemetry = async () => {
    try {
      const response = await fetch(`/api/v1/devices/${deviceId}/telemetry`);
      if (response.ok) {
        const data = await response.json();
        setTelemetry(data.data || []);
      }
    } catch (error) {
      // Silent fail for telemetry
      console.error("Failed to load telemetry:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ONLINE":
        return "bg-green-500";
      case "OFFLINE":
        return "bg-gray-500";
      case "ERROR":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ONLINE":
        return (
          <Badge className="bg-green-600 flex items-center gap-1">
            <Wifi className="h-3 w-3" />
            {t("online")}
          </Badge>
        );
      case "OFFLINE":
        return (
          <Badge variant="secondary" className="flex items-center gap-1">
            <WifiOff className="h-3 w-3" />
            {t("offline")}
          </Badge>
        );
      case "ERROR":
        return <Badge variant="destructive">{t("error")}</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getLatestTelemetry = () => {
    if (telemetry.length === 0) return null;
    return telemetry[0];
  };

  const getSensorStatus = (value: number, type: string) => {
    if (type === "temperature") {
      if (value > 35) return { status: "danger", label: t("danger") };
      if (value > 30) return { status: "warning", label: t("warning") };
      return { status: "safe", label: t("safe") };
    }
    if (type === "humidity") {
      if (value > 80 || value < 30)
        return { status: "warning", label: t("warning") };
      return { status: "safe", label: t("safe") };
    }
    if (type === "power") {
      if (value > 2000) return { status: "danger", label: t("danger") };
      if (value > 1500) return { status: "warning", label: t("warning") };
      return { status: "safe", label: t("safe") };
    }
    return { status: "safe", label: t("safe") };
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-[300px]" />
          <Skeleton className="h-[300px]" />
        </div>
      </div>
    );
  }

  if (!device) {
    return null;
  }

  const latestData = getLatestTelemetry();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/user/devices")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{device.name}</h1>
          <p className="text-muted-foreground">{device.type}</p>
        </div>
        {getStatusBadge(device.status)}
      </div>

      {/* Device Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cpu className="h-5 w-5 text-primary" />
            {t("deviceInfo")}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Home className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">{t("home")}:</span>
              <span className="font-medium">{device.home?.name || "-"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">{t("room")}:</span>
              <span className="font-medium">{device.room?.name || "-"}</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-sm">
              <span className="text-muted-foreground">
                {t("firmwareVersion")}:
              </span>
              <span className="ml-2 font-medium">
                {device.firmwareVersion || "-"}
              </span>
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">{t("lastSeen")}:</span>
              <span className="ml-2 font-medium">
                {device.lastSeenAt
                  ? new Date(device.lastSeenAt).toLocaleString("id-ID")
                  : "-"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Device Control */}
        <DeviceControl
          deviceId={device.id}
          deviceType={device.type}
          deviceName={device.name}
          currentState={latestData}
        />

        {/* Live Monitoring */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              {t("liveMonitoring")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {latestData ? (
              <div className="space-y-4">
                {latestData.temperature !== undefined && (
                  <SensorCard
                    title={t("temperature")}
                    value={latestData.temperature}
                    unit="°C"
                    status={
                      getSensorStatus(latestData.temperature, "temperature")
                        .status as any
                    }
                    statusLabel={
                      getSensorStatus(latestData.temperature, "temperature")
                        .label
                    }
                    trend="stable"
                    lastUpdate={new Date(latestData.timestamp)}
                    onClick={() => {}}
                    compact
                  />
                )}
                {latestData.humidity !== undefined && (
                  <SensorCard
                    title={t("humidity")}
                    value={latestData.humidity}
                    unit="%"
                    status={
                      getSensorStatus(latestData.humidity, "humidity")
                        .status as any
                    }
                    statusLabel={
                      getSensorStatus(latestData.humidity, "humidity").label
                    }
                    trend="stable"
                    lastUpdate={new Date(latestData.timestamp)}
                    onClick={() => {}}
                    compact
                  />
                )}
                {latestData.power !== undefined && (
                  <SensorCard
                    title={t("powerUsage")}
                    value={latestData.power}
                    unit="W"
                    status={
                      getSensorStatus(latestData.power, "power").status as any
                    }
                    statusLabel={
                      getSensorStatus(latestData.power, "power").label
                    }
                    trend="stable"
                    lastUpdate={new Date(latestData.timestamp)}
                    onClick={() => {}}
                    compact
                  />
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>{t("noTelemetryData")}</p>
                <p className="text-sm mt-1">{t("telemetryWillAppear")}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Telemetry History */}
      {telemetry.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t("telemetryData")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4">{t("timestamp")}</th>
                    {telemetry[0].voltage !== undefined && (
                      <th className="text-right py-2 px-4">{t("voltage")}</th>
                    )}
                    {telemetry[0].current !== undefined && (
                      <th className="text-right py-2 px-4">{t("current")}</th>
                    )}
                    {telemetry[0].power !== undefined && (
                      <th className="text-right py-2 px-4">{t("power")}</th>
                    )}
                    {telemetry[0].temperature !== undefined && (
                      <th className="text-right py-2 px-4">
                        {t("temperature")}
                      </th>
                    )}
                    {telemetry[0].humidity !== undefined && (
                      <th className="text-right py-2 px-4">{t("humidity")}</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {telemetry.slice(0, 10).map((data, index) => (
                    <tr key={index} className="border-b hover:bg-muted/50">
                      <td className="py-2 px-4">
                        {new Date(data.timestamp).toLocaleString("id-ID")}
                      </td>
                      {data.voltage !== undefined && (
                        <td className="text-right py-2 px-4">
                          {data.voltage.toFixed(2)} V
                        </td>
                      )}
                      {data.current !== undefined && (
                        <td className="text-right py-2 px-4">
                          {data.current.toFixed(2)} A
                        </td>
                      )}
                      {data.power !== undefined && (
                        <td className="text-right py-2 px-4">
                          {data.power.toFixed(2)} W
                        </td>
                      )}
                      {data.temperature !== undefined && (
                        <td className="text-right py-2 px-4">
                          {data.temperature.toFixed(1)} °C
                        </td>
                      )}
                      {data.humidity !== undefined && (
                        <td className="text-right py-2 px-4">
                          {data.humidity.toFixed(1)} %
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
