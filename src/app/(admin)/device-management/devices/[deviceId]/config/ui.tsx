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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Save,
  Settings,
  AlertCircle,
  CheckCircle2,
  Code,
  Home as HomeIcon,
  Zap,
  Flame,
  Wind,
  Ruler,
  RotateCcw,
} from "lucide-react";
import {
  getDeviceConfig,
  upsertDeviceConfig,
} from "@/lib/api/services/device-config";
import { apiFetchBrowser } from "@/lib/api/client/fetch";
import { qk } from "@/lib/api/queries";
import type { DeviceDTO } from "@/lib/api/dto/devices.dto";

// ─────────────────────────────────────────────────────────────
// Tipe perangkat yang menggunakan sensor toggle UI
// ─────────────────────────────────────────────────────────────
const SENSOR_DEVICE_TYPES = ["SENSOR_NODE", "ENERGY_MONITOR"];

// ─────────────────────────────────────────────────────────────
// Sensor toggle UI (untuk SENSOR_NODE / ENERGY_MONITOR)
// ─────────────────────────────────────────────────────────────
interface SensorConfig {
  pzem_en: boolean;
  mq2_en: boolean;
  flame_en: boolean;
  ultrasonic_en: boolean;
  bin_height: number;
}

const DEFAULT_SENSOR_CONFIG: SensorConfig = {
  pzem_en: true,
  mq2_en: true,
  flame_en: true,
  ultrasonic_en: true,
  bin_height: 100,
};

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

