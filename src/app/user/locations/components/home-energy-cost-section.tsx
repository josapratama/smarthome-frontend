"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Zap, AlertCircle, Trash2 } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { useEnergyCost } from "../hooks/use-energy-cost";
import { TariffDisplay } from "./tariff-display";
import { TariffPicker } from "./tariff-picker";

interface HomeEnergyCostSectionProps {
  homeId: number;
  isOwner: boolean;
}

export function HomeEnergyCostSection({
  homeId,
  isOwner,
}: HomeEnergyCostSectionProps) {
  const { t } = useTranslation();
  const {
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
    hasSelection,
    tariffSet,
    handleSave,
    handleRemove,
    cancelEdit,
  } = useEnergyCost(homeId);

  if (!isOwner) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Zap className="h-6 w-6 text-yellow-500" />
          {t("electricityTariffClass") || "Golongan Tarif Listrik"}
        </h2>
      </div>

      <p className="text-sm text-muted-foreground">
        {t("tariffClassDescription") ||
          "Pilih golongan daya listrik PLN yang digunakan di rumah ini untuk menghitung estimasi biaya energi."}
      </p>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              {t("electricityClass") || "Golongan Listrik"}
            </span>
            {hasSelection ? (
              <Badge className="flex items-center gap-1">
                <Zap className="h-3 w-3" />
                {homeTariff?.tariff?.golongan}
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="text-orange-500 border-orange-300"
              >
                <AlertCircle className="h-3 w-3 mr-1" />
                {t("notSelected") || "Belum dipilih"}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="h-24 rounded-lg bg-muted animate-pulse" />
          ) : !isEditing ? (
            <TariffDisplay
              homeTariff={homeTariff}
              hasSelection={hasSelection}
              tariffSet={tariffSet}
              onEdit={() => setIsEditing(true)}
            />
          ) : (
            <TariffPicker
              tariffGroups={tariffGroups}
              selectedKey={selectedKey}
              onSelectKey={setSelectedKey}
              isSaving={isSaving}
              onSave={handleSave}
              onCancel={cancelEdit}
            />
          )}

          {hasSelection && !isEditing && (
            <div className="pt-4 border-t">
              <Button
                variant="outline"
                size="sm"
                className="w-full text-destructive hover:text-destructive"
                onClick={() => setShowRemoveDialog(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {t("removeClassSelection") || "Hapus Pilihan Golongan"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info */}
      <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Zap className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900 dark:text-blue-100">
              <p className="font-medium mb-1">
                {t("aboutTariffClass") || "Tentang Golongan Tarif"}
              </p>
              <p className="text-blue-700 dark:text-blue-300">
                {t("aboutTariffClassDesc") ||
                  "Pilih golongan sesuai daya listrik yang terpasang di rumah Anda. Estimasi biaya energi akan dihitung otomatis berdasarkan tarif golongan tersebut."}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("removeClassTitle") || "Hapus Pilihan Golongan?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("removeClassDesc") ||
                "Estimasi biaya energi tidak akan dihitung sampai golongan dipilih kembali."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel") || "Batal"}</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemove}>
              {t("delete") || "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
