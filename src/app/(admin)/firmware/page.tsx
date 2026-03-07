"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Upload } from "lucide-react";
import FirmwareVersionsUI from "./versions-ui";
import OTAUpdatesUI from "./ota-ui";
import { useLanguage } from "@/contexts/language-context";
import { PageHeader } from "@/components/ui/page-header";

export default function FirmwareManagementPage() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("versions");

  useEffect(() => {
    // Update topbar title
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
    <div className="space-y-4">
      <PageHeader />

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
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
          {activeTab === "versions" && <FirmwareVersionsUI />}
        </TabsContent>

        <TabsContent value="ota" className="space-y-4">
          {activeTab === "ota" && <OTAUpdatesUI />}
        </TabsContent>
      </Tabs>
    </div>
  );
}
