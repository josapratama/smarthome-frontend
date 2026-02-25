"use client";

import { useEffect, useState } from "react";
import { UserInvites } from "@/components/invites/user-invites";
import { homesApi, Home } from "@/lib/api/client/homes";
import { devicesApi, DeviceWithDetails } from "@/lib/api/client/devices";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Home as HomeIcon, Smartphone, Wifi, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function UserDashboardPage() {
  const [homes, setHomes] = useState<Home[]>([]);
  const [devices, setDevices] = useState<DeviceWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your Smart Home dashboard
        </p>
      </div>

      <UserInvites />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-[120px] rounded-lg" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/user/homes">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Homes
                  </CardTitle>
                  <HomeIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{homesCount}</div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {homesCount === 0
                      ? "Create your first home"
                      : `${homesCount} ${homesCount === 1 ? "home" : "homes"} configured`}
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/user/devices">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Devices
                  </CardTitle>
                  <Smartphone className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{devicesCount}</div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {devicesCount === 0
                      ? "No devices paired yet"
                      : `${devicesCount} ${devicesCount === 1 ? "device" : "devices"} registered`}
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Online Devices
                </CardTitle>
                <Wifi className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {onlineDevices.length}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {offlineDevices.length} offline
                </p>
              </CardContent>
            </Card>

            <Link href="/user/alarms">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Device Errors
                  </CardTitle>
                  <AlertCircle className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-600">
                    {errorDevices.length}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {errorDevices.length === 0
                      ? "All systems normal"
                      : "Devices need attention"}
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>

          {homesCount === 0 && devicesCount === 0 && (
            <div className="mt-6 bg-primary/10 border border-primary/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2">Getting Started</h3>
              <ul className="space-y-2 text-sm text-foreground mb-4">
                <li>1. Create a home and add rooms</li>
                <li>2. Pair your ESP32 devices using device key</li>
                <li>3. Monitor real-time telemetry data</li>
                <li>4. Control devices remotely</li>
                <li>5. Track energy consumption</li>
              </ul>
              <Link href="/user/homes">
                <Button>Create Your First Home</Button>
              </Link>
            </div>
          )}

          {homesCount > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Your Homes</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {homes?.slice(0, 3).map((home) => {
                  const homeDevices = devices.filter(
                    (d) => d.homeId === home.id,
                  );
                  const homeOnline = homeDevices.filter(
                    (d) => d.status === "ONLINE",
                  );

                  return (
                    <Link key={home.id} href={`/user/homes/${home.id}`}>
                      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <HomeIcon className="h-5 w-5 text-primary" />
                            {home.name}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-1 text-sm text-muted-foreground">
                            <div>
                              {homeDevices.length}{" "}
                              {homeDevices.length === 1 ? "device" : "devices"}
                            </div>
                            <div className="flex items-center gap-2">
                              <div
                                className={`h-2 w-2 rounded-full ${homeOnline.length > 0 ? "bg-green-500" : "bg-gray-500"}`}
                              />
                              {homeOnline.length} online
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
              {homesCount > 3 && (
                <div className="mt-4 text-center">
                  <Link href="/user/homes">
                    <Button variant="outline">View All Homes</Button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
