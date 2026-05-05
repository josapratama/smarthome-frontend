"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useTranslation } from "@/hooks/use-translation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { homesApi } from "@/lib/api/services/homes";
import {
  listHomeAlarms,
  acknowledgeAlarm,
  resolveAlarm,
} from "@/lib/api/services/alarms";
import type {
  AlarmDTO,
  AlarmStatus,
  AlarmSeverity,
} from "@/lib/api/dto/alarm.dto";

export function useAlarms() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [alarms, setAlarms] = useState<AlarmDTO[]>([]);
  const [filteredAlarms, setFilteredAlarms] = useState<AlarmDTO[]>([]);
  const [homes, setHomes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [homeFilter, setHomeFilter] = useState<string>("all");

  const filterSectionRef = useRef<HTMLDivElement>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const homesData = await homesApi.list();
      setHomes(homesData);

      let allAlarms: AlarmDTO[] = [];
      if (homeFilter === "all") {
        const alarmsPromises = homesData.map((home) =>
          listHomeAlarms(home.id).catch(() => ({ data: [] })),
        );
        const alarmsResults = await Promise.all(alarmsPromises);
        allAlarms = alarmsResults.flatMap((result) => result.data || []);
      } else {
        const result = await listHomeAlarms(parseInt(homeFilter));
        allAlarms = result.data || [];
      }

      allAlarms.sort(
        (a, b) =>
          new Date(b.triggeredAt).getTime() - new Date(a.triggeredAt).getTime(),
      );

      setAlarms(allAlarms);
    } catch (error: any) {
      console.error("Failed to load alarms:", error);
      toast.error(error.message || t("errorLoadingAlarms"));
    } finally {
      setIsLoading(false);
    }
  }, [homeFilter, t]);

  const filterAlarms = useCallback(() => {
    let filtered = [...alarms];

    if (searchQuery) {
      filtered = filtered.filter(
        (alarm) =>
          alarm.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
          alarm.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
          alarm.deviceId.toString().includes(searchQuery),
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((alarm) => alarm.status === statusFilter);
    }

    if (severityFilter !== "all") {
      filtered = filtered.filter((alarm) => alarm.severity === severityFilter);
    }

    setFilteredAlarms(filtered);
  }, [alarms, searchQuery, statusFilter, severityFilter]);

  const handleAcknowledge = async (alarm: AlarmDTO) => {
    try {
      await acknowledgeAlarm(alarm.homeId, alarm.id);
      toast.success(t("alarmAcknowledged"));
      loadData();
      queryClient.invalidateQueries({ queryKey: ["unread-alarm-count"] });
    } catch (error: any) {
      toast.error(error.message || t("failedToAcknowledgeAlarm"));
    }
  };

  const handleResolve = async (alarm: AlarmDTO) => {
    try {
      await resolveAlarm(alarm.homeId, alarm.id);
      toast.success(t("alarmResolved"));
      loadData();
      queryClient.invalidateQueries({ queryKey: ["unread-alarm-count"] });
    } catch (error: any) {
      toast.error(error.message || t("failedToResolveAlarm"));
    }
  };

  useEffect(() => {
    loadData();
  }, [homeFilter]);

  useEffect(() => {
    filterAlarms();
  }, [alarms, searchQuery, statusFilter, severityFilter]);

  useEffect(() => {
    const handleRefresh = () => {
      loadData();
    };

    const handleFilter = () => {
      if (filterSectionRef.current) {
        filterSectionRef.current.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        filterSectionRef.current.classList.add(
          "ring-2",
          "ring-primary",
          "ring-offset-2",
        );
        setTimeout(() => {
          filterSectionRef.current?.classList.remove(
            "ring-2",
            "ring-primary",
            "ring-offset-2",
          );
        }, 2000);
      }
    };

    const handleSearch = () => {
      let searchInput: HTMLInputElement | null = null;

      if (filterSectionRef.current) {
        searchInput = filterSectionRef.current.querySelector(
          'input[type="text"]',
        ) as HTMLInputElement;
      }

      if (!searchInput) {
        searchInput = document.querySelector(
          'input[type="text"]',
        ) as HTMLInputElement;
      }

      if (searchInput) {
        searchInput.focus();
        searchInput.select();
      }
    };

    window.addEventListener("topbar-refresh", handleRefresh);
    window.addEventListener("topbar-filter", handleFilter);
    window.addEventListener("topbar-search", handleSearch);

    return () => {
      window.removeEventListener("topbar-refresh", handleRefresh);
      window.removeEventListener("topbar-filter", handleFilter);
      window.removeEventListener("topbar-search", handleSearch);
    };
  }, []);

  const openCount = alarms.filter((a) => a.status === "OPEN").length;
  const criticalCount = alarms.filter((a) => a.severity === "CRITICAL").length;
  const ackedCount = alarms.filter((a) => a.status === "ACKED").length;

  return {
    alarms,
    filteredAlarms,
    homes,
    isLoading,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    severityFilter,
    setSeverityFilter,
    homeFilter,
    setHomeFilter,
    filterSectionRef,
    loadData,
    handleAcknowledge,
    handleResolve,
    openCount,
    criticalCount,
    ackedCount,
  };
}
