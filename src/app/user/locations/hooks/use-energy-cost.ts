"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useTranslation } from "@/hooks/use-translation";
import { toast } from "sonner";
import {
  adminGetTariffs,
  getHomeTariff,
  setHomeTariff,
  removeHomeTariff,
  type PLNTariff,
  type HomeTariff,
} from "@/lib/api/services/energy-cost";

export function useEnergyCost(homeId: number) {
  const { t } = useTranslation();
  const [homeTariff, setHomeTariffState] = useState<HomeTariff | null>(null);
  const [tariffs, setTariffs] = useState<PLNTariff[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedKey, setSelectedKey] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [ht, ts] = await Promise.all([
        getHomeTariff(homeId),
        adminGetTariffs(),
      ]);
      setHomeTariffState(ht);
      setTariffs(ts);
      setSelectedKey(ht.selectedTariffKey ?? "");
    } catch {
      setHomeTariffState({
        homeId,
        homeName: "",
        selectedTariffKey: null,
        tariff: null,
        costPerKwh: 0,
      });
    } finally {
      setIsLoading(false);
    }
  }, [homeId]);

  const handleSave = async () => {
    if (!selectedKey) {
      toast.error(
        t("selectTariffFirst") || "Pilih golongan tarif terlebih dahulu",
      );
      return;
    }
    setIsSaving(true);
    try {
      await setHomeTariff(homeId, selectedKey);
      toast.success(t("tariffUpdated") || "Golongan tarif listrik diperbarui");
      setIsEditing(false);
      loadData();
    } catch (error: any) {
      toast.error(
        error.message || t("failedToUpdateTariff") || "Gagal memperbarui tarif",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemove = async () => {
    try {
      await removeHomeTariff(homeId);
      toast.success(t("tariffRemoved") || "Pilihan golongan tarif dihapus");
      setShowRemoveDialog(false);
      loadData();
    } catch (error: any) {
      toast.error(
        error.message || t("failedToRemoveTariff") || "Gagal menghapus tarif",
      );
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setSelectedKey(homeTariff?.selectedTariffKey ?? "");
  };

  // Group tariffs by golongan
  const tariffGroups = useMemo(
    () =>
      tariffs.reduce<Record<string, PLNTariff[]>>((acc, item) => {
        if (!acc[item.golongan]) acc[item.golongan] = [];
        acc[item.golongan].push(item);
        return acc;
      }, {}),
    [tariffs],
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    homeTariff,
    tariffGroups,
    isLoading,
    isEditing,
    setIsEditing,
    selectedKey,
    setSelectedKey,
    isSaving,
    showRemoveDialog,
    setShowRemoveDialog,
    hasSelection: !!homeTariff?.selectedTariffKey,
    tariffSet: !!(homeTariff?.costPerKwh && homeTariff.costPerKwh > 0),
    handleSave,
    handleRemove,
    cancelEdit,
  };
}
