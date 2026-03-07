"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UserInvites } from "@/app/user/invites/user-invites";
import { SensorCard } from "@/app/user/devices/sensor-card";
import { homesApi, Home } from "@/lib/api/client/homes";
import { devicesApi, DeviceWithDetails } from "@/lib/api/client/devices";
import { devicesApi as devicesApiV1 } from "@/lib/api/devices";
import type { SensorData } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Home as HomeIcon,
  Smartphone,
  Wifi,
  AlertCircle,
  TrendingUp,
  Activity,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/use-translation";
import { PageHeader } from "@/components/ui/page-header";

interface SensorDevice {
  id: string;
  type: "power" | "temperature" | "humidity";
  deviceName: string;
  value: number;
  unit: string;
  status: "safe" | "warning" | "danger";
  trend: "up" | "down" | "stable";
  lastUpdate: Date;
}

export default function UserDashboardPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [homes, setHomes] = useState<Home[]>([]);
  const [devices, setDevices] = useState<DeviceWithDetails[]>([]);
  const [sensorDevices, setSensorDevices] = useState<SensorDevice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
    // Auto refresh every 30 seconds
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [homesData, devicesData] = await Promise.all([
        homesApi.list(),
        devicesApi.list(),
      ]);
      setHomes(homesData);
      setDevices(devicesData);

      // Load telemetry data for all devices
      if (devicesData.length > 0) {
        const telemetryMap = await devicesApiV1.getAllLatestTelemetry();
        const sensors = convertTelemetryToSensors(devicesData, telemetryMap);
        setSensorDevices(sensors);
      }
    } catch (error: any) {
      toast.error(
        error.message ||
          t("failedToLoadDashboard") ||
          "Failed to load dashboard data",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const convertTelemetryToSensors = (
    devices: DeviceWithDetails[],
    telemetryMap: Record<number, SensorData>,
  ): SensorDevice[] => {
    const sensors: SensorDevice[] = [];

    devices.forEach((device) => {
      const telemetry = telemetryMap[device.id];
      if (!telemetry) return;

      // Power sensor (using powerW)
      if (telemetry.powerW !== null && telemetry.powerW !== undefined) {
        const powerValue = telemetry.powerW / 1000; // Convert W to kW
        sensors.push({
          id: `${device.id}-power`,
          type: "power",
          deviceName: `${device.name} - ${t("power") || "Power"}`,
          value: Number(powerValue.toFixed(2)),
          unit: "kW",
          status:
            powerValue > 3.5 ? "danger" : powerValue > 2.0 ? "warning" : "safe",
          trend: "stable",
          lastUpdate: new Date(telemetry.timestamp),
        });
      }

      // Current sensor (can be used as temperature alternative)
      if (telemetry.current !== null && telemetry.current !== undefined) {
        const currentValue = telemetry.current;
        sensors.push({
          id: `${device.id}-current`,
          type: "temperature", // Using temperature type for display
          deviceName: `${device.name} - ${t("current") || "Current"}`,
          value: Number(currentValue.toFixed(2)),
          unit: "A",
          status: currentValue > 30 || currentValue < 1 ? "warning" : "safe",
          trend: "stable",
          lastUpdate: new Date(telemetry.timestamp),
        });
      }

      // Gas sensor (can be used as humidity alternative)
      if (telemetry.gasPpm !== null && telemetry.gasPpm !== undefined) {
        const gasValue = telemetry.gasPpm;
        sensors.push({
          id: `${device.id}-gas`,
          type: "humidity", // Using humidity type for display
          deviceName: `${device.name} - ${t("gas") || "Gas"}`,
          value: Number(gasValue.toFixed(0)),
          unit: "ppm",
          status:
            gasValue > 1000 ? "danger" : gasValue > 500 ? "warning" : "safe",
          trend: "stable",
          lastUpdate: new Date(telemetry.timestamp),
        });
      }

      // Distance sensor
      if (telemetry.distanceCm !== null && telemetry.distanceCm !== undefined) {
        const distanceValue = telemetry.distanceCm;
        sensors.push({
          id: `${device.id}-distance`,
          type: "humidity", // Using humidity type for display
          deviceName: `${device.name} - ${t("distance") || "Distance"}`,
          value: Number(distanceValue.toFixed(1)),
          unit: "cm",
          status: distanceValue < 10 ? "warning" : "safe",
          trend: "stable",
          lastUpdate: new Date(telemetry.timestamp),
        });
      }

      // Voltage sensor
      if (telemetry.voltageV !== null && telemetry.voltageV !== undefined) {
        const voltageValue = telemetry.voltageV;
        sensors.push({
          id: `${device.id}-voltage`,
          type: "temperature", // Using temperature type for display
          deviceName: `${device.name} - ${t("voltage") || "Voltage"}`,
          value: Number(voltageValue.toFixed(1)),
          unit: "V",
          status: voltageValue > 250 || voltageValue < 200 ? "warning" : "safe",
          trend: "stable",
          lastUpdate: new Date(telemetry.timestamp),
        });
      }
    });

    return sensors.slice(0, 8); // Limit to 8 sensors for dashboard
  };

  const onlineDevices = devices.filter((d) => d.status === "ONLINE");
  const offlineDevices = devices.filter((d) => d.status === "OFFLINE");
  const errorDevices = devices.filter((d) => d.status === "ERROR");

  const homesCount = homes?.length || 0;
  const devicesCount = devices?.length || 0;

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <PageHeader
        stats={[
          {
            label: t("totalHomes"),
            value: homesCount,
            icon: HomeIcon,
            color: "text-blue-500",
          },
          {
            label: t("totalDevices"),
            value: devicesCount,
            icon: Smartphone,
            color: "text-purple-500",
          },
          {
            label: t("onlineDevices"),
            value: onlineDevices.length,
            icon: Wifi,
            color: "text-green-500",
          },
          {
            label: t("offlineDevices"),
            value: offlineDevices.length,
            icon: AlertCircle,
            color: offlineDevices.length > 0 ? "text-red-500" : "text-gray-400",
          },
        ]}
      />

      <UserInvites />

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-[100px] md:h-[120px] rounded-xl" />
          ))}
        </div>
      ) : (
        <>
          {/* Sensor Monitoring Section */}
          {sensorDevices.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold">
                    {t("liveMonitoring") || "Live Monitoring"}
                  </h2>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    {t("realTimeSensorData") ||
                      "Real-time sensor data from your devices"}
                  </p>
                </div>
                <Badge variant="outline" className="gap-1">
                  <Activity className="h-3 w-3 animate-pulse text-green-600" />
                  <span className="text-xs">{t("live") || "Live"}</span>
                </Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                {sensorDevices.map((sensor) => (
                  <SensorCard
                    key={sensor.id}
                    type={sensor.type}
                    deviceName={sensor.deviceName}
                    value={sensor.value}
                    unit={sensor.unit}
                    status={sensor.status}
                    trend={sensor.trend}
                    lastUpdate={sensor.lastUpdate}
                    onClick={() => {
                      const deviceId = sensor.id.split("-")[0];
                      router.push(`/user/devices/${deviceId}`);
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          {homesCount === 0 && devicesCount === 0 && (
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="text-6xl">🏠</div>
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-lg md:text-xl font-bold mb-2">
                      {t("getStartedSmartHome") ||
                        "Get Started with Smart Home"}
                    </h3>
                    <ul className="space-y-1.5 text-sm text-muted-foreground mb-4">
                      <li className="flex items-center gap-2">
                        <span className="text-primary">✓</span>
                        {t("createHomeAddRooms") ||
                          "Create a home and add rooms"}
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-primary">✓</span>
                        {t("pairESP32Devices") || "Pair your ESP32 IoT devices"}
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-primary">✓</span>
                        {t("monitorRealTimeTelemetry") ||
                          "Monitor real-time telemetry"}
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-primary">✓</span>
                        {t("controlDevicesRemotely") ||
                          "Control devices remotely"}
                      </li>
                    </ul>
                    <Link href="/user/homes">
                      <Button size="lg" className="gap-2">
                        <HomeIcon className="h-4 w-4" />
                        {t("createFirstHome") || "Create Your First Home"}
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Homes Overview */}
          {homesCount > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl md:text-2xl font-bold">
                  {t("yourHomes") || "Your Homes"}
                </h2>
                {homesCount > 3 && (
                  <Link href="/user/homes">
                    <Button variant="ghost" size="sm" className="gap-1">
                      {t("viewAll") || "View All"}
                      <TrendingUp className="h-3 w-3" />
                    </Button>
                  </Link>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                {homes?.slice(0, 3).map((home) => {
                  const homeDevices = devices.filter(
                    (d) => d.homeId === home.id,
                  );
                  const homeOnline = homeDevices.filter(
                    (d) => d.status === "ONLINE",
                  );
                  const homeOffline = homeDevices.filter(
                    (d) => d.status === "OFFLINE",
                  );

                  return (
                    <Link key={home.id} href={`/user/homes/${home.id}`}>
                      <Card className="hover:shadow-lg transition-all hover:scale-[1.02] cursor-pointer border-2">
                        <CardHeader className="pb-3">
                          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                            <div className="p-2 rounded-lg bg-primary/10">
                              <HomeIcon className="h-5 w-5 text-primary" />
                            </div>
                            <span className="truncate">{home.name}</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                              {t("devices") || "Devices"}
                            </span>
                            <span className="font-semibold">
                              {homeDevices.length}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-xs">
                            <div className="flex items-center gap-1.5">
                              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                              <span className="text-muted-foreground">
                                {homeOnline.length} {t("online") || "online"}
                              </span>
                            </div>
                            {homeOffline.length > 0 && (
                              <div className="flex items-center gap-1.5">
                                <div className="h-2 w-2 rounded-full bg-gray-400" />
                                <span className="text-muted-foreground">
                                  {homeOffline.length}{" "}
                                  {t("offline") || "offline"}
                                </span>
                              </div>
                            )}
                          </div>
                          {home.addressText && (
                            <p className="text-xs text-muted-foreground truncate">
                              📍 {home.addressText}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Energy Overview */}
          {devicesCount > 0 && (
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-600" />
                  {t("energyOverview") || "Energy Overview"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      {t("today") || "Today"}
                    </p>
                    <p className="text-2xl font-bold">
                      12.5{" "}
                      <span className="text-sm font-normal text-muted-foreground">
                        kWh
                      </span>
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      {t("thisWeek") || "This Week"}
                    </p>
                    <p className="text-2xl font-bold">
                      87.3{" "}
                      <span className="text-sm font-normal text-muted-foreground">
                        kWh
                      </span>
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      {t("thisMonth") || "This Month"}
                    </p>
                    <p className="text-2xl font-bold">
                      342{" "}
                      <span className="text-sm font-normal text-muted-foreground">
                        kWh
                      </span>
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      {t("cost") || "Cost"}
                    </p>
                    <p className="text-2xl font-bold">
                      $45{" "}
                      <span className="text-sm font-normal text-muted-foreground">
                        /mo
                      </span>
                    </p>
                  </div>
                </div>
                <Link href="/user/energy">
                  <Button variant="outline" size="sm" className="w-full mt-4">
                    {t("viewDetailedReport") || "View Detailed Report"}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
