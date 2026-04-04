"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Zap, Save, Edit, X, AlertCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/use-translation";
import {
  adminGetTariffs,
  getHomeTariff,
  setHomeTariff,
  removeHomeTariff,
  type PLNTariff,
  type HomeTariff,
} from "@/lib/api/services/energy-cost";

interface HomeEnergyCostSectionProps {
  homeId: number;
  isOwner: boolean;
}

export function HomeEnergyCostSection({
  homeId,
  isOwner,
}: HomeEnergyCostSectionProps) {
  const { t } = useTranslation();
  const [homeTariff, setHomeTariffState] = useState<HomeTariff | null>(null);
  const [tariffs, setTariffs] = useState<PLNTariff[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedKey, setSelectedKey] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);

  useEffect(() => {
    loadData();
  }, [homeId]);

  const loadData = async () => {
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
      // API belum ada, set empty state
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
  };

  const handleSave = async () => {
    if (!selectedKey) {
      toast.error("Pilih golongan tarif terlebih dahulu");
      return;
    }
    setIsSaving(true);
    try {
      await setHomeTariff(homeId, selectedKey);
      toast.success("Golongan tarif listrik diperbarui");
      setIsEditing(false);
      loadData();
    } catch (error: any) {
      toast.error(error.message || "Gagal memperbarui tarif");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemove = async () => {
    try {
      await removeHomeTariff(homeId);
      toast.success("Pilihan golongan tarif dihapus");
      setShowRemoveDialog(false);
      loadData();
    } catch (error: any) {
      toast.error(error.message || "Gagal menghapus tarif");
    }
  };

  if (!isOwner) return null;

  const hasSelection = !!homeTariff?.selectedTariffKey;
  const tariffSet = homeTariff?.costPerKwh && homeTariff.costPerKwh > 0;

  // Group tariffs by golongan for display
  const tariffGroups = tariffs.reduce<Record<string, PLNTariff[]>>((acc, t) => {
    if (!acc[t.golongan]) acc[t.golongan] = [];
    acc[t.golongan].push(t);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Zap className="h-6 w-6 text-yellow-500" />
          Golongan Tarif Listrik
        </h2>
      </div>

      <p className="text-sm text-muted-foreground">
        Pilih golongan daya listrik PLN yang digunakan di rumah ini untuk
        menghitung estimasi biaya energi.
      </p>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              Golongan Listrik
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
                Belum dipilih
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="h-24 rounded-lg bg-muted animate-pulse" />
          ) : !isEditing ? (
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="flex items-start justify-between gap-4">
                <div>
                  {hasSelection ? (
                    <>
                      <p className="text-sm text-muted-foreground mb-1">
                        Golongan yang dipilih
                      </p>
                      <p className="text-xl font-bold">
                        {homeTariff?.tariff?.description}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {homeTariff?.tariff?.golongan} ·{" "}
                        {homeTariff?.tariff?.daya}
                      </p>
                      <div className="mt-3">
                        {tariffSet ? (
                          <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-green-600">
                              Rp{homeTariff!.costPerKwh.toLocaleString("id-ID")}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              /kWh
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-orange-500">
                            <AlertCircle className="h-4 w-4" />
                            <span className="text-sm">
                              Tarif belum diset oleh admin
                            </span>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <AlertCircle className="h-5 w-5 text-orange-400" />
                      <div>
                        <p className="font-medium text-foreground">
                          Golongan belum dipilih
                        </p>
                        <p className="text-sm">
                          Pilih golongan listrik untuk menghitung estimasi biaya
                          energi
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  {hasSelection ? "Ubah" : "Pilih"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Pilih Golongan Daya Listrik PLN
                </label>
                <Select value={selectedKey} onValueChange={setSelectedKey}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih golongan..." />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(tariffGroups).map(([golongan, items]) => (
                      <div key={golongan}>
                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                          Golongan {golongan}
                        </div>
                        {items.map((t) => (
                          <SelectItem key={t.key} value={t.key}>
                            <div className="flex items-center justify-between gap-4 w-full">
                              <span>{t.description}</span>
                              {t.tarif > 0 ? (
                                <span className="text-xs font-mono text-muted-foreground shrink-0">
                                  Rp{t.tarif.toLocaleString("id-ID")}/kWh
                                </span>
                              ) : (
                                <span className="text-xs text-orange-400 shrink-0">
                                  Tarif belum diset
                                </span>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </div>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Tarif per kWh ditentukan oleh admin berdasarkan golongan yang
                  dipilih.
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleSave}
                  disabled={isSaving || !selectedKey}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? "Menyimpan..." : "Simpan"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setSelectedKey(homeTariff?.selectedTariffKey ?? "");
                  }}
                  disabled={isSaving}
                >
                  <X className="h-4 w-4 mr-2" />
                  Batal
                </Button>
              </div>
            </div>
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
                Hapus Pilihan Golongan
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
              <p className="font-medium mb-1">Tentang Golongan Tarif</p>
              <p className="text-blue-700 dark:text-blue-300">
                Pilih golongan sesuai daya listrik yang terpasang di rumah Anda.
                Estimasi biaya energi akan dihitung otomatis berdasarkan tarif
                golongan tersebut.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Pilihan Golongan?</AlertDialogTitle>
            <AlertDialogDescription>
              Estimasi biaya energi tidak akan dihitung sampai golongan dipilih
              kembali.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemove}>Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
