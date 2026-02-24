"use client";

import { useEffect, useState } from "react";
import { devicesApi, DeviceWithDetails } from "@/lib/api/client/devices";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Smartphone, Wifi, WifiOff } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function UserDevicesPage() {
  const [devices, setDevices] = useState<DeviceWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDevices();
  }, []);

  const loadDevices = async () => {
    setIsLoading(true);
    try {
      const data = await devicesApi.list();
      setDevices(data);
    } catch (error: any) {
      toast.error(error.message || "Failed to load devices");
    } finally {
      setIsLoading(false);
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
        return <Badge className="bg-green-600">Online</Badge>;
      case "OFFLINE":
        return <Badge variant="secondary">Offline</Badge>;
      case "ERROR":
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Devices</h1>
        <p className="text-muted-foreground mt-1">
          Monitor and control your IoT devices
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[200px] rounded-lg" />
          ))}
        </div>
      ) : devices.length === 0 ? (
        <div className="bg-card rounded-lg shadow-md p-8 text-center border border-border">
          <div className="text-6xl mb-4">📱</div>
          <h2 className="text-xl font-semibold mb-2">No Devices Yet</h2>
          <p className="text-muted-foreground mb-6">
            Start by pairing your ESP32 devices to monitor and control them.
          </p>
          <p className="text-sm text-muted-foreground">
            Devices will appear here once they connect to the system.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {devices.map((device) => (
            <Link key={device.id} href={`/user/devices/${device.id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">{device.name}</CardTitle>
                  </div>
                  {getStatusBadge(device.status)}
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {device.status === "ONLINE" ? (
                      <Wifi className="h-4 w-4 text-green-600" />
                    ) : (
                      <WifiOff className="h-4 w-4" />
                    )}
                    <span>{device.type}</span>
                  </div>

                  {device.home && (
                    <div className="text-sm text-muted-foreground">
                      🏠 {device.home.name}
                      {device.room && ` • ${device.room.name}`}
                    </div>
                  )}

                  {device.firmwareVersion && (
                    <div className="text-xs text-muted-foreground">
                      Firmware: {device.firmwareVersion}
                    </div>
                  )}

                  {device.lastSeenAt && (
                    <div className="text-xs text-muted-foreground">
                      Last seen: {new Date(device.lastSeenAt).toLocaleString()}
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
