"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Cpu,
  ArrowLeft,
  Loader2,
  Lightbulb,
  Fan,
  DoorOpen,
  Gauge,
  Box,
} from "lucide-react";
import { useLanguage } from "@/contexts/language-context";

interface PublicDevice {
  id: number;
  deviceName: string;
  deviceType: string;
  status: boolean;
  homeName?: string;
  roomName?: string;
  lastSeenAt?: string;
}

const deviceTypeIcons: Record<string, any> = {
  LIGHT: Lightbulb,
  FAN: Fan,
  DOOR: DoorOpen,
  POWER_METER: Gauge,
  SENSOR_NODE: Cpu,
  OTHER: Box,
};

export default function PublicDevicesPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [devices, setDevices] = useState<PublicDevice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPublicDevices();
  }, []);

  const fetchPublicDevices = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "http://localhost:3000/api/v1/public/devices",
      );
      const result = await response.json();

      if (result.success && result.data) {
        setDevices(result.data);
      } else {
        setDevices([]);
      }
    } catch (error) {
      console.error("Failed to fetch public devices:", error);
      setDevices([]);
    } finally {
      setLoading(false);
    }
  };

  const getDeviceIcon = (type: string) => {
    const Icon = deviceTypeIcons[type] || Box;
    return Icon;
  };

  const getDeviceTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      LIGHT: t("light"),
      FAN: t("fan"),
      DOOR: t("door"),
      POWER_METER: t("powerMeter"),
      SENSOR_NODE: t("sensorNode"),
      OTHER: t("other"),
    };
    return typeMap[type] || type;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push("/")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("backToHome")}
          </Button>

          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Cpu className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{t("publicDevicesTitle")}</h1>
              <p className="text-muted-foreground">
                {t("publicDevicesDescription")}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : devices.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Cpu className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">
                {t("noPublicDevices")}
              </h3>
              <p className="text-muted-foreground mb-6">
                {t("noPublicDevicesDescription") ||
                  "Public devices will appear here when available"}
              </p>
              <Button onClick={() => router.push("/login")}>
                {t("login")}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {devices.map((device) => {
              const Icon = getDeviceIcon(device.deviceType);
              return (
                <Card
                  key={device.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="h-5 w-5" />
                        {device.deviceName}
                      </div>
                      <Badge variant={device.status ? "default" : "secondary"}>
                        {device.status ? t("online") : t("offline")}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm">
                      <div className="text-muted-foreground mb-1">
                        {t("deviceType")}
                      </div>
                      <div className="font-medium">
                        {getDeviceTypeLabel(device.deviceType)}
                      </div>
                    </div>

                    {device.homeName && (
                      <div className="text-sm">
                        <div className="text-muted-foreground mb-1">
                          {t("home")}
                        </div>
                        <div className="font-medium">{device.homeName}</div>
                      </div>
                    )}

                    {device.roomName && (
                      <div className="text-sm">
                        <div className="text-muted-foreground mb-1">
                          {t("room")}
                        </div>
                        <div className="font-medium">{device.roomName}</div>
                      </div>
                    )}

                    {device.lastSeenAt && (
                      <div className="text-sm text-muted-foreground">
                        {t("lastSeen")}:{" "}
                        {new Date(device.lastSeenAt).toLocaleString()}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
