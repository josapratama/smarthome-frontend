"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "@/hooks/use-translation";
import { toast } from "sonner";
import { homesApi, type Home } from "@/lib/api/services/homes";

export function useHomes() {
  const { t } = useTranslation();
  const [homes, setHomes] = useState<Home[]>([]);
  const [selectedHomeId, setSelectedHomeId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  const loadHomes = useCallback(async () => {
    setIsLoading(true);
    try {
      const homesData = await homesApi.list();
      setHomes(homesData);
      if (homesData.length > 0 && !selectedHomeId) {
        setSelectedHomeId(homesData[0].id.toString());
      }
    } catch (error: any) {
      console.error("Failed to load homes:", error);
      toast.error(error.message || t("failedToLoadHomes"));
    } finally {
      setIsLoading(false);
    }
  }, [selectedHomeId, t]);

  useEffect(() => {
    loadHomes();
  }, [loadHomes]);

  const selectedHome = homes.find(
    (h) => h.id === parseInt(selectedHomeId || "0"),
  );

  return {
    homes,
    selectedHomeId,
    setSelectedHomeId,
    selectedHome,
    isLoading,
    refetch: loadHomes,
  };
}
