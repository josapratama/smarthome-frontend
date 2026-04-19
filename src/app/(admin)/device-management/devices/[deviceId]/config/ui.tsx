"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useTranslation } from "@/hooks/use-translation";
import { useToast } from "@/hooks/use-toast";
import {
  Save,
  Settings,
  AlertCircle,
  Home as HomeIcon,
  Zap,
  Flame,
  Wind,
  Ruler,
} from "lucide-react";
import {
  getDeviceConfig,
  upsertDeviceConfig,
} from "@/lib/api/services/device-config";
import { apiFetchBrowser } from "@/lib/api/client/fetch";

// ── Tipe konfigurasi sensor ───────────────────────────────────
interface SensorConfig {
  pzem_en: boolean;
  mq2_en: boolean;
  flame_en: boolean;
  ultrasonic_en: boolean;
  bin_height: number;
}

const DEFAULT_CONFIG: SensorConfig = {
  pzem_en: true,
  mq2_en: true,
  flame_en: true,
  ultrasonic_en: true,
  bin_height: 100,
};

// ── Deskripsi tiap sensor ─────────────────────────────────────
const SENSOR_DEFS = [
  {
    key: "pzem_en" as const,
    label: "PZEM004T — Energy Monitor",
    desc: "Mengukur tegangan, arus, daya, dan energi listrik (kWh)",
    icon: Zap,
    color: "text-orange-500",
    bg: "bg-orange-100 dark:bg-orange-900",
  },
  {
    key: "mq2_en" as const,
    label: "MQ-2 — Gas Sensor",
    desc: "Mendeteksi kebocoran gas LPG, asap, dan karbon monoksida",
    icon: Wind,
    color: "text-blue-500",
    bg: "bg-blue-100 dark:bg-blue-900",
  },
  {
    key: "flame_en" as const,
    label: "Flame Sensor",
    desc: "Mendeteksi keberadaan api atau sumber panas inframerah",
    icon: Flame,
    color: "text-red-500",
    bg: "bg-red-100 dark:bg-red-900",
  },
  {
    key: "ultrasonic_en" as const,
    label: "HC-SR04 — Ultrasonic",
    desc: "Mengukur jarak / level isi wadah (tempat sampah, tangki, dll)",
    icon: Ruler,
    color: "text-purple-500",
    bg: "bg-purple-100 dark:bg-purple-900",
  },
];

