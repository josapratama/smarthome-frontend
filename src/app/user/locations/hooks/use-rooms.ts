"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useTranslation } from "@/hooks/use-translation";
import { toast } from "sonner";
import { roomsApi, type Room } from "@/lib/api/services/rooms";
import { homesApi, type Home } from "@/lib/api/services/homes";

export function useRooms() {
  const { t } = useTranslation();
  const [rooms, setRooms] = useState<(Room & { homeName?: string })[]>([]);
  const [homes, setHomes] = useState<Home[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedHomeId, setSelectedHomeId] = useState<string>("all");

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const homesData = await homesApi.list();
      setHomes(homesData);

      const allRooms: (Room & { homeName?: string })[] = [];
      for (const home of homesData) {
        const homeRooms = await roomsApi.getRooms(home.id);
        allRooms.push(...homeRooms.map((r) => ({ ...r, homeName: home.name })));
      }
      setRooms(allRooms);
    } catch (error: any) {
      toast.error(error.message || t("failedToLoadRooms"));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredRooms = useMemo(
    () =>
      rooms.filter((room) => {
        const matchesSearch = room.name
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
        const matchesHome =
          selectedHomeId === "all" || room.homeId === parseInt(selectedHomeId);
        return matchesSearch && matchesHome;
      }),
    [rooms, searchQuery, selectedHomeId],
  );

  return {
    rooms,
    homes,
    isLoading,
    searchQuery,
    setSearchQuery,
    selectedHomeId,
    setSelectedHomeId,
    filteredRooms,
  };
}
