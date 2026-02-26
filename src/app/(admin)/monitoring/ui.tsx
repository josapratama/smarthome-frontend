"use client";

import { useQuery } from "@tanstack/react-query";
import { qk } from "@/lib/api/queries";
import { apiFetchBrowser } from "@/lib/api/client.browser";
import type { DeviceDTO } from "@/lib/api/dto/devices.dto";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/language-context";

function fmtDateTime(v?: string | null) {
  if (!v) return "-";
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? v : d.toLocaleString();
}

function getLastSeenStatus(lastSeenAt: string | null | undefined) {
  if (!lastSeenAt) return { status: "never", color: "bg-gray-500" };

  const lastSeen = new Date(lastSeenAt);
  const now = new Date();
  const diffMinutes = (now.getTime() - lastSeen.getTime()) / (1000 * 60);

  if (diffMinutes < 5) return { status: "online", color: "bg-green-500" };
  if (diffMinutes < 30) return { status: "recent", color: "bg-yellow-500" };
  return { status: "offline", color: "bg-red-500" };
}

export function MonitoringClient() {
  const { t } = useLanguage();

  const devicesQuery = useQuery({
    queryKey: qk.devices.list(),
    queryFn: async () => {
      const payload = await apiFetchBrowser<{ data: DeviceDTO[] }>(
        "/api/v1/devices",
      );
      return payload.data ?? [];
    },
    refetchInterval: 5_000, // Refresh every 5 seconds for monitoring
  });

  const devices = devicesQuery.data ?? [];
  const onlineDevices = devices.filter((d) => d.status);
  const offlineDevices = devices.filter((d) => !d.status);

  // Group devices by last seen status
  const devicesByStatus = devices.reduce(
    (acc, device) => {
      const { status } = getLastSeenStatus(device.lastSeenAt);
      if (!acc[status]) acc[status] = [];
      acc[status].push(device);
      return acc;
    },
    {} as Record<string, DeviceDTO[]>,
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{t("monitoringPage")}</h1>
          <p className="text-sm text-muted-foreground">
            {t("realTimeMonitoring")}
          </p>
        </div>

        <Button
          variant="outline"
          onClick={() => {
            devicesQuery.refetch();
          }}
          disabled={devicesQuery.isFetching}
        >
          {t("refreshAll")}
        </Button>
      </div>

      {/* System Status Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              {t("totalDevices")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{devices.length}</div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              {t("onlineDevices")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-green-600">
              {onlineDevices.length}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              {t("offlineDevices")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-red-600">
              {offlineDevices.length}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {devicesQuery.isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : devicesQuery.error ? (
              <Badge variant="destructive">Error</Badge>
            ) : (
              <Badge className="bg-green-100 text-green-800">Healthy</Badge>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Device Status Lists */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Online Devices */}
        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-green-500"></div>
              {t("onlineDevicesList")} ({onlineDevices.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {devicesQuery.isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : onlineDevices.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                {t("noOnlineDevices")}
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {onlineDevices.map((device) => {
                  const { status, color } = getLastSeenStatus(
                    device.lastSeenAt,
                  );
                  return (
                    <div
                      key={device.id}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`h-2 w-2 rounded-full ${color}`}></div>
                        <div>
                          <div className="font-medium">{device.deviceName}</div>
                          <div className="text-xs text-muted-foreground">
                            #{device.id} • Home {device.homeId}
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {fmtDateTime(device.lastSeenAt)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Offline Devices */}
        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-500"></div>
              Offline Devices ({offlineDevices.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {devicesQuery.isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : offlineDevices.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                No offline devices
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {offlineDevices.map((device) => {
                  const { status, color } = getLastSeenStatus(
                    device.lastSeenAt,
                  );
                  return (
                    <div
                      key={device.id}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`h-2 w-2 rounded-full ${color}`}></div>
                        <div>
                          <div className="font-medium">{device.deviceName}</div>
                          <div className="text-xs text-muted-foreground">
                            #{device.id} • Home {device.homeId}
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {fmtDateTime(device.lastSeenAt)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {devicesQuery.isFetching && !devicesQuery.isLoading ? (
        <div className="text-xs text-muted-foreground">
          Updating device status…
        </div>
      ) : null}
    </div>
  );
}