// ─────────────────────────────────────────────────────────────
// Sensor Toggle UI Component
// ─────────────────────────────────────────────────────────────
function SensorConfigUI({
  deviceId,
  initialConfig,
  onSaved,
}: {
  deviceId: number;
  initialConfig: SensorConfig;
  onSaved: () => void;
}) {
  const { toast } = useToast();
  const [config, setConfig] = useState<SensorConfig>(initialConfig);
  const [isDirty, setIsDirty] = useState(false);

  const saveMutation = useMutation({
    mutationFn: async (cfg: SensorConfig) => {
      await upsertDeviceConfig(deviceId, { config: cfg });
      await apiFetchBrowser(`/api/v1/devices/${deviceId}/config/send`, {
        method: "POST",
        body: JSON.stringify({ config: cfg }),
      });
    },
    onSuccess: () => {
      setIsDirty(false);
      onSaved();
      toast({
        title: "Konfigurasi disimpan",
        description: "Pengaturan sensor berhasil dikirim ke perangkat.",
      });
    },
    onError: (error: any) => {
      if (error?.status === 404) {
        setIsDirty(false);
        onSaved();
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

  function toggle(key: keyof Omit<SensorConfig, "bin_height">, val: boolean) {
    setConfig((p) => ({ ...p, [key]: val }));
    setIsDirty(true);
  }

  const enabledCount = SENSOR_DEFS.filter((s) => config[s.key]).length;

  return (
    <div className="space-y-4">
      {/* Header actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">Konfigurasi Sensor</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Aktifkan atau nonaktifkan sensor tanpa perlu upload ulang firmware
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setConfig(initialConfig);
              setIsDirty(false);
            }}
            disabled={!isDirty}
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

      {/* Summary */}
      <Card className="rounded-xl">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <Settings className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Sensor aktif</p>
              <p className="text-base font-semibold">
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

      {/* Toggles */}
      {SENSOR_DEFS.map((sensor) => {
        const Icon = sensor.icon;
        const enabled = config[sensor.key];
        return (
          <Card
            key={sensor.key}
            className={`rounded-2xl shadow-sm transition-all ${enabled ? "border-primary/30" : "opacity-70"}`}
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
                  checked={enabled}
                  onCheckedChange={(val) => toggle(sensor.key, val)}
                  className="flex-shrink-0"
                />
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Bin height */}
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
                onChange={(e) => {
                  setConfig((p) => ({
                    ...p,
                    bin_height: Number(e.target.value),
                  }));
                  setIsDirty(true);
                }}
                className="w-32"
              />
              <Label className="text-sm text-muted-foreground">cm</Label>
              <p className="text-xs text-muted-foreground">
                Tinggi wadah dari sensor ke dasar (untuk menghitung persentase
                isi)
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-blue-700 dark:text-blue-300">
            <strong>Simpan &amp; Kirim</strong> — konfigurasi disimpan ke
            database dan dikirim langsung ke perangkat via MQTT (
            <code>UPDATE_CONFIG</code>). Berlaku tanpa reflash firmware.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// JSON Editor UI Component (untuk relay / perangkat lain)
// ─────────────────────────────────────────────────────────────
function JsonConfigUI({
  deviceId,
  initialConfig,
  onSaved,
}: {
  deviceId: number;
  initialConfig: Record<string, any>;
  onSaved: () => void;
}) {
  const { toast } = useToast();
  const [configText, setConfigText] = useState(
    JSON.stringify(initialConfig, null, 2),
  );
  const [jsonError, setJsonError] = useState<string | null>(null);

  const originalText = JSON.stringify(initialConfig, null, 2);
  const hasChanges = configText !== originalText;
  const isValid = !jsonError && configText.trim().length > 0;

  const saveMutation = useMutation({
    mutationFn: async (cfg: Record<string, any>) => {
      await upsertDeviceConfig(deviceId, { config: cfg });
    },
    onSuccess: () => {
      onSaved();
      toast({ title: "Konfigurasi disimpan" });
    },
    onError: (error: any) => {
      toast({
        title: "Gagal menyimpan",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  function handleChange(val: string) {
    setConfigText(val);
    try {
      JSON.parse(val);
      setJsonError(null);
    } catch (e: any) {
      setJsonError(e.message);
    }
  }

  function handleSave() {
    try {
      saveMutation.mutate(JSON.parse(configText));
    } catch (e: any) {
      toast({
        title: "JSON tidak valid",
        description: e.message,
        variant: "destructive",
      });
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">Konfigurasi Perangkat</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Edit konfigurasi dalam format JSON
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setConfigText(originalText);
              setJsonError(null);
            }}
            disabled={!hasChanges}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
          <Button
            onClick={handleSave}
            disabled={!isValid || !hasChanges || saveMutation.isPending}
          >
            <Save className="mr-2 h-4 w-4" />
            {saveMutation.isPending ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      </div>

      {/* Status */}
      <div className="grid gap-3 md:grid-cols-2">
        <Card className="rounded-xl">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div
                className={`h-9 w-9 rounded-lg flex items-center justify-center ${isValid ? "bg-green-100 dark:bg-green-900" : "bg-red-100 dark:bg-red-900"}`}
              >
                {isValid ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                )}
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Status JSON</p>
                <p className="text-sm font-semibold">
                  {isValid ? "Valid" : "Tidak valid"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-xl">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div
                className={`h-9 w-9 rounded-lg flex items-center justify-center ${hasChanges ? "bg-yellow-100 dark:bg-yellow-900" : "bg-gray-100 dark:bg-gray-800"}`}
              >
                <Code className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Status</p>
                <p className="text-sm font-semibold">
                  {hasChanges ? "Diubah" : "Tersimpan"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl shadow-sm">
        <CardContent className="pt-5 pb-5">
          <Textarea
            value={configText}
            onChange={(e) => handleChange(e.target.value)}
            className="font-mono text-sm min-h-[300px] bg-muted/50"
            placeholder='{"key": "value"}'
          />
          {jsonError && (
            <div className="mt-2 p-3 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
              <p className="text-xs text-red-700 dark:text-red-300">
                {jsonError}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────
export function DeviceConfigClient({ deviceId }: { deviceId: number }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Fetch device info untuk tahu tipe perangkat
  const deviceQuery = useQuery({
    queryKey: qk.devices.detail(deviceId),
    queryFn: async () => {
      const res = await apiFetchBrowser<{ data: DeviceDTO }>(
        `/api/v1/devices/${deviceId}`,
      );
      return res.data;
    },
  });

  // Fetch config
  const configQuery = useQuery({
    queryKey: ["device-config", deviceId],
    queryFn: async () => {
      const res = await getDeviceConfig(deviceId);
      return res?.data?.config?.config ?? res?.data?.config ?? {};
    },
    enabled: !!deviceId,
  });

  function onSaved() {
    queryClient.invalidateQueries({ queryKey: ["device-config", deviceId] });
  }

  const isSensorDevice = SENSOR_DEVICE_TYPES.includes(
    deviceQuery.data?.deviceType ?? "",
  );
  const isLoading = deviceQuery.isLoading || configQuery.isLoading;

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

      {/* Device type badge */}
      {deviceQuery.data && (
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {deviceQuery.data.deviceType.replace(/_/g, " ")}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {isSensorDevice
              ? "— Konfigurasi sensor tersedia"
              : "— Konfigurasi JSON umum"}
          </span>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-2xl" />
          ))}
        </div>
      )}

      {/* Error */}
      {(deviceQuery.error || configQuery.error) && !isLoading && (
        <Card className="rounded-2xl">
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">
              Gagal memuat data perangkat
            </p>
            <Button
              className="mt-4"
              variant="outline"
              onClick={() => {
                deviceQuery.refetch();
                configQuery.refetch();
              }}
            >
              Coba lagi
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Content — render berdasarkan tipe perangkat */}
      {!isLoading &&
        !deviceQuery.error &&
        !configQuery.error &&
        (isSensorDevice ? (
          <SensorConfigUI
            deviceId={deviceId}
            initialConfig={{
              ...DEFAULT_SENSOR_CONFIG,
              ...(configQuery.data ?? {}),
            }}
            onSaved={onSaved}
          />
        ) : (
          <JsonConfigUI
            deviceId={deviceId}
            initialConfig={configQuery.data ?? {}}
            onSaved={onSaved}
          />
        ))}
    </div>
  );
}
