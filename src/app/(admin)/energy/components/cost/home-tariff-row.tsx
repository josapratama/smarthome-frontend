"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Edit, Save, X, Home, AlertCircle } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import type { PLNTariff, HomeTariff } from "@/lib/api/services/energy-cost";

interface HomeTariffRowProps {
  home: HomeTariff;
  tariffs: PLNTariff[];
  onSave: (homeId: number, key: string) => Promise<void>;
  onReset: (homeId: number) => Promise<void>;
}

export function HomeTariffRow({
  home,
  tariffs,
  onSave,
  onReset,
}: HomeTariffRowProps) {
  const { t } = useTranslation();
  const [editing, setEditing] = useState(false);
  const [selected, setSelected] = useState(home.selectedTariffKey ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!selected) return;
    setSaving(true);
    try {
      await onSave(home.homeId, selected);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleReset() {
    setSaving(true);
    try {
      await onReset(home.homeId);
      setSelected("");
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/30 transition-colors">
      {/* Left: home info */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <Home className="h-4 w-4 text-primary" />
        </div>
        <div className="min-w-0">
          <p className="font-semibold truncate">{home.homeName}</p>
          <p className="text-xs text-muted-foreground">ID: {home.homeId}</p>
        </div>
      </div>

      {/* Right: edit / display */}
      <div className="flex items-center gap-3 shrink-0">
        {editing ? (
          <>
            <Select value={selected} onValueChange={setSelected}>
              <SelectTrigger className="w-56 h-8 text-sm">
                <SelectValue placeholder={t("selectGolongan")} />
              </SelectTrigger>
              <SelectContent>
                {tariffs.map((item) => (
                  <SelectItem key={item.key} value={item.key}>
                    <span className="text-sm">{item.description}</span>
                    {item.tarif > 0 && (
                      <span className="ml-2 text-xs text-muted-foreground font-mono">
                        Rp{item.tarif.toLocaleString("id-ID")}
                      </span>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={saving || !selected}
            >
              <Save className="h-3.5 w-3.5 mr-1" />
              {t("simpan")}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setEditing(false)}
              disabled={saving}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </>
        ) : (
          <>
            <div className="text-right">
              {home.selectedTariffKey ? (
                <>
                  <p className="text-sm font-semibold">
                    {home.costPerKwh > 0 ? (
                      `Rp${home.costPerKwh.toLocaleString("id-ID")}/kWh`
                    ) : (
                      <span className="text-orange-500 text-xs">
                        {t("tariffNotSet")}
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {home.tariff?.golongan} · {home.tariff?.daya}
                  </p>
                </>
              ) : (
                <Badge
                  variant="outline"
                  className="text-orange-500 border-orange-300 text-xs"
                >
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {t("golonganNotChosen")}
                </Badge>
              )}
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setEditing(true)}
            >
              <Edit className="h-3.5 w-3.5 mr-1" />
              {t("ubah")}
            </Button>
            {home.selectedTariffKey && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleReset}
                disabled={saving}
                className="text-destructive hover:text-destructive"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
