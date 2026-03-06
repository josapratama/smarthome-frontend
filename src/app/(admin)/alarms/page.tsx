"use client";

import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  RefreshCw,
  Siren,
  AlertTriangle,
  Shield,
  Search,
  Filter,
  AlertCircle,
} from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { useToast } from "@/hooks/use-toast";
import { qk } from "@/lib/api/queries";
import { apiFetchBrowser } from "@/lib/api/client.browser";
import {
  listHomeAlarms,
  acknowledgeAlarm,
  resolveAlarm,
} from "@/lib/api/alarms";
import type { AlarmDTO, AlarmStatus } from "./types";
import { AlarmCard } from "./alarm-card";

export default function AlarmsPage() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedHomeId, setSelectedHomeId] = useState<number | null>(null);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<AlarmStatus | "ALL">("ALL");
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch homes
  const homesQuery = useQuery({
    queryKey: qk.homes.list(),
    queryFn: async () => {
      const payload = await apiFetchBrowser<{ data: any[] }>("/api/v1/homes");
      return payload.data ?? [];
    },
  });

  // Set default home
  useEffect(() => {
    if (homesQuery.data && homesQuery.data.length > 0 && !selectedHomeId) {
      setSelectedHomeId(homesQuery.data[0].id);
    }
  }, [homesQuery.data, selectedHomeId]);

  // Fetch alarms
  const alarmsQuery = useQuery({
    queryKey: ["alarms", selectedHomeId, statusFilter],
    queryFn: async () => {
      if (!selectedHomeId) return [];
      const query =
        statusFilter !== "ALL"
          ? { status: statusFilter, limit: 500 }
          : { limit: 500 };
      const payload = await listHomeAlarms(selectedHomeId, query);
      return payload.data ?? [];
    },
    enabled: !!selectedHomeId,
    refetchInterval: autoRefresh ? 10000 : false, // Auto-refresh every 10s
  });

  // Acknowledge mutation
  const ackMutation = useMutation({
    mutationFn: async (alarmId: number) => {
      if (!selectedHomeId) throw new Error("No home selected");
      return acknowledgeAlarm(selectedHomeId, alarmId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alarms", selectedHomeId] });
      toast({ title: t("alarmAcknowledged") });
    },
    onError: (error: any) => {
      toast({
        title: t("failedToAcknowledgeAlarm"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Resolve mutation
  const resolveMutation = useMutation({
    mutationFn: async (alarmId: number) => {
      if (!selectedHomeId) throw new Error("No home selected");
      return resolveAlarm(selectedHomeId, alarmId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alarms", selectedHomeId] });
      toast({ title: t("alarmResolved") });
    },
    onError: (error: any) => {
      toast({
        title: t("failedToResolveAlarm"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Calculate statistics
  const stats = useMemo(() => {
    const alarms = alarmsQuery.data ?? [];
    return {
      total: alarms.length,
      critical: alarms.filter((a) => a.severity === "CRITICAL").length,
      high: alarms.filter((a) => a.severity === "HIGH").length,
      medium: alarms.filter((a) => a.severity === "MEDIUM").length,
      low: alarms.filter((a) => a.severity === "LOW").length,
      open: alarms.filter((a) => a.status === "OPEN").length,
      acked: alarms.filter((a) => a.status === "ACKED").length,
      resolved: alarms.filter((a) => a.status === "RESOLVED").length,
    };
  }, [alarmsQuery.data]);

  // Filter alarms
  const filteredAlarms = useMemo(() => {
    let alarms = alarmsQuery.data ?? [];

    if (searchText) {
      const search = searchText.toLowerCase();
      alarms = alarms.filter(
        (alarm) =>
          alarm.type.toLowerCase().includes(search) ||
          alarm.message.toLowerCase().includes(search) ||
          String(alarm.id).includes(search) ||
          String(alarm.deviceId).includes(search),
      );
    }

    return alarms;
  }, [alarmsQuery.data, searchText]);

  // Critical alarms banner
  const criticalAlarms = useMemo(() => {
    return (alarmsQuery.data ?? []).filter(
      (a) => a.severity === "CRITICAL" && a.status === "OPEN",
    );
  }, [alarmsQuery.data]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            {t("alarms")}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t("monitorSecurityAlarms")}
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => alarmsQuery.refetch()}
            disabled={alarmsQuery.isFetching}
          >
            <RefreshCw
              className={`h-4 w-4 ${alarmsQuery.isFetching ? "animate-spin" : ""}`}
            />
            {t("refresh")}
          </Button>
        </div>
      </div>

      {/* Critical Alarms Banner */}
      {criticalAlarms.length > 0 && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800 rounded-xl">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900 dark:text-red-100">
                  {t("criticalAlertsActive")}
                </h3>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                  {criticalAlarms.length} {t("criticalAlertsCount")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Home Selector */}
      {homesQuery.data && homesQuery.data.length > 0 && (
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t("selectHome")}:
          </label>
          <Select
            value={selectedHomeId?.toString() ?? ""}
            onValueChange={(v) => setSelectedHomeId(Number(v))}
          >
            <SelectTrigger className="w-[250px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {homesQuery.data.map((home: any) => (
                <SelectItem key={home.id} value={home.id.toString()}>
                  {home.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-xl shadow-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600 dark:text-gray-400">
              {t("totalAlarms")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-gray-900 dark:text-gray-100">
              {stats.total}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600 dark:text-gray-400">
              {t("critical")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <div className="text-3xl font-semibold text-gray-900 dark:text-gray-100">
                {stats.critical}
              </div>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {t("high")}: {stats.high}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600 dark:text-gray-400">
              {t("open")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Siren className="h-5 w-5 text-orange-500" />
              <div className="text-3xl font-semibold text-gray-900 dark:text-gray-100">
                {stats.open}
              </div>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {t("acknowledged")}: {stats.acked}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600 dark:text-gray-400">
              {t("resolved")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-500" />
              <div className="text-3xl font-semibold text-gray-900 dark:text-gray-100">
                {stats.resolved}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="rounded-xl shadow-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
              <Input
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder={t("searchAlarms")}
                className="pl-9"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              <Select
                value={statusFilter}
                onValueChange={(v) => setStatusFilter(v as AlarmStatus | "ALL")}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">{t("allStatus")}</SelectItem>
                  <SelectItem value="OPEN">{t("alarmStatusOpen")}</SelectItem>
                  <SelectItem value="ACKED">{t("alarmStatusAcked")}</SelectItem>
                  <SelectItem value="RESOLVED">
                    {t("alarmStatusResolved")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alarms List */}
      <div className="space-y-3">
        {alarmsQuery.isLoading ? (
          <>
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </>
        ) : alarmsQuery.error ? (
          <Card className="rounded-xl shadow-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <CardContent className="pt-6">
              <div className="text-center py-8 text-red-600 dark:text-red-400">
                {t("errorLoadingAlarms")}
              </div>
            </CardContent>
          </Card>
        ) : filteredAlarms.length === 0 ? (
          <Card className="rounded-xl shadow-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Siren className="h-12 w-12 text-gray-400 dark:text-gray-600" />
                <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {t("noAlarmsFound")}
                </h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  {searchText
                    ? t("noAlarmsMatchSearch")
                    : t("securityAlarmsWillAppear")}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredAlarms.map((alarm) => (
            <AlarmCard
              key={alarm.id}
              alarm={alarm}
              onAcknowledge={(id) => ackMutation.mutate(id)}
              onResolve={(id) => resolveMutation.mutate(id)}
              isLoading={ackMutation.isPending || resolveMutation.isPending}
            />
          ))
        )}
      </div>

      {alarmsQuery.isFetching && !alarmsQuery.isLoading && (
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
          {t("updating")}
        </div>
      )}
    </div>
  );
}
