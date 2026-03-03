"use client";

import { useEffect, useState } from "react";
import { devicesApi, DeviceWithDetails } from "@/lib/api/client/devices";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Smartphone,
  Wifi,
  WifiOff,
  Lightbulb,
  Fan,
  Thermometer,
  Zap,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n/client";

export default function UserDevicesPage() {
  const { t } = useTranslation();
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
      toast.error(error.message || t("failedLoadDevices"));
    } finally {
      setIsLoading(false);
    }
  };

  const getDeviceIcon = (type: string) => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes("light") || lowerType.includes("lampu")) {
      return <Lightbulb className="h-6 w-6 text-yellow-500" />;
    }
    if (lowerType.includes("fan") || lowerType.includes("kipas")) {
      return <Fan className="h-6 w-6 text-blue-500" />;
    }
    if (lowerType.includes("ac") || lowerType.includes("thermostat")) {
      return <Thermometer className="h-6 w-6 text-blue-500" />;
    }
    if (lowerType.includes("power") || lowerType.includes("meter")) {
      return <Zap className="h-6 w-6 text-orange-500" />;
    }
    return <Smartphone className="h-6 w-6 text-primary" />;
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

  const onlineCount = devices.filter((d) => d.status === "ONLINE").length;
  const offlineCount = devices.filter((d) => d.status === "OFFLINE").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t("devices")}</h1>
          <p className="text-muted-foreground mt-1">
            {t("controlYourDevices")}
          </p>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={loadDevices}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {/* Stats Cards */}
      {devices.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold">{devices.length}</div>
                <div className="text-sm text-muted-foreground mt-1">
                  {t("totalDevices")}
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {onlineCount}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {t("online")}
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="col-span-2 md:col-span-1">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-500">
                  {offlineCount}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {t("offline")}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Devices Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[200px] rounded-lg" />
          ))}
        </div>
      ) : (devices?.length ?? 0) === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center">
            <div className="text-6xl mb-4">📱</div>
            <h2 className="text-xl font-semibold mb-2">{t("noDevicesYet")}</h2>
            <p className="text-muted-foreground mb-2">{t("startPairing")}</p>
            <p className="text-sm text-muted-foreground">
              {t("devicesWillAppear")}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {devices?.map((device) => (
            <Link key={device.id} href={`/user/devices/${device.id}`}>
              <Card className="hover:shadow-lg hover:scale-[1.02] transition-all cursor-pointer border-l-4 border-l-primary">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {getDeviceIcon(device.type)}
                      <div>
                        <CardTitle className="text-lg">{device.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {device.type}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(device.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {device.home && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">🏠</span>
                      <span className="font-medium">{device.home.name}</span>
                      {device.room && (
                        <>
                          <span className="text-muted-foreground">•</span>
                          <span className="text-muted-foreground">
                            {device.room.name}
                          </span>
                        </>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                    <span>
                      {device.firmwareVersion
                        ? `v${device.firmwareVersion}`
                        : "-"}
                    </span>
                    {device.lastSeenAt && (
                      <span>
                        {new Date(device.lastSeenAt).toLocaleDateString(
                          "id-ID",
                          {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
