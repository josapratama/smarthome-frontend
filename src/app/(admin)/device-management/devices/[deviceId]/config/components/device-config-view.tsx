"use client";

import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { qk } from "@/lib/api/queries";
import { apiFetchBrowser } from "@/lib/api/client/fetch";
import { getDeviceConfig } from "@/lib/api/services/device-config";
import type { DeviceDTO } from "@/lib/api/dto/devices.dto";
import { useTranslation } from "@/hooks/use-translation";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Home as HomeIcon } from "lucide-react";

import {
  isSensorDeviceType,
  DEFAULT_SENSOR_CONFIG,
} from "../lib/sensor-config.types";
import { SensorConfigUI } from "./sensor-config-ui";
import { JsonConfigUI } from "./json-config-ui";

interface DeviceConfigViewProps {
  deviceId: number;
}

export function DeviceConfigView({ deviceId }: DeviceConfigViewProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();

  const deviceQuery = useQuery({
    queryKey: qk.devices.detail(deviceId),
    queryFn: async () => {
      const res = await apiFetchBrowser<{ data: DeviceDTO }>(
        `/api/v1/devices/${deviceId}`,
      );
      return res.data;
    },
  });

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

  const isSensor = isSensorDeviceType(deviceQuery.data?.deviceType ?? "");
  const isLoading = deviceQuery.isLoading || configQuery.isLoading;
  const hasError = !!(deviceQuery.error || configQuery.error);

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <button
          onClick={() => router.push("/device-management")}
          className="hover:text-foreground transition-colors flex items-center gap-1"
        >
          <HomeIcon className="h-4 w-4" />
          {t("deviceManagement")}
        </button>
        <span>/</span>
        <button
          onClick={() => router.push(`/device-management/devices/${deviceId}`)}
          className="hover:text-foreground transition-colors"
        >
          {t("device")} #{deviceId}
        </button>
        <span>/</span>
        <span className="text-foreground font-medium">
          {t("configuration")}
        </span>
      </div>

      {/* Device type hint */}
      {deviceQuery.data && (
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {deviceQuery.data.deviceType.replace(/_/g, " ")}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {isSensor ? t("sensorDeviceType") : t("genericDeviceType")}
          </span>
        </div>
      )}

      {/* Loading skeleton */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-2xl" />
          ))}
        </div>
      )}

      {/* Error state */}
      {hasError && !isLoading && (
        <Card className="rounded-2xl">
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">
              {t("failedLoadDeviceConfig")}
            </p>
            <Button
              className="mt-4"
              variant="outline"
              onClick={() => {
                deviceQuery.refetch();
                configQuery.refetch();
              }}
            >
              {t("retryLoad")}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Content */}
      {!isLoading &&
        !hasError &&
        (isSensor ? (
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
