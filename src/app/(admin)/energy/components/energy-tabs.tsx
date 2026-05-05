"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Zap, DollarSign } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { MonitoringView } from "./monitoring/monitoring-view";
import { CostView } from "./cost/cost-view";

export function EnergyTabs() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("monitoring");

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("topbar-title-change", { detail: t("energyManagement") }),
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
        <TabsTrigger value="monitoring" className="gap-2">
          <Zap className="h-4 w-4" />
          <span className="hidden sm:inline">{t("energyMonitoring")}</span>
        </TabsTrigger>
        <TabsTrigger value="cost" className="gap-2">
          <DollarSign className="h-4 w-4" />
          <span className="hidden sm:inline">{t("energyCost")}</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="monitoring" className="space-y-4">
        {activeTab === "monitoring" && <MonitoringView />}
      </TabsContent>

      <TabsContent value="cost" className="space-y-4">
        {activeTab === "cost" && <CostView />}
      </TabsContent>
    </Tabs>
  );
}
