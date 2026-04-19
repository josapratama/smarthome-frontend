"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Upload } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { VersionsView } from "./versions/versions-view";
import { OtaView } from "./ota/ota-view";

interface FirmwareTabsProps {
  initialDeviceId?: number;
}

export function FirmwareTabs({ initialDeviceId }: FirmwareTabsProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState(
    initialDeviceId ? "ota" : "versions",
  );

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("topbar-title-change", {
        detail: t("firmwareManagement"),
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
        <TabsTrigger value="versions" className="gap-2">
          <Package className="h-4 w-4" />
          <span className="hidden sm:inline">{t("firmwareVersions")}</span>
        </TabsTrigger>
        <TabsTrigger value="ota" className="gap-2">
          <Upload className="h-4 w-4" />
          <span className="hidden sm:inline">{t("otaUpdates")}</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="versions" className="space-y-4">
        {activeTab === "versions" && <VersionsView />}
      </TabsContent>

      <TabsContent value="ota" className="space-y-4">
        {activeTab === "ota" && <OtaView initialDeviceId={initialDeviceId} />}
      </TabsContent>
    </Tabs>
  );
}
