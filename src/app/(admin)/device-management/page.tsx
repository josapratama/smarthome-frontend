"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Cpu, Activity } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import DevicesUI from "./devices-ui";
import MonitoringUI from "./monitoring-ui";

export default function DeviceManagementPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("devices");

  // Update topbar title when tab changes
  useEffect(() => {
    const title = activeTab === "devices" ? t("devices") : t("monitoring");
    window.dispatchEvent(
      new CustomEvent("topbar-title-change", { detail: title }),
    );

    return () => {
      window.dispatchEvent(
        new CustomEvent("topbar-title-change", { detail: null }),
      );
    };
  }, [activeTab, t]);

  return (
    <div className="space-y-4">
      <PageHeader />

      <Card className="rounded-2xl shadow-sm overflow-hidden">
        <div className="border-b bg-muted/50">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="w-full h-auto bg-transparent p-0 justify-start rounded-none border-b-0 overflow-x-auto">
              <TabsTrigger
                value="devices"
                className="relative rounded-none border-b-2 border-transparent px-4 md:px-6 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:font-semibold flex-shrink-0"
              >
                <Cpu className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline">{t("devices")}</span>
              </TabsTrigger>
              <TabsTrigger
                value="monitoring"
                className="relative rounded-none border-b-2 border-transparent px-4 md:px-6 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:font-semibold flex-shrink-0"
              >
                <Activity className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline">{t("monitoring")}</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <CardContent className="p-4 md:p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsContent value="devices" className="m-0">
              <DevicesUI />
            </TabsContent>
            <TabsContent value="monitoring" className="m-0">
              <MonitoringUI />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
