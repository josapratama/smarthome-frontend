"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Eye, Wifi, WifiOff, Search } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { useLanguage } from "@/contexts/language-context";

interface Device {
  id: number;
  deviceName: string;
  deviceType: string;
  status: boolean;
  homeId: number;
  lastSeenAt?: string;
  roomId?: number;
}

export default function GuestDevicesPage() {
  const { t } = useLanguage();
  const [devices, setDevices] = useState<Device[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadDevices();
    const interval = setInterval(loadDevices, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadDevices = async () => {
    try {
      const res = await fetch("/api/devices");
      if (res.ok) {
        const data = await res.json();
        setDevices(data.data || []);
      }
    } catch (error: any) {
      toast.error(error.message || t("failedLoadDevices"));
    } finally {
      setIsLoading(false);
    }
  };

  const filteredDevices = devices.filter(
    (device) =>
      device.deviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      device.deviceType.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const getDeviceTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      LIGHT:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      FAN: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      SENSOR_NODE:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      POWER_METER:
        "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      DOOR: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      OTHER: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
    };
    return colors[type] || colors.OTHER;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t("devices")}</h1>
          <p className="text-muted-foreground mt-1">{t("viewDeviceStatus")}</p>
        </div>
        <Badge variant="outline" className="gap-1">
          <Eye className="h-3 w-3" />
          {t("viewOnly")}
        </Badge>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t("searchDevices")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {t("totalDevices")}
                </p>
                <p className="text-2xl font-bold">{devices.length}</p>
              </div>
              <Wifi className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t("online")}</p>
                <p className="text-2xl font-bold text-green-600">
                  {devices.filter((d) => d.status).length}
                </p>
              </div>
              <Wifi className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t("offline")}</p>
                <p className="text-2xl font-bold text-gray-400">
                  {devices.filter((d) => !d.status).length}
                </p>
              </div>
              <WifiOff className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Devices Grid */}
      {filteredDevices.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredDevices.map((device) => (
            <Link key={device.id} href={`/guest/devices/${device.id}`}>
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base truncate">
                        {device.deviceName}
                      </CardTitle>
                      <div className="flex flex-wrap gap-1 mt-2">
                        <Badge
                          variant="outline"
                          className={getDeviceTypeColor(device.deviceType)}
                        >
                          {device.deviceType.replace("_", " ")}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          #{device.id}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {t("status")}:
                      </span>
                      {device.status ? (
                        <Badge className="bg-green-500">
                          <Wifi className="h-3 w-3 mr-1" />
                          {t("online")}
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <WifiOff className="h-3 w-3 mr-1" />
                          {t("offline")}
                        </Badge>
                      )}
                    </div>
                    {device.lastSeenAt && (
                      <div className="text-xs text-muted-foreground">
                        {t("lastSeen")}:{" "}
                        {new Date(device.lastSeenAt).toLocaleString()}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Wifi className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {searchQuery ? t("noDevicesFound") : t("noDevicesYet")}
            </h3>
            <p className="text-sm text-muted-foreground">
              {searchQuery ? t("tryDifferentSearch") : t("noDevicesInHomes")}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
