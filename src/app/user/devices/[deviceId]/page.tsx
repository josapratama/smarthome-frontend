"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Activity,
  Settings,
  Sliders,
  Terminal,
  Download,
  TrendingUp,
} from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { PageHeader } from "@/components/ui/page-header";
import dynamic from "next/dynamic";

// Lazy load heavy components
const DeviceOverview = dynamic(() => import("./device-overview"), {
  ssr: false,
});
const DeviceChannels = dynamic(() => import("./device-channels"), {
  ssr: false,
});
const DeviceCommands = dynamic(() => import("./device-commands"), {
  ssr: false,
});
const DeviceConfig = dynamic(() => import("./device-config"), { ssr: false });
const DeviceTelemetry = dynamic(() => import("./device-telemetry"), {
  ssr: false,
});
const DeviceOTA = dynamic(() => import("./device-ota"), { ssr: false });

export default function DeviceDetailPage() {
  const { t } = useTranslation();
  const params = useParams();
  const deviceId = parseInt(params.deviceId as string);
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="space-y-4">
      <PageHeader />

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 h-auto">
          <TabsTrigger value="overview" className="gap-2 py-2">
            <Activity className="h-4 w-4" />
            <span className="hidden sm:inline">{t("overview")}</span>
          </TabsTrigger>
          <TabsTrigger value="channels" className="gap-2 py-2">
            <Sliders className="h-4 w-4" />
            <span className="hidden sm:inline">{t("channels")}</span>
          </TabsTrigger>
          <TabsTrigger value="commands" className="gap-2 py-2">
            <Terminal className="h-4 w-4" />
            <span className="hidden sm:inline">{t("commands")}</span>
          </TabsTrigger>
          <TabsTrigger value="telemetry" className="gap-2 py-2">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">{t("telemetry")}</span>
          </TabsTrigger>
          <TabsTrigger value="config" className="gap-2 py-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">{t("config")}</span>
          </TabsTrigger>
          <TabsTrigger value="ota" className="gap-2 py-2">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">{t("firmware")}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {activeTab === "overview" && <DeviceOverview deviceId={deviceId} />}
        </TabsContent>

        <TabsContent value="channels" className="space-y-4">
          {activeTab === "channels" && <DeviceChannels deviceId={deviceId} />}
        </TabsContent>

        <TabsContent value="commands" className="space-y-4">
          {activeTab === "commands" && <DeviceCommands deviceId={deviceId} />}
        </TabsContent>

        <TabsContent value="telemetry" className="space-y-4">
          {activeTab === "telemetry" && <DeviceTelemetry deviceId={deviceId} />}
        </TabsContent>

        <TabsContent value="config" className="space-y-4">
          {activeTab === "config" && <DeviceConfig deviceId={deviceId} />}
        </TabsContent>

        <TabsContent value="ota" className="space-y-4">
          {activeTab === "ota" && <DeviceOTA deviceId={deviceId} />}
        </TabsContent>
      </Tabs>
    </div>
  );
}
