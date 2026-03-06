"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { qk } from "@/lib/api/queries";
import { apiFetchBrowser } from "@/lib/api/client.browser";
import type { DeviceDTO } from "@/lib/api/dto/devices.dto";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/language-context";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Search,
  Wifi,
  WifiOff,
  XCircle,
  Server,
} from "lucide-react";
import Link from "next/link";

function fmtDateTime(v?: string | null) {
  if (!v) return "-";
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? v : d.toLocaleString();
}

function getLastSeenStatus(lastSeenAt: string | null | undefined) {
  if (!lastSeenAt)
    return { status: "never", color: "bg-gray-500", label: "Never Connected" };

  const lastSeen = new Date(lastSeenAt);
  const now = new Date();
  const diffMinutes = (now.getTime() - lastSeen.getTime()) / (1000 * 60);

  if (diffMinutes < 5)
    return { status: "online", color: "bg-green-500", label: "Online" };
  if (diffMinutes < 30)
    return {
      status: "recent",
      color: "bg-yellow-500",
      label: "Recently Active",
    };
  return { status: "offline", color: "bg-red-500", label: "Offline" };
}

function getRelativeTime(dateStr: string | null | undefined): string {
  if (!dateStr) return "Never";

  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

export function MonitoringClient() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "online" | "offline"
  >("all");

  const devicesQuery = useQuery({
    queryKey: qk.devices.list(),
    queryFn: async () => {
      const payload = await apiFetchBrowser<{ data: DeviceDTO[] }>(
        "/api/v1/devices",
      );
      return payload.data ?? [];
    },
    refetchInterval: 5_000,
  });

  const devices = devicesQuery.data ?? [];

  const filteredDevices = devices.filter((device) => {
    const matchesSearch =
      device.deviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      device.id.toString().includes(searchQuery) ||
      device.homeId?.toString().includes(searchQuery);

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "online" && device.status) ||
      (statusFilter === "offline" && !device.status);

    return matchesSearch && matchesStatus;
  });

  const onlineDevices = devices.filter((d) => d.status);
  const offlineDevices = devices.filter((d) => !d.status);

  const criticalDevices = devices.filter((d) => {
    if (!d.lastSeenAt) return false;
    const diffMs = new Date().getTime() - new Date(d.lastSeenAt).getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    return !d.status && diffHours > 1;
  });

  const uptimePercentage =
    devices.length > 0
      ? Math.round((onlineDevices.length / devices.length) * 100)
      : 0;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            {t("monitoringPage")}
          </h1>
          <p className="text-muted-foreground dark:text-gray-400 mt-1">
            {t("realTimeMonitoring")}
          </p>
        </div>
        <Button
          onClick={() => devicesQuery.refetch()}
          disabled={devicesQuery.isFetching}
          className="w-full sm:w-auto"
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${devicesQuery.isFetching ? "animate-spin" : ""}`}
          />
          {t("refreshAll")}
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-none shadow-md hover:shadow-lg transition-shadow bg-white dark:bg-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground dark:text-gray-400">
                  {t("totalDevices")}
                </p>
                <h3 className="text-3xl font-bold mt-2 text-gray-900 dark:text-gray-100">
                  {devices.length}
                </h3>
                <p className="text-xs text-muted-foreground dark:text-gray-500 mt-1">
                  {t("registeredDevices")}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <Server className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md hover:shadow-lg transition-shadow bg-white dark:bg-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground dark:text-gray-400">
                  {t("onlineDevices")}
                </p>
                <h3 className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
                  {onlineDevices.length}
                </h3>
                <p className="text-xs text-muted-foreground dark:text-gray-500 mt-1">
                  {uptimePercentage}% {t("uptime")}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md hover:shadow-lg transition-shadow bg-white dark:bg-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground dark:text-gray-400">
                  {t("offlineDevices")}
                </p>
                <h3 className="text-3xl font-bold text-red-600 dark:text-red-400 mt-2">
                  {offlineDevices.length}
                </h3>
                <p className="text-xs text-muted-foreground dark:text-gray-500 mt-1">
                  {t("needsAttention")}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
                <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md hover:shadow-lg transition-shadow bg-white dark:bg-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground dark:text-gray-400">
                  {t("criticalDevices")}
                </p>
                {devicesQuery.isLoading ? (
                  <Skeleton className="h-9 w-16 mt-2" />
                ) : (
                  <>
                    <h3
                      className={`text-3xl font-bold mt-2 ${criticalDevices.length > 0 ? "text-orange-600 dark:text-orange-400" : "text-gray-400 dark:text-gray-600"}`}
                    >
                      {criticalDevices.length}
                    </h3>
                    <p className="text-xs text-muted-foreground dark:text-gray-500 mt-1">
                      {t("offlineOver1Hour")}
                    </p>
                  </>
                )}
              </div>
              <div
                className={`h-12 w-12 rounded-full flex items-center justify-center ${criticalDevices.length > 0 ? "bg-orange-100 dark:bg-orange-900" : "bg-gray-100 dark:bg-gray-700"}`}
              >
                <AlertTriangle
                  className={`h-6 w-6 ${criticalDevices.length > 0 ? "text-orange-600 dark:text-orange-400" : "text-gray-400 dark:text-gray-600"}`}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Critical Alerts Banner */}
      {criticalDevices.length > 0 && (
        <Card className="border-l-4 border-l-orange-500 dark:border-l-orange-600 bg-white dark:bg-gray-800 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-orange-900 dark:text-orange-100 mb-1">
                  {t("criticalAlerts")}
                </h3>
                <p className="text-sm text-orange-800 dark:text-orange-300 mb-4">
                  {criticalDevices.length} {t("offlineOver1Hour")}
                </p>
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {criticalDevices.slice(0, 3).map((device) => (
                    <Link
                      key={device.id}
                      href={`/devices/${device.id}`}
                      className="block"
                    >
                      <div className="p-4 rounded-lg bg-orange-50 dark:bg-gray-700 border border-orange-200 dark:border-orange-800 hover:border-orange-300 dark:hover:border-orange-700 hover:shadow-md transition-all">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm truncate text-gray-900 dark:text-gray-100">
                            {device.deviceName}
                          </span>
                          <Badge variant="destructive" className="text-xs">
                            {t("offline")}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground dark:text-gray-400">
                          {t("lastSeen")}: {getRelativeTime(device.lastSeenAt)}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
                {criticalDevices.length > 3 && (
                  <p className="text-xs text-orange-700 dark:text-orange-400 mt-3">
                    +{criticalDevices.length - 3} {t("moreDevices")}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filter */}
      <Card className="border-none shadow-md bg-white dark:bg-gray-800">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground dark:text-gray-500" />
              <Input
                placeholder={t("searchDevices")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={statusFilter === "all" ? "default" : "outline"}
                onClick={() => setStatusFilter("all")}
                className="flex-1 sm:flex-none"
              >
                <Activity className="h-4 w-4 mr-2" />
                {t("all")}
              </Button>
              <Button
                variant={statusFilter === "online" ? "default" : "outline"}
                onClick={() => setStatusFilter("online")}
                className="flex-1 sm:flex-none"
              >
                <Wifi className="h-4 w-4 mr-2" />
                {t("online")}
              </Button>
              <Button
                variant={statusFilter === "offline" ? "default" : "outline"}
                onClick={() => setStatusFilter("offline")}
                className="flex-1 sm:flex-none"
              >
                <WifiOff className="h-4 w-4 mr-2" />
                {t("offline")}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Devices List */}
      <Card className="border-none shadow-md bg-white dark:bg-gray-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {t("allDevices")} ({filteredDevices.length})
            </CardTitle>
            {devicesQuery.isFetching && !devicesQuery.isLoading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground dark:text-gray-400">
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
          ) : filteredDevices.length === 0 ? (
            <div className="text-center py-12">
              <div className="h-16 w-16 rounded-full bg-muted dark:bg-gray-700 mx-auto mb-4 flex items-center justify-center">
                <Activity className="h-8 w-8 text-muted-foreground dark:text-gray-500" />
              </div>
              <h3 className="font-semibold text-lg mb-1 text-gray-900 dark:text-gray-100">
                {searchQuery ? t("noDevicesMatchSearch") : t("noDevicesFound")}
              </h3>
              <p className="text-sm text-muted-foreground dark:text-gray-400">
                {searchQuery ? t("tryDifferentSearch") : t("getStartedDevice")}
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
              {filteredDevices.map((device) => {
                const { status, label } = getLastSeenStatus(device.lastSeenAt);
                const isCritical = criticalDevices.some(
                  (d) => d.id === device.id,
                );

                return (
                  <Link
                    key={device.id}
                    href={`/devices/${device.id}`}
                    className="block group"
                  >
                    <div
                      className={`p-4 rounded-xl border transition-all hover:shadow-md ${
                        isCritical
                          ? "border-orange-500 dark:border-orange-600 bg-white dark:bg-gray-800"
                          : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className="relative flex-shrink-0">
                            <div
                              className={`h-10 w-10 rounded-full flex items-center justify-center ${
                                status === "online"
                                  ? "bg-green-100 dark:bg-green-900"
                                  : status === "recent"
                                    ? "bg-yellow-100 dark:bg-yellow-900"
                                    : "bg-gray-100 dark:bg-gray-700"
                              }`}
                            >
                              {status === "online" ? (
                                <Wifi className="h-5 w-5 text-green-600 dark:text-green-400" />
                              ) : status === "recent" ? (
                                <Wifi className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                              ) : (
                                <WifiOff className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                              )}
                            </div>
                            {status === "online" && (
                              <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-green-500 animate-pulse"></div>
                            )}
                            {isCritical && (
                              <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-orange-500 flex items-center justify-center">
                                <AlertTriangle className="h-2.5 w-2.5 text-white" />
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-gray-900 dark:text-gray-100 truncate group-hover:text-primary transition-colors">
                                {device.deviceName}
                              </h4>
                              <Badge
                                variant={
                                  device.status ? "default" : "secondary"
                                }
                                className="text-xs flex-shrink-0"
                              >
                                {label}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                              <span>ID: #{device.id}</span>
                              <span>•</span>
                              <span>
                                {t("home")} #{device.homeId}
                              </span>
                              <span>•</span>
                              <span className="truncate">
                                {device.deviceType}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                            {t("lastSeen")}
                          </span>
                          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            {getRelativeTime(device.lastSeenAt)}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {fmtDateTime(device.lastSeenAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
