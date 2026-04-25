"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslation } from "@/hooks/use-translation";
import { toast } from "sonner";
import { homesApi, type Home } from "@/lib/api/services/homes";

export function useHomes() {
  const { t } = useTranslation();
  const [homes, setHomes] = useState<Home[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<number | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedHome, setSelectedHome] = useState<Home | null>(null);

  const loadHomes = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await homesApi.list();
      setHomes(data);
    } catch (error: any) {
      toast.error(
        error.message || t("failedToLoadHomes") || "Failed to load homes",
      );
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  const handleDelete = async () => {
    if (!selectedHome) return;
    try {
      await homesApi.delete(selectedHome.id);
      toast.success(t("homeDeletedSuccess") || "Home deleted successfully");
      setDeleteDialogOpen(false);
      setSelectedHome(null);
      loadHomes();
    } catch (error: any) {
      toast.error(
        error.message || t("failedToDeleteHome") || "Failed to delete home",
      );
    }
  };

  const openDeleteDialog = (home: Home) => {
    setSelectedHome(home);
    setDeleteDialogOpen(true);
  };

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.data?.id) setUserId(data.data.id);
      })
      .catch(() => {});
    loadHomes();
  }, [loadHomes]);

  useEffect(() => {
    const handleAdd = () => {
      if (userId) setCreateDialogOpen(true);
    };
    window.addEventListener("topbar-add", handleAdd);
    return () => window.removeEventListener("topbar-add", handleAdd);
  }, [userId]);

  return {
    homes,
    isLoading,
    userId,
    createDialogOpen,
    setCreateDialogOpen,
    deleteDialogOpen,
    setDeleteDialogOpen,
    selectedHome,
    openDeleteDialog,
    handleDelete,
    loadHomes,
  };
}
