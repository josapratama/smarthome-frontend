"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Save, X } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import type { PLNTariff } from "@/lib/api/services/energy-cost";

interface TariffPickerProps {
  tariffGroups: Record<string, PLNTariff[]>;
  selectedKey: string;
  onSelectKey: (key: string) => void;
  isSaving: boolean;
  onSave: () => void;
  onCancel: () => void;
}

export function TariffPicker({
  tariffGroups,
  selectedKey,
  onSelectKey,
  isSaving,
  onSave,
  onCancel,
}: TariffPickerProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">
          {t("selectPLNClass") || "Pilih Golongan Daya Listrik PLN"}
        </label>
        <Select value={selectedKey} onValueChange={onSelectKey}>
          <SelectTrigger>
            <SelectValue
              placeholder={t("selectClass") || "Pilih golongan..."}
            />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(tariffGroups).map(([golongan, items]) => (
              <div key={golongan}>
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                  {t("class") || "Golongan"} {golongan}
                </div>
                {items.map((item) => (
                  <SelectItem key={item.key} value={item.key}>
                    <div className="flex items-center justify-between gap-4 w-full">
                      <span>{item.description}</span>
                      {item.tarif > 0 ? (
                        <span className="text-xs font-mono text-muted-foreground shrink-0">
                          Rp{item.tarif.toLocaleString("id-ID")}/kWh
                        </span>
                      ) : (
                        <span className="text-xs text-orange-400 shrink-0">
                          {t("tariffNotSet") || "Tarif belum diset"}
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
          {t("tariffSetByAdmin") ||
            "Tarif per kWh ditentukan oleh admin berdasarkan golongan yang dipilih."}
        </p>
      </div>

      <div className="flex gap-2">
        <Button onClick={onSave} disabled={isSaving || !selectedKey}>
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? t("saving") || "Menyimpan..." : t("save") || "Simpan"}
        </Button>
        <Button variant="outline" onClick={onCancel} disabled={isSaving}>
          <X className="h-4 w-4 mr-2" />
          {t("cancel") || "Batal"}
        </Button>
      </div>
    </div>
  );
}
