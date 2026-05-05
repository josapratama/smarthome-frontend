"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/ui/page-header";
import { AlertTriangle, XCircle, CheckCircle, AlertCircle } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { useToast } from "@/hooks/use-toast";
import { qk } from "@/lib/api/queries";
import { apiFetchBrowser } from "@/lib/api/client/fetch";
import {
  listHomeAlarms,
  acknowledgeAlarm,
  resolveAlarm,
} from "@/lib/api/services/alarms";
import type { AlarmDTO, AlarmStatus } from "../types";

import { AlarmCard } from "./alarm-card";
import { AlarmFilters } from "./alarm-filters";
import { AlarmCriticalBanner } from "./alarm-critical-banner";
import { AlarmEmptyState } from "./alarm-empty-state";

export function AlarmsView() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedHomeId, setSelectedHomeId] = useState<number | null>(null);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<AlarmStatus | "ALL">("ALL");
  const [autoRefresh] = useState(true);
  const filterRef = useRef<HTMLDivElement>(null);

  // ── Queries ───────────────────────────────────────────────
  const homesQuery = useQuery({
    queryKey: qk.homes.list(),
    queryFn: async () => {
      const res = await apiFetchBrowser<{ data: any[] }>("/api/v1/homes");
      return res.data ?? [];
    },
  });

  useEffect(() => {
    if (homesQuery.data?.length && !selectedHomeId) {
      setSelectedHomeId(homesQuery.data[0].id);
    }
  }, [homesQuery.data, selectedHomeId]);

  const alarmsQuery = useQuery({
    queryKey: ["alarms", selectedHomeId, statusFilter],
    queryFn: async () => {
      if (!selectedHomeId) return [];
      const query =
        statusFilter !== "ALL"
          ? { status: statusFilter, limit: 500 }
          : { limit: 500 };
      const res = await listHomeAlarms(selectedHomeId, query);
      return res.data ?? [];
    },
    enabled: !!selectedHomeId,
    refetchInterval: autoRefresh ? 10_000 : false,
  });

  // ── Topbar events ─────────────────────────────────────────
  useEffect(() => {
    const onRefresh = () => alarmsQuery.refetch();
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
  }, [alarmsQuery]);

  // ── Mutations ─────────────────────────────────────────────
  const ackMutation = useMutation({
    mutationFn: async (alarmId: number) => {
      if (!selectedHomeId) throw new Error("No home selected");
      return acknowledgeAlarm(selectedHomeId, alarmId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alarms", selectedHomeId] });
      toast({ title: t("alarmAcknowledged") });
    },
    onError: (err: any) =>
      toast({
        title: t("failedToAcknowledgeAlarm"),
        description: err.message,
        variant: "destructive",
      }),
  });

  const resolveMutation = useMutation({
    mutationFn: async (alarmId: number) => {
      if (!selectedHomeId) throw new Error("No home selected");
      return resolveAlarm(selectedHomeId, alarmId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alarms", selectedHomeId] });
      toast({ title: t("alarmResolved") });
    },
    onError: (err: any) =>
      toast({
        title: t("failedToResolveAlarm"),
        description: err.message,
        variant: "destructive",
      }),
  });

  // ── Derived data ──────────────────────────────────────────
  const alarms: AlarmDTO[] = alarmsQuery.data ?? [];

  const stats = useMemo(
    () => ({
      total: alarms.length,
      critical: alarms.filter((a) => a.severity === "CRITICAL").length,
      open: alarms.filter((a) => a.status === "OPEN").length,
      acked: alarms.filter((a) => a.status === "ACKED").length,
    }),
    [alarms],
  );

  const criticalAlarms = useMemo(
    () =>
      alarms.filter((a) => a.severity === "CRITICAL" && a.status === "OPEN"),
    [alarms],
  );

  const filteredAlarms = useMemo(() => {
    if (!searchText) return alarms;
    const q = searchText.toLowerCase();
    return alarms.filter(
      (a) =>
        a.type.toLowerCase().includes(q) ||
        a.message.toLowerCase().includes(q) ||
        String(a.id).includes(q) ||
        String(a.deviceId).includes(q),
    );
  }, [alarms, searchText]);

  const isMutating = ackMutation.isPending || resolveMutation.isPending;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <PageHeader
        stats={[
          {
            label: t("totalAlarms"),
            value: stats.total,
            icon: AlertTriangle,
            color: "text-red-500",
          },
          {
            label: t("open"),
            value: stats.open,
            icon: XCircle,
            color: "text-orange-500",
          },
          {
            label: t("acknowledged"),
            value: stats.acked,
            icon: CheckCircle,
            color: "text-blue-500",
          },
          {
            label: t("critical"),
            value: stats.critical,
            icon: AlertCircle,
            color: "text-red-600",
          },
        ]}
      />

      <AlarmCriticalBanner alarms={criticalAlarms} />

      {/* Home selector */}
      {(homesQuery.data?.length ?? 0) > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">{t("selectHome")}:</label>
              <Select
                value={selectedHomeId?.toString() ?? ""}
                onValueChange={(v) => setSelectedHomeId(Number(v))}
              >
                <SelectTrigger className="w-[250px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {homesQuery.data?.map((home: any) => (
                    <SelectItem key={home.id} value={home.id.toString()}>
                      {home.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      <AlarmFilters
        filterRef={filterRef}
        searchText={searchText}
        statusFilter={statusFilter}
        onSearchChange={setSearchText}
        onStatusChange={setStatusFilter}
      />

      {/* Alarm list */}
      <div className="space-y-3">
        {alarmsQuery.isLoading ? (
          [1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))
        ) : alarmsQuery.error ? (
          <AlarmEmptyState hasSearch={false} isError />
        ) : filteredAlarms.length === 0 ? (
          <AlarmEmptyState hasSearch={!!searchText} />
        ) : (
          filteredAlarms.map((alarm) => (
            <AlarmCard
              key={alarm.id}
              alarm={alarm}
              onAcknowledge={(id) => ackMutation.mutate(id)}
              onResolve={(id) => resolveMutation.mutate(id)}
              isLoading={isMutating}
            />
          ))
        )}
      </div>

      {alarmsQuery.isFetching && !alarmsQuery.isLoading && (
        <p className="text-xs text-muted-foreground text-center">
          {t("updating")}
        </p>
      )}
    </div>
  );
}
