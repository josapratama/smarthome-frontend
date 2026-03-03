"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UserInvites } from "@/components/invites/user-invites";
import { SensorCard } from "@/components/user/sensor-card";
import { homesApi, Home } from "@/lib/api/client/homes";
import { devicesApi, DeviceWithDetails } from "@/lib/api/client/devices";
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

export default function UserDashboardPage() {
  const router = useRouter();
  const [homes, setHomes] = useState<Home[]>([]);
  const [devices, setDevices] = useState<DeviceWithDetails[]>([]);
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
    } catch (error: any) {
      toast.error(error.message || "Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  const onlineDevices = devices.filter((d) => d.status === "ONLINE");
  const offlineDevices = devices.filter((d) => d.status === "OFFLINE");
  const errorDevices = devices.filter((d) => d.status === "ERROR");

  const homesCount = homes?.length || 0;
  const devicesCount = devices?.length || 0;

  // Mock sensor data - TODO: Replace with real telemetry data
  const sensorDevices = [
    {
      id: "1",
      type: "power" as const,
      deviceName: "Living Room Power",
      value: 2.5,
      unit: "kW",
      status: "warning" as const,
      trend: "up" as const,
      lastUpdate: new Date(Date.now() - 30000),
    },
    {
      id: "2",
      type: "temperature" as const,
      deviceName: "Bedroom Temp",
      value: 24.5,
      unit: "°C",
      status: "safe" as const,
      trend: "stable" as const,
      lastUpdate: new Date(Date.now() - 15000),
    },
    {
      id: "3",
      type: "humidity" as const,
      deviceName: "Kitchen Humidity",
      value: 65,
      unit: "%",
      status: "safe" as const,
      trend: "down" as const,
      lastUpdate: new Date(Date.now() - 45000),
    },
    {
      id: "4",
      type: "power" as const,
      deviceName: "AC Power Meter",
      value: 3.8,
      unit: "kW",
      status: "danger" as const,
      trend: "up" as const,
      lastUpdate: new Date(Date.now() - 10000),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold mb-1">
          Welcome Back! 👋
        </h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Monitor and control your smart home devices
        </p>
      </div>

      <UserInvites />

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-[100px] md:h-[120px] rounded-xl" />
          ))}
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <Link href="/user/homes">
              <Card className="hover:shadow-lg transition-all hover:scale-[1.02] cursor-pointer border-2">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs md:text-sm font-medium">
                    Homes
                  </CardTitle>
                  <HomeIcon className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl md:text-3xl font-bold">
                    {homesCount}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {homesCount === 0 ? "Add home" : "Active"}
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/user/devices">
              <Card className="hover:shadow-lg transition-all hover:scale-[1.02] cursor-pointer border-2">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs md:text-sm font-medium">
                    Devices
                  </CardTitle>
                  <Smartphone className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl md:text-3xl font-bold">
                    {devicesCount}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {devicesCount === 0 ? "Pair device" : "Registered"}
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Card className="border-2 border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs md:text-sm font-medium">
                  Online
                </CardTitle>
                <Wifi className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl md:text-3xl font-bold text-green-600">
                  {onlineDevices.length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {offlineDevices.length} offline
                </p>
              </CardContent>
            </Card>

            <Link href="/user/alarms">
              <Card
                className={`hover:shadow-lg transition-all hover:scale-[1.02] cursor-pointer border-2 ${
                  errorDevices.length > 0
                    ? "border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20"
                    : "border-gray-200 dark:border-gray-800"
                }`}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs md:text-sm font-medium">
                    Alerts
                  </CardTitle>
                  <AlertCircle
                    className={`h-4 w-4 ${errorDevices.length > 0 ? "text-red-600" : "text-gray-600"}`}
                  />
                </CardHeader>
                <CardContent>
                  <div
                    className={`text-2xl md:text-3xl font-bold ${errorDevices.length > 0 ? "text-red-600" : ""}`}
                  >
                    {errorDevices.length}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {errorDevices.length === 0 ? "All good" : "Need attention"}
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Sensor Monitoring Section */}
          {sensorDevices.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold">
                    Live Monitoring
                  </h2>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Real-time sensor data from your devices
                  </p>
                </div>
                <Badge variant="outline" className="gap-1">
                  <Activity className="h-3 w-3 animate-pulse text-green-600" />
                  <span className="text-xs">Live</span>
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
                    onClick={() => router.push(`/user/devices/${sensor.id}`)}
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
                      Get Started with Smart Home
                    </h3>
                    <ul className="space-y-1.5 text-sm text-muted-foreground mb-4">
                      <li className="flex items-center gap-2">
                        <span className="text-primary">✓</span>
                        Create a home and add rooms
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-primary">✓</span>
                        Pair your ESP32 IoT devices
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-primary">✓</span>
                        Monitor real-time telemetry
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-primary">✓</span>
                        Control devices remotely
                      </li>
                    </ul>
                    <Link href="/user/homes">
                      <Button size="lg" className="gap-2">
                        <HomeIcon className="h-4 w-4" />
                        Create Your First Home
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
                <h2 className="text-xl md:text-2xl font-bold">Your Homes</h2>
                {homesCount > 3 && (
                  <Link href="/user/homes">
                    <Button variant="ghost" size="sm" className="gap-1">
                      View All
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
                              Devices
                            </span>
                            <span className="font-semibold">
                              {homeDevices.length}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-xs">
                            <div className="flex items-center gap-1.5">
                              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                              <span className="text-muted-foreground">
                                {homeOnline.length} online
                              </span>
                            </div>
                            {homeOffline.length > 0 && (
                              <div className="flex items-center gap-1.5">
                                <div className="h-2 w-2 rounded-full bg-gray-400" />
                                <span className="text-muted-foreground">
                                  {homeOffline.length} offline
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
                  Energy Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Today</p>
                    <p className="text-2xl font-bold">
                      12.5{" "}
                      <span className="text-sm font-normal text-muted-foreground">
                        kWh
                      </span>
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      This Week
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
                      This Month
                    </p>
                    <p className="text-2xl font-bold">
                      342{" "}
                      <span className="text-sm font-normal text-muted-foreground">
                        kWh
                      </span>
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Cost</p>
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
                    View Detailed Report
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
