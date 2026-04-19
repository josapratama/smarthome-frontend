"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { qk } from "@/lib/api/queries";
import { apiFetchBrowser } from "@/lib/api/client/fetch";
import type { DeviceDTO } from "@/lib/api/dto/devices.dto";
import { useTranslation } from "@/hooks/use-translation";
import { useToast } from "@/hooks/use-toast";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { DeviceStats } from "./device-stats";
import { DeviceFilters } from "./device-filters";
import { DeviceCard } from "./device-card";
import { DeviceEditDialog } from "./device-edit-dialog";
import { DeviceDeleteDialog } from "./device-delete-dialog";

export function DevicesView() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [homeFilter, setHomeFilter] = useState("all");

  const [editDevice, setEditDevice] = useState<DeviceDTO | null>(null);
  const [editName, setEditName] = useState("");
  const [editType, setEditType] = useState("");
  const [deleteDevice, setDeleteDevice] = useState<DeviceDTO | null>(null);

  const searchRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  // ── Topbar event listeners ────────────────────────────────
  useEffect(() => {
    const onSearch = () => {
      const input =
        searchRef.current?.querySelector("input") ??
        (document.querySelector("input") as HTMLInputElement | null);
      input?.focus();
      input?.select();
    };

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

    window.addEventListener("topbar-search", onSearch);
    window.addEventListener("topbar-filter", onFilter);
    window.addEventListener("topbar-add", () =>
      router.push("/device-management/register"),
    );

    return () => {
      window.removeEventListener("topbar-search", onSearch);
      window.removeEventListener("topbar-filter", onFilter);
      window.removeEventListener("topbar-add", () => {});
    };
  }, [router]);

  // ── Queries ───────────────────────────────────────────────
  const homesQuery = useQuery({
    queryKey: ["homes"],
    queryFn: async () => {
      const res = await apiFetchBrowser<{ data: any[] }>("/api/v1/homes");
      return res.data ?? [];
    },
  });

  const devicesQuery = useQuery({
    queryKey: qk.devices.list(
      homeFilter !== "all" ? Number(homeFilter) : undefined,
    ),
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (homeFilter !== "all") params.homeId = homeFilter;
      if (statusFilter !== "all") params.status = statusFilter;
      const res = await apiFetchBrowser<{ data: DeviceDTO[] }>(
        "/api/v1/devices",
        { params },
      );
      return res.data ?? [];
    },
    refetchInterval: 5_000,
  });

  const filtered = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    if (!q) return devicesQuery.data ?? [];
    return (devicesQuery.data ?? []).filter(
      (d) =>
        String(d.id).includes(q) ||
        d.deviceName.toLowerCase().includes(q) ||
        (d.mqttClientId ?? "").toLowerCase().includes(q) ||
        (d.deviceType ?? "").toLowerCase().includes(q) ||
        String(d.homeId).includes(q),
    );
  }, [devicesQuery.data, searchText]);

  // ── Mutations ─────────────────────────────────────────────
  const editMutation = useMutation({
    mutationFn: async (data: {
      id: number;
      deviceName: string;
      deviceType: string;
    }) => {
      await apiFetchBrowser(`/api/v1/devices/${data.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          deviceName: data.deviceName,
          deviceType: data.deviceType,
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.devices.all });
      toast({ title: t("success"), description: t("deviceUpdated") });
      setEditDevice(null);
    },
    onError: (err: any) =>
      toast({
        title: t("error"),
        description: err.message || t("failedUpdateDevice"),
        variant: "destructive",
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiFetchBrowser(`/api/v1/devices/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.devices.all });
      toast({ title: t("success"), description: t("deviceDeleted") });
      setDeleteDevice(null);
    },
    onError: (err: any) =>
      toast({
        title: t("error"),
        description: err.message || t("failedDeleteDevice"),
        variant: "destructive",
      }),
  });

  function handleEditOpen(device: DeviceDTO) {
    setEditDevice(device);
    setEditName(device.deviceName);
    setEditType(device.deviceType);
  }

  const onlineCount = filtered.filter((d) => d.status).length;
  const offlineCount = filtered.filter((d) => !d.status).length;

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <DeviceStats
          total={filtered.length}
          online={onlineCount}
          offline={offlineCount}
        />
        <div className="flex justify-end">
          <Button onClick={() => router.push("/device-management/register")}>
            {t("registerDevice")}
          </Button>
        </div>
      </div>

      <DeviceFilters
        searchRef={searchRef}
        filterRef={filterRef}
        searchText={searchText}
        statusFilter={statusFilter}
        homeFilter={homeFilter}
        homes={homesQuery.data ?? []}
        onSearchChange={setSearchText}
        onStatusChange={setStatusFilter}
        onHomeChange={setHomeFilter}
      />

      <Card className="rounded-2xl shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            {t("allDevices")} ({filtered.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {devicesQuery.isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : devicesQuery.error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
              {(devicesQuery.error as Error).message}
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {searchText || statusFilter !== "all" || homeFilter !== "all"
                ? t("noDevicesFound")
                : t("noData")}
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((d) => (
                <DeviceCard
                  key={d.id}
                  device={d}
                  onEdit={handleEditOpen}
                  onDelete={setDeleteDevice}
                />
              ))}
            </div>
          )}
          {devicesQuery.isFetching && !devicesQuery.isLoading && (
            <p className="mt-3 text-xs text-muted-foreground">{t("loading")}</p>
          )}
        </CardContent>
      </Card>

      <DeviceEditDialog
        device={editDevice}
        name={editName}
        type={editType}
        isSaving={editMutation.isPending}
        onNameChange={setEditName}
        onTypeChange={setEditType}
        onSave={() =>
          editDevice &&
          editMutation.mutate({
            id: editDevice.id,
            deviceName: editName,
            deviceType: editType,
          })
        }
        onClose={() => setEditDevice(null)}
      />

      <DeviceDeleteDialog
        device={deleteDevice}
        isDeleting={deleteMutation.isPending}
        onConfirm={() => deleteDevice && deleteMutation.mutate(deleteDevice.id)}
        onClose={() => setDeleteDevice(null)}
      />
    </div>
  );
}
