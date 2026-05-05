"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { qk } from "@/lib/api/queries";
import { apiFetchBrowser } from "@/lib/api/client/fetch";
import type { DeviceDTO } from "@/lib/api/dto/devices.dto";
import { useTranslation } from "@/hooks/use-translation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, RefreshCw } from "lucide-react";

import { MonitoringStats } from "./monitoring-stats";
import { CriticalAlertsBanner } from "./critical-alerts-banner";
import { MonitoringFilters } from "./monitoring-filters";
import { DeviceMonitorCard } from "./device-monitor-card";
import { isCriticalDevice } from "./monitoring.utils";

type StatusFilter = "all" | "online" | "offline";

export function MonitoringView() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const searchRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  const devicesQuery = useQuery({
    queryKey: qk.devices.list(),
    queryFn: async () => {
      const res = await apiFetchBrowser<{ data: DeviceDTO[] }>(
        "/api/v1/devices",
      );
      return res.data ?? [];
    },
    refetchInterval: 5_000,
  });

  // ── Topbar events ─────────────────────────────────────────
  useEffect(() => {
    const onRefresh = () => devicesQuery.refetch();
    const onFilter = () => {
      filterRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      filterRef.current?.classList.add(
        "ring-2",
        "ring-primary",
        "ring-offset-2",
      );
      setTimeout(
        () =>
          filterRef.current?.classList.remove(
            "ring-2",
            "ring-primary",
            "ring-offset-2",
          ),
        2000,
      );
    };
    window.addEventListener("topbar-refresh", onRefresh);
    window.addEventListener("topbar-filter", onFilter);
    return () => {
      window.removeEventListener("topbar-refresh", onRefresh);
      window.removeEventListener("topbar-filter", onFilter);
    };
  }, [devicesQuery]);

  const devices = devicesQuery.data ?? [];

  const filtered = devices.filter((d) => {
    const matchSearch =
      d.deviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.id.toString().includes(searchQuery) ||
      d.homeId?.toString().includes(searchQuery);
    const matchStatus =
      statusFilter === "all" ||
      (statusFilter === "online" && d.status) ||
      (statusFilter === "offline" && !d.status);
    return matchSearch && matchStatus;
  });

  const onlineDevices = devices.filter((d) => d.status);
  const offlineDevices = devices.filter((d) => !d.status);
  const criticalDevices = devices.filter(isCriticalDevice);

  return (
    <div className="space-y-6">
      <MonitoringStats
        total={devices.length}
        online={onlineDevices.length}
        offline={offlineDevices.length}
        critical={criticalDevices.length}
      />

      <CriticalAlertsBanner devices={criticalDevices} />

      <MonitoringFilters
        searchRef={searchRef}
        filterRef={filterRef}
        searchQuery={searchQuery}
        statusFilter={statusFilter}
        onSearchChange={setSearchQuery}
        onStatusChange={setStatusFilter}
      />

      <Card className="shadow-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold">
              {t("allDevices")} ({filtered.length})
            </CardTitle>
            {devicesQuery.isFetching && !devicesQuery.isLoading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>{t("updatingStatus")}</span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {devicesQuery.isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <div className="h-16 w-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                <Activity className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-1">
                {searchQuery ? t("noDevicesMatchSearch") : t("noDevicesFound")}
              </h3>
              <p className="text-sm text-muted-foreground">
                {searchQuery ? t("tryDifferentSearch") : t("getStartedDevice")}
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
              {filtered.map((device) => (
                <DeviceMonitorCard key={device.id} device={device} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
