"use client";

import { Button } from "@/components/ui/button";
import { AlertCircle, Edit } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import type { HomeTariff } from "@/lib/api/services/energy-cost";

interface TariffDisplayProps {
  homeTariff: HomeTariff | null;
  hasSelection: boolean;
  tariffSet: boolean;
  onEdit: () => void;
}

export function TariffDisplay({
  homeTariff,
  hasSelection,
  tariffSet,
  onEdit,
}: TariffDisplayProps) {
  const { t } = useTranslation();

  return (
    <div className="p-4 rounded-lg bg-muted/50">
      <div className="flex items-start justify-between gap-4">
        <div>
          {hasSelection ? (
            <>
              <p className="text-sm text-muted-foreground mb-1">
                {t("selectedClass") || "Golongan yang dipilih"}
              </p>
              <p className="text-xl font-bold">
                {homeTariff?.tariff?.description}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {homeTariff?.tariff?.golongan} · {homeTariff?.tariff?.daya}
              </p>
              <div className="mt-3">
                {tariffSet ? (
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-green-600">
                      Rp{homeTariff!.costPerKwh.toLocaleString("id-ID")}
                    </span>
                    <span className="text-sm text-muted-foreground">/kWh</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-orange-500">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">
                      {t("tariffNotSetByAdmin") ||
                        "Tarif belum diset oleh admin"}
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
                  {t("classNotSelected") || "Golongan belum dipilih"}
                </p>
                <p className="text-sm">
                  {t("selectClassToCalculate") ||
                    "Pilih golongan listrik untuk menghitung estimasi biaya energi"}
                </p>
              </div>
            </div>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={onEdit}>
          <Edit className="h-4 w-4 mr-2" />
          {hasSelection ? t("change") || "Ubah" : t("select") || "Pilih"}
        </Button>
      </div>
    </div>
  );
}
