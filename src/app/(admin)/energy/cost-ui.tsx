"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, Save, X, Home, Zap, AlertCircle, Check } from "lucide-react";
import { toast } from "sonner";
import {
  adminGetTariffs,
  adminSetTariff,
  adminGetHomeTariffs,
  adminSetHomeTariff,
  adminDeleteHomeTariff,
  type PLNTariff,
  type HomeTariff,
} from "@/lib/api/services/energy-cost";

// ─── Tariff Table ─────────────────────────────────────────────────────────────

function TariffTable({
  tariffs,
  onSave,
}: {
  tariffs: PLNTariff[];
  onSave: (key: string, tarif: number) => Promise<void>;
}) {
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);

  const handleEdit = (t: PLNTariff) => {
    setEditingKey(t.key);
    setEditValue(t.tarif > 0 ? t.tarif.toString() : "");
  };

  const handleSave = async (key: string) => {
    const val = parseFloat(editValue);
    if (isNaN(val) || val < 0) {
      toast.error("Nilai tarif tidak valid");
      return;
    }
    setSaving(true);
    try {
      await onSave(key, val);
      setEditingKey(null);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditingKey(null);
    setEditValue("");
  };

  // Group by golongan
  const groups = tariffs.reduce<Record<string, PLNTariff[]>>((acc, t) => {
    if (!acc[t.golongan]) acc[t.golongan] = [];
    acc[t.golongan].push(t);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      {Object.entries(groups).map(([golongan, items]) => (
        <div key={golongan}>
          <h4 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
            <Zap className="h-3.5 w-3.5 text-yellow-500" />
            Golongan {golongan}
          </h4>
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Daya</TableHead>
                  <TableHead>Keterangan</TableHead>
                  <TableHead className="text-right">Tarif (Rp/kWh)</TableHead>
                  <TableHead className="w-24" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((t) => (
                  <TableRow key={t.key}>
                    <TableCell className="font-medium">{t.daya}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {t.description}
                    </TableCell>
                    <TableCell className="text-right">
                      {editingKey === t.key ? (
                        <Input
                          type="number"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="w-28 ml-auto text-right h-8"
                          min="0"
                          step="1"
                          autoFocus
                        />
                      ) : t.tarif > 0 ? (
                        <span className="font-mono font-semibold">
                          {t.tarif.toLocaleString("id-ID")}
                        </span>
                      ) : (
                        <span className="text-muted-foreground italic text-sm flex items-center justify-end gap-1">
                          <AlertCircle className="h-3.5 w-3.5 text-orange-400" />
                          Belum ditentukan
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {editingKey === t.key ? (
                        <div className="flex gap-1 justify-end">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            onClick={() => handleSave(t.key)}
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
                          onClick={() => handleEdit(t)}
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

// ─── Home Tariff Row ──────────────────────────────────────────────────────────

function HomeTariffRow({
  home,
  tariffs,
  onSave,
  onReset,
}: {
  home: HomeTariff;
  tariffs: PLNTariff[];
  onSave: (homeId: number, key: string) => Promise<void>;
  onReset: (homeId: number) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [selected, setSelected] = useState(home.selectedTariffKey ?? "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await onSave(home.homeId, selected);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    setSaving(true);
    try {
      await onReset(home.homeId);
      setSelected("");
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/30 transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <Home className="h-4 w-4 text-primary" />
        </div>
        <div className="min-w-0">
          <p className="font-semibold truncate">{home.homeName}</p>
          <p className="text-xs text-muted-foreground">ID: {home.homeId}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        {editing ? (
          <>
            <Select value={selected} onValueChange={setSelected}>
              <SelectTrigger className="w-56 h-8 text-sm">
                <SelectValue placeholder="Pilih golongan..." />
              </SelectTrigger>
              <SelectContent>
                {tariffs.map((t) => (
                  <SelectItem key={t.key} value={t.key}>
                    <span className="text-sm">{t.description}</span>
                    {t.tarif > 0 && (
                      <span className="ml-2 text-xs text-muted-foreground font-mono">
                        Rp{t.tarif.toLocaleString("id-ID")}
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
              Simpan
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
                        Tarif belum diset admin
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
                  Belum dipilih
                </Badge>
              )}
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setEditing(true)}
            >
              <Edit className="h-3.5 w-3.5 mr-1" />
              Ubah
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

// ─── Main Component ───────────────────────────────────────────────────────────

export default function EnergyCostUI() {
  const [tariffs, setTariffs] = useState<PLNTariff[]>([]);
  const [homeTariffs, setHomeTariffs] = useState<HomeTariff[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [t, h] = await Promise.all([
        adminGetTariffs(),
        adminGetHomeTariffs(),
      ]);
      setTariffs(t);
      setHomeTariffs(h);
    } catch (error: any) {
      toast.error(error.message || "Gagal memuat data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveTariff = async (key: string, tarif: number) => {
    const updated = await adminSetTariff(key, tarif);
    setTariffs(updated);
    toast.success("Tarif diperbarui");
  };

  const handleSaveHomeTariff = async (homeId: number, tariffKey: string) => {
    await adminSetHomeTariff(homeId, tariffKey);
    const updated = await adminGetHomeTariffs();
    setHomeTariffs(updated);
    toast.success("Golongan tarif home diperbarui");
  };

  const handleResetHomeTariff = async (homeId: number) => {
    await adminDeleteHomeTariff(homeId);
    const updated = await adminGetHomeTariffs();
    setHomeTariffs(updated);
    toast.success("Pilihan tarif home direset");
  };

  const setCount = tariffs.filter((t) => t.tarif > 0).length;
  const homeSetCount = homeTariffs.filter((h) => h.selectedTariffKey).length;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-2xl shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Golongan</p>
                <p className="text-2xl font-bold">{tariffs.length}</p>
              </div>
              <Zap className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Tarif Sudah Diset
                </p>
                <p className="text-2xl font-bold">{setCount}</p>
              </div>
              <Check className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Home Sudah Pilih Golongan
                </p>
                <p className="text-2xl font-bold">
                  {homeSetCount}/{homeTariffs.length}
                </p>
              </div>
              <Home className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tariff Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            Kelola Tarif per Golongan PLN
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Set harga tarif listrik (Rp/kWh) untuk setiap golongan. Nilai 0
            berarti belum ditentukan.
          </p>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-12 rounded-lg" />
              ))}
            </div>
          ) : (
            <TariffTable tariffs={tariffs} onSave={handleSaveTariff} />
          )}
        </CardContent>
      </Card>

      {/* Home Tariff Assignment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5 text-primary" />
            Golongan Tarif per Home
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Atur golongan listrik yang digunakan setiap home. User juga bisa
            mengatur ini sendiri.
          </p>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 rounded-lg" />
              ))}
            </div>
          ) : homeTariffs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Home className="h-12 w-12 mx-auto mb-3 opacity-40" />
              <p>Belum ada home terdaftar</p>
            </div>
          ) : (
            <div className="space-y-2">
              {homeTariffs.map((home) => (
                <HomeTariffRow
                  key={home.homeId}
                  home={home}
                  tariffs={tariffs}
                  onSave={handleSaveHomeTariff}
                  onReset={handleResetHomeTariff}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info */}
      <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900 dark:text-blue-100">
              <p className="font-medium mb-1">Cara Kerja</p>
              <ul className="text-blue-700 dark:text-blue-300 space-y-1 list-disc list-inside">
                <li>Admin set tarif Rp/kWh untuk setiap golongan PLN</li>
                <li>
                  User memilih golongan listrik yang dipakai di home mereka
                </li>
                <li>
                  Estimasi biaya energi dihitung otomatis dari tarif golongan
                  yang dipilih
                </li>
                <li>
                  Jika golongan belum dipilih atau tarif belum diset, estimasi
                  biaya = 0
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
