"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings, Save, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/use-translation";
import { upsertDeviceConfig } from "@/lib/api/services/device-config";
import { apiFetchBrowser } from "@/lib/api/client/fetch";
import { SENSOR_DEFS } from "../lib/sensor-defs";
import type { SensorConfig } from "../lib/sensor-config.types";
import { SensorToggleCard } from "./sensor-toggle-card";
import { BinHeightCard } from "./bin-height-card";

interface SensorConfigUIProps {
  deviceId: number;
  initialConfig: SensorConfig;
  onSaved: () => void;
}

export function SensorConfigUI({
  deviceId,
  initialConfig,
  onSaved,
}: SensorConfigUIProps) {
  const { t } = useTranslation();
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
        title: t("configSavedSuccessfully"),
        description: t("configSentToDevice"),
      });
    },
    onError: (error: any) => {
      if (error?.status === 404) {
        setIsDirty(false);
        onSaved();
        toast({
          title: t("configSavedSuccessfully"),
          description: t("configSavedDbOnly"),
        });
      } else {
        toast({
          title: t("configSendFailed"),
          description: error.message,
          variant: "destructive",
        });
      }
    },
  });

  function toggle(key: keyof Omit<SensorConfig, "bin_height">, val: boolean) {
    setConfig((prev) => ({ ...prev, [key]: val }));
    setIsDirty(true);
  }

  function handleBinHeight(val: number) {
    setConfig((prev) => ({ ...prev, bin_height: val }));
    setIsDirty(true);
  }

  function handleCancel() {
    setConfig(initialConfig);
    setIsDirty(false);
  }

  const enabledCount = SENSOR_DEFS.filter((s) => config[s.key]).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">{t("sensorConfiguration")}</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {t("sensorConfigDesc")}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleCancel} disabled={!isDirty}>
            {t("cancel")}
          </Button>
          <Button
            onClick={() => saveMutation.mutate(config)}
            disabled={!isDirty || saveMutation.isPending}
          >
            <Save className="mr-2 h-4 w-4" />
            {saveMutation.isPending ? t("saving") : t("saveAndSend")}
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
              <p className="text-xs text-muted-foreground">
                {t("sensorActiveCount")}
              </p>
              <p className="text-base font-semibold">
                {enabledCount} / {SENSOR_DEFS.length}
              </p>
            </div>
            {isDirty && (
              <Badge
                variant="outline"
                className="ml-auto text-yellow-600 border-yellow-400"
              >
                {t("unsavedChanges")}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Sensor toggles */}
      {SENSOR_DEFS.map((sensor) => (
        <SensorToggleCard
          key={sensor.key}
          label={t(sensor.labelKey as any)}
          desc={t(sensor.descKey as any)}
          icon={sensor.icon}
          color={sensor.color}
          bg={sensor.bg}
          enabled={config[sensor.key]}
          enabledLabel={t("sensorEnabled")}
          disabledLabel={t("sensorDisabled")}
          onToggle={(val) => toggle(sensor.key, val)}
        />
      ))}

      {/* Bin height — only when ultrasonic is enabled */}
      {config.ultrasonic_en && (
        <BinHeightCard
          value={config.bin_height}
          onChange={handleBinHeight}
          label={t("binHeightLabel")}
          unit={t("binHeightUnit")}
          desc={t("binHeightDesc")}
        />
      )}

      {/* Info note */}
      <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-blue-700 dark:text-blue-300">
            <strong>{t("saveAndSend")}</strong> — {t("sensorConfigNote")}
          </p>
        </div>
      </div>
    </div>
  );
}
