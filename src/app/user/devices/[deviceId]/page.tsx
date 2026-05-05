"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Activity,
  Sliders,
  Download,
  TrendingUp,
  ArrowLeft,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { devicesApi, type DeviceWithDetails } from "@/lib/api/services/devices";
import dynamic from "next/dynamic";

// Lazy load heavy components
const DeviceOverview = dynamic(() => import("./device-overview"), {
  ssr: false,
  loading: () => <Skeleton className="h-48 rounded-lg" />,
});
const DeviceChannels = dynamic(() => import("./device-channels"), {
  ssr: false,
  loading: () => <Skeleton className="h-48 rounded-lg" />,
});
const DeviceTelemetry = dynamic(() => import("./device-telemetry"), {
  ssr: false,
  loading: () => <Skeleton className="h-48 rounded-lg" />,
});
const DeviceOTA = dynamic(() => import("./device-ota"), {
  ssr: false,
  loading: () => <Skeleton className="h-48 rounded-lg" />,
});

// Komponen terpisah untuk membaca searchParams (wajib dibungkus Suspense)
function DeviceDetailContent({ deviceId }: { deviceId: number }) {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState(
    searchParams.get("tab") || "overview",
  );
  const [device, setDevice] = useState<DeviceWithDetails | null>(null);
  const [isLoadingDevice, setIsLoadingDevice] = useState(true);

  useEffect(() => {
    if (!deviceId || isNaN(deviceId)) return;
    setIsLoadingDevice(true);
    devicesApi
      .getById(deviceId)
      .then((d) => setDevice(d))
      .catch(() => setDevice(null))
      .finally(() => setIsLoadingDevice(false));
  }, [deviceId]);

  return (
    <div className="space-y-4">
      {/* Device Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/user/devices")}
          className="shrink-0"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        {isLoadingDevice ? (
          <Skeleton className="h-8 w-48" />
        ) : device ? (
          <div className="flex items-center gap-3 min-w-0">
            <div className="min-w-0">
              <h1 className="text-xl font-bold truncate">{device.name}</h1>
              <p className="text-sm text-muted-foreground">{device.type}</p>
            </div>
            {device.status === "ONLINE" ? (
              <Badge className="bg-green-600 gap-1 shrink-0">
                <Wifi className="h-3 w-3" />
                {t("online")}
              </Badge>
            ) : (
              <Badge variant="secondary" className="gap-1 shrink-0">
                <WifiOff className="h-3 w-3" />
                {t("offline")}
              </Badge>
            )}
          </div>
        ) : (
          <h1 className="text-xl font-bold text-muted-foreground">
            {t("deviceNotFound")}
          </h1>
        )}
      </div>

      {/* Shadcn Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="w-full h-auto flex overflow-x-auto scrollbar-none">
          <TabsTrigger
            value="overview"
            className="flex-1 min-w-[60px] gap-1.5 py-2 text-xs sm:text-sm"
          >
            <Activity className="h-3.5 w-3.5 shrink-0" />
            <span className="hidden xs:inline">{t("overview")}</span>
          </TabsTrigger>
          <TabsTrigger
            value="channels"
            className="flex-1 min-w-[60px] gap-1.5 py-2 text-xs sm:text-sm"
          >
            <Sliders className="h-3.5 w-3.5 shrink-0" />
            <span className="hidden xs:inline">{t("channels")}</span>
          </TabsTrigger>
          <TabsTrigger
            value="telemetry"
            className="flex-1 min-w-[60px] gap-1.5 py-2 text-xs sm:text-sm"
          >
            <TrendingUp className="h-3.5 w-3.5 shrink-0" />
            <span className="hidden xs:inline">{t("telemetry")}</span>
          </TabsTrigger>
          <TabsTrigger
            value="ota"
            className="flex-1 min-w-[60px] gap-1.5 py-2 text-xs sm:text-sm"
          >
            <Download className="h-3.5 w-3.5 shrink-0" />
            <span className="hidden xs:inline">{t("firmware")}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <DeviceOverview deviceId={deviceId} />
        </TabsContent>
        <TabsContent value="channels">
          <DeviceChannels deviceId={deviceId} />
        </TabsContent>
        <TabsContent value="telemetry">
          <DeviceTelemetry deviceId={deviceId} />
        </TabsContent>
        <TabsContent value="ota">
          <DeviceOTA deviceId={deviceId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function DeviceDetailPage() {
  const params = useParams();
  const deviceId = parseInt(params.deviceId as string);

  return (
    <Suspense fallback={<Skeleton className="h-96 rounded-lg" />}>
      <DeviceDetailContent deviceId={deviceId} />
    </Suspense>
  );
}