export function DeviceConfigClient({ deviceId }: { deviceId: number }) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [config, setConfig] = useState<SensorConfig>(DEFAULT_CONFIG);
  const [isDirty, setIsDirty] = useState(false);

  // ── Fetch config ──────────────────────────────────────────
  const configQuery = useQuery({
    queryKey: ["device-config", deviceId],
    queryFn: async () => {
      const response = await getDeviceConfig(deviceId);
      const raw =
        response?.data?.config?.config ?? response?.data?.config ?? {};
      const merged: SensorConfig = { ...DEFAULT_CONFIG, ...raw };
      setConfig(merged);
      setIsDirty(false);
      return merged;
    },
    enabled: !!deviceId,
  });

  // ── Save config ke DB + kirim UPDATE_CONFIG ke device ────
  const saveMutation = useMutation({
    mutationFn: async (cfg: SensorConfig) => {
      // 1. Simpan ke DB
      await upsertDeviceConfig(deviceId, { config: cfg });
      // 2. Kirim command UPDATE_CONFIG ke device via MQTT
      await apiFetchBrowser(`/api/v1/devices/${deviceId}/config/send`, {
        method: "POST",
        body: JSON.stringify({ config: cfg }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["device-config", deviceId] });
      setIsDirty(false);
      toast({
        title: "Konfigurasi disimpan",
        description: "Pengaturan sensor berhasil dikirim ke perangkat.",
      });
    },
    onError: (error: any) => {
      // Jika endpoint send belum ada, tetap anggap berhasil simpan ke DB
      if (error?.status === 404) {
        queryClient.invalidateQueries({
          queryKey: ["device-config", deviceId],
        });
        setIsDirty(false);
        toast({
          title: "Konfigurasi disimpan",
          description:
            "Tersimpan di database. Perangkat akan mengambil saat reconnect.",
        });
      } else {
        toast({
          title: "Gagal menyimpan",
          description: error.message,
          variant: "destructive",
        });
      }
    },
  });

  function toggleSensor(
    key: keyof Omit<SensorConfig, "bin_height">,
    value: boolean,
  ) {
    setConfig((prev) => ({ ...prev, [key]: value }));
    setIsDirty(true);
  }

  function setBinHeight(value: number) {
    setConfig((prev) => ({ ...prev, bin_height: value }));
    setIsDirty(true);
  }

  function handleReset() {
    if (configQuery.data) {
      setConfig(configQuery.data);
      setIsDirty(false);
    }
  }

  const enabledCount = SENSOR_DEFS.filter((s) => config[s.key]).length;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <button
          onClick={() => router.push("/device-management")}
          className="hover:text-foreground transition-colors flex items-center gap-1"
        >
          <HomeIcon className="h-4 w-4" />
          Manajemen Perangkat
        </button>
        <span>/</span>
        <button
          onClick={() => router.push(`/device-management/devices/${deviceId}`)}
          className="hover:text-foreground transition-colors"
        >
          Perangkat #{deviceId}
        </button>
        <span>/</span>
        <span className="text-foreground font-medium">Konfigurasi</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Konfigurasi Sensor</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Aktifkan atau nonaktifkan sensor tanpa perlu upload ulang firmware
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={!isDirty || configQuery.isLoading}
          >
            Batalkan
          </Button>
          <Button
            onClick={() => saveMutation.mutate(config)}
            disabled={!isDirty || saveMutation.isPending}
          >
            <Save className="mr-2 h-4 w-4" />
            {saveMutation.isPending ? "Menyimpan..." : "Simpan & Kirim"}
          </Button>
        </div>
      </div>

      {/* Summary card */}
      <Card className="rounded-xl">
        <CardContent className="pt-5 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <Settings className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Sensor aktif</p>
              <p className="text-lg font-semibold">
                {enabledCount} / {SENSOR_DEFS.length}
              </p>
            </div>
            {isDirty && (
              <Badge
                variant="outline"
                className="ml-auto text-yellow-600 border-yellow-400"
              >
                Belum disimpan
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Sensor toggles */}
      {configQuery.isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-2xl" />
          ))}
        </div>
      ) : configQuery.error ? (
        <Card className="rounded-2xl">
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">
              Gagal memuat konfigurasi
            </p>
            <Button
              className="mt-4"
              variant="outline"
              onClick={() => configQuery.refetch()}
            >
              Coba lagi
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {SENSOR_DEFS.map((sensor) => {
            const Icon = sensor.icon;
            const enabled = config[sensor.key];
            return (
              <Card
                key={sensor.key}
                className={`rounded-2xl shadow-sm transition-all ${
                  enabled ? "border-primary/30" : "opacity-70"
                }`}
              >
                <CardContent className="pt-5 pb-5">
                  <div className="flex items-center gap-4">
                    <div
                      className={`h-11 w-11 rounded-xl flex items-center justify-center flex-shrink-0 ${sensor.bg}`}
                    >
                      <Icon className={`h-5 w-5 ${sensor.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold">{sensor.label}</p>
                        <Badge
                          variant={enabled ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {enabled ? "Aktif" : "Nonaktif"}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {sensor.desc}
                      </p>
                    </div>
                    <Switch
                      id={sensor.key}
                      checked={enabled}
                      onCheckedChange={(val) => toggleSensor(sensor.key, val)}
                      className="flex-shrink-0"
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {/* Bin height — hanya tampil jika ultrasonic aktif */}
          {config.ultrasonic_en && (
            <Card className="rounded-2xl shadow-sm border-purple-200 dark:border-purple-800">
              <CardHeader className="pb-2 pt-5">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Ruler className="h-4 w-4 text-purple-500" />
                  Tinggi Wadah (Ultrasonic)
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-5">
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    min={5}
                    max={500}
                    value={config.bin_height}
                    onChange={(e) => setBinHeight(Number(e.target.value))}
                    className="w-32"
                  />
                  <Label className="text-sm text-muted-foreground">cm</Label>
                  <p className="text-xs text-muted-foreground">
                    Tinggi wadah/tangki dari sensor ke dasar (digunakan untuk
                    menghitung persentase isi)
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Info box */}
      <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Cara kerja konfigurasi
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
              Klik <strong>Simpan &amp; Kirim</strong> — konfigurasi disimpan ke
              database dan dikirim langsung ke perangkat via MQTT (
              <code>UPDATE_CONFIG</code>). Sensor yang dinonaktifkan tidak akan
              membaca data dan tidak muncul di telemetri. Perubahan berlaku
              tanpa perlu upload ulang firmware.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
