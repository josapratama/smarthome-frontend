"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, Check, X, Zap, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/use-translation";
import type { PLNTariff } from "@/lib/api/services/energy-cost";

interface TariffTableProps {
  tariffs: PLNTariff[];
  onSave: (key: string, tarif: number) => Promise<void>;
}

export function TariffTable({ tariffs, onSave }: TariffTableProps) {
  const { t } = useTranslation();
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);

  function handleEdit(item: PLNTariff) {
    setEditingKey(item.key);
    setEditValue(item.tarif > 0 ? item.tarif.toString() : "");
  }

  async function handleSave(key: string) {
    const val = parseFloat(editValue);
    if (isNaN(val) || val < 0) {
      toast.error(t("invalidTariffValue"));
      return;
    }
    setSaving(true);
    try {
      await onSave(key, val);
      setEditingKey(null);
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setEditingKey(null);
    setEditValue("");
  }

  const groups = tariffs.reduce<Record<string, PLNTariff[]>>((acc, item) => {
    (acc[item.golongan] ??= []).push(item);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      {Object.entries(groups).map(([golongan, items]) => (
        <div key={golongan}>
          <h4 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
            <Zap className="h-3.5 w-3.5 text-yellow-500" />
            {t("golongan")} {golongan}
          </h4>
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("daya")}</TableHead>
                  <TableHead>{t("keterangan")}</TableHead>
                  <TableHead className="text-right">
                    {t("tarifRpKwh")}
                  </TableHead>
                  <TableHead className="w-24" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.key}>
                    <TableCell className="font-medium">{item.daya}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {item.description}
                    </TableCell>
                    <TableCell className="text-right">
                      {editingKey === item.key ? (
                        <Input
                          type="number"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="w-28 ml-auto text-right h-8"
                          min="0"
                          step="1"
                          autoFocus
                        />
                      ) : item.tarif > 0 ? (
                        <span className="font-mono font-semibold">
                          {item.tarif.toLocaleString("id-ID")}
                        </span>
                      ) : (
                        <span className="text-muted-foreground italic text-sm flex items-center justify-end gap-1">
                          <AlertCircle className="h-3.5 w-3.5 text-orange-400" />
                          {t("tariffNotSet")}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {editingKey === item.key ? (
                        <div className="flex gap-1 justify-end">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            onClick={() => handleSave(item.key)}
                            disabled={saving}
                          >
                            <Check className="h-3.5 w-3.5 text-green-600" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            onClick={handleCancel}
                            disabled={saving}
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 ml-auto flex"
                          onClick={() => handleEdit(item)}
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      ))}
    </div>
  );
}
