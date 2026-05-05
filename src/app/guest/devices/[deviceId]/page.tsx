"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Eye,
  ArrowLeft,
  Wifi,
  WifiOff,
  Activity,
  Info,
  Sliders,
} from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/language-context";

interface Device {
  id: number;
  deviceName: string;
  deviceType: string;
  status: boolean;
  homeId: number;
  roomId?: number;
  lastSeenAt?: string;
  firmwareVersion?: string;
  ipAddress?: string;
}

interface Channel {
  id: number;
  channelName: string;
  channelType: string;
  value: any;
  unit?: string;
}

interface TelemetryData {
  id: number;
  metricName: string;
  value: number;
  unit?: string;
  timestamp: string;
}

export default function GuestDeviceDetailPage() {
  const { t } = useLanguage();
  const params = useParams();
  const router = useRouter();
  const deviceId = parseInt(params.deviceId as string);

  const [device, setDevice] = useState<Device | null>(null);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [telemetry, setTelemetry] = useState<TelemetryData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    loadDeviceData();
    const interval = setInterval(loadDeviceData, 10000);
    return () => clearInterval(interval);
  }, [deviceId]);

  const loadDeviceData = async () => {
    try {
      const [deviceRes, channelsRes, telemetryRes] = await Promise.all([
        fetch(`/api/devices/${deviceId}`),
        fetch(`/api/devices/${deviceId}/channels`),
        fetch(`/api/devices/${deviceId}/telemetry?limit=10`),
      ]);

      if (deviceRes.ok) {
        const deviceData = await deviceRes.json();
        setDevice(deviceData.data);
      }

      if (channelsRes.ok) {
        const channelsData = await channelsRes.json();
        setChannels(channelsData.data || []);
      }

      if (telemetryRes.ok) {
        const telemetryData = await telemetryRes.json();
        setTelemetry(telemetryData.data || []);
      }
    } catch (error: any) {
      toast.error(error.message || t("failedLoadDeviceData"));
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!device) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t("back")}
        </Button>
        <Card>
          <CardContent className="py-12 text-center">
            <Info className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {t("deviceNotFound")}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t("deviceNotFoundDesc")}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{device.deviceName}</h1>
            <p className="text-muted-foreground mt-1">
              {device.deviceType.replace("_", " ")} • #{device.id}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
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
          <Badge variant="outline" className="gap-1">
            <Eye className="h-3 w-3" />
            {t("viewOnly")}
          </Badge>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="gap-2">
            <Info className="h-4 w-4" />
            <span className="hidden sm:inline">{t("overview")}</span>
          </TabsTrigger>
          <TabsTrigger value="channels" className="gap-2">
            <Sliders className="h-4 w-4" />
            <span className="hidden sm:inline">{t("channels")}</span>
          </TabsTrigger>
          <TabsTrigger value="telemetry" className="gap-2">
            <Activity className="h-4 w-4" />
            <span className="hidden sm:inline">{t("telemetry")}</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("deviceInformation")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">{t("name")}</p>
                  <p className="font-medium">{device.deviceName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("type")}</p>
                  <p className="font-medium">
                    {device.deviceType.replace("_", " ")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("status")}</p>
                  <p className="font-medium">
                    {device.status ? t("online") : t("offline")}
                  </p>
                </div>
                {device.firmwareVersion && (
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {t("firmware")}
                    </p>
                    <p className="font-medium">{device.firmwareVersion}</p>
                  </div>
                )}
                {device.ipAddress && (
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {t("ipAddress")}
                    </p>
                    <p className="font-medium">{device.ipAddress}</p>
                  </div>
                )}
                {device.lastSeenAt && (
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {t("lastSeen")}
                    </p>
                    <p className="font-medium">
                      {new Date(device.lastSeenAt).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Guest Info */}
          <Card className="border-purple-200 bg-purple-50 dark:border-purple-900 dark:bg-purple-950">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <Eye className="h-5 w-5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-purple-900 dark:text-purple-100">
                    {t("viewOnlyMode")}
                  </h3>
                  <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
                    {t("guestCannotControlDevice")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Channels Tab */}
        <TabsContent value="channels" className="space-y-4">
          {channels.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {channels.map((channel) => (
                <Card key={channel.id}>
                  <CardHeader>
                    <CardTitle className="text-base">
                      {channel.channelName}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          {t("type")}:
                        </span>
                        <Badge variant="outline">{channel.channelType}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          {t("value")}:
                        </span>
                        <span className="font-medium">
                          {String(channel.value)}{" "}
                          {channel.unit && <span>{channel.unit}</span>}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Sliders className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {t("noChannelsFound")}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t("noChannelsDescription")}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Telemetry Tab */}
        <TabsContent value="telemetry" className="space-y-4">
          {telemetry.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>{t("recentTelemetry")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {telemetry.map((data) => (
                    <div
                      key={data.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted"
                    >
                      <div>
                        <p className="font-medium">{data.metricName}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(data.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">
                          {data.value} {data.unit}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {t("noTelemetryData")}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t("noTelemetryDataDesc")}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
