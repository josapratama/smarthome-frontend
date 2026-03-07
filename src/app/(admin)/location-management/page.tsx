"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Home, DoorOpen } from "lucide-react";
import HomesUI from "./homes-ui";
import RoomsUI from "./rooms-ui";
import { useLanguage } from "@/contexts/language-context";
import { PageHeader } from "@/components/ui/page-header";

export default function LocationManagementPage() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("homes");

  useEffect(() => {
    // Update topbar title
    window.dispatchEvent(
      new CustomEvent("topbar-title-change", {
        detail: t("locationManagement"),
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
          <TabsTrigger value="homes" className="gap-2">
            <Home className="h-4 w-4" />
            <span className="hidden sm:inline">{t("homes")}</span>
          </TabsTrigger>
          <TabsTrigger value="rooms" className="gap-2">
            <DoorOpen className="h-4 w-4" />
            <span className="hidden sm:inline">{t("rooms")}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="homes" className="space-y-4">
          {activeTab === "homes" && <HomesUI />}
        </TabsContent>

        <TabsContent value="rooms" className="space-y-4">
          {activeTab === "rooms" && <RoomsUI />}
        </TabsContent>
      </Tabs>
    </div>
  );
}
