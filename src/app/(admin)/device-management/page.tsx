"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Cpu, Activity } from "lucide-react";
import DevicesUI from "./devices-ui";
import MonitoringUI from "./monitoring-ui";
import { useLanguage } from "@/contexts/language-context";
import { PageHeader } from "@/components/ui/page-header";

export default function DeviceManagementPage() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("devices");

  useEffect(() => {
    // Update topbar title
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
    <div className="space-y-4">
      <PageHeader />

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
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
          {activeTab === "devices" && <DevicesUI />}
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          {activeTab === "monitoring" && <MonitoringUI />}
        </TabsContent>
      </Tabs>
    </div>
  );
}
