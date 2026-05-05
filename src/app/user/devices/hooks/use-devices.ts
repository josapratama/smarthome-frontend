"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useTranslation } from "@/hooks/use-translation";
import { toast } from "sonner";
import { devicesApi, type DeviceWithDetails } from "@/lib/api/services/devices";
import { homesApi, type Home } from "@/lib/api/services/homes";

export function useDevices() {
  const { t } = useTranslation();
  const [devices, setDevices] = useState<DeviceWithDetails[]>([]);
  const [filteredDevices, setFilteredDevices] = useState<DeviceWithDetails[]>(
    [],
  );
  const [homes, setHomes] = useState<Home[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [homeFilter, setHomeFilter] = useState("all");

  const filterSectionRef = useRef<HTMLDivElement>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [devicesData, homesData] = await Promise.all([
        devicesApi.list(),
        homesApi.list(),
      ]);
      setDevices(devicesData);
      setHomes(homesData);
    } catch (error: any) {
      toast.error(error.message || t("failedLoadDevices"));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  // Filter logic
  useEffect(() => {
    let filtered = [...devices];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (d) =>
          (d.name?.toLowerCase() ?? "").includes(q) ||
          (d.type?.toLowerCase() ?? "").includes(q) ||
          (d.home?.name?.toLowerCase() ?? "").includes(q) ||
          (d.room?.name?.toLowerCase() ?? "").includes(q),
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((d) => d.status === statusFilter);
    }

    if (homeFilter !== "all") {
      filtered = filtered.filter((d) => d.homeId === parseInt(homeFilter));
    }

    setFilteredDevices(filtered);
  }, [devices, searchQuery, statusFilter, homeFilter]);

  // Topbar event listeners
  useEffect(() => {
    const handleSearch = () => {
      const input =
        filterSectionRef.current?.querySelector("input") ??
        document.querySelector("input");
      if (input) {
        (input as HTMLInputElement).focus();
        (input as HTMLInputElement).select();
      }
    };

    const handleFilter = () => {
      if (!filterSectionRef.current) return;
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
    };

    window.addEventListener("topbar-search", handleSearch);
    window.addEventListener("topbar-filter", handleFilter);
    return () => {
      window.removeEventListener("topbar-search", handleSearch);
      window.removeEventListener("topbar-filter", handleFilter);
    };
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onlineCount = devices.filter((d) => d.status === "ONLINE").length;
  const offlineCount = devices.filter((d) => d.status === "OFFLINE").length;

  return {
    devices,
    filteredDevices,
    homes,
    isLoading,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    homeFilter,
    setHomeFilter,
    filterSectionRef,
    loadData,
    onlineCount,
    offlineCount,
  };
}
