"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Cpu, Activity } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { DevicesView } from "./devices/devices-view";
import { MonitoringView } from "./monitoring/monitoring-view";

export function DeviceManagementTabs() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("devices");

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("topbar-title-change", {
        detail: t("deviceManagement"),
      }),
    );
    return () => {
      window.dispatchEvent(
        new CustomEvent("topbar-title-change", { detail: null }),
      );
    };
  }, [t]);

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
      <TabsList className="grid w-full grid-cols-2 lg:w-auto">
        <TabsTrigger value="devices" className="gap-2">
          <Cpu className="h-4 w-4" />
          <span className="hidden sm:inline">{t("devices")}</span>
        </TabsTrigger>
        <TabsTrigger value="monitoring" className="gap-2">
          <Activity className="h-4 w-4" />
          <span className="hidden sm:inline">{t("monitoring")}</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="devices" className="space-y-4">
        {activeTab === "devices" && <DevicesView />}
      </TabsContent>

      <TabsContent value="monitoring" className="space-y-4">
        {activeTab === "monitoring" && <MonitoringView />}
      </TabsContent>
    </Tabs>
  );
}
