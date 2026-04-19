"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Home, DoorOpen } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { HomesView } from "./homes/homes-view";
import { RoomsView } from "./rooms/rooms-view";

export function LocationTabs() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("homes");

  useEffect(() => {
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
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
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
        {activeTab === "homes" && <HomesView />}
      </TabsContent>

      <TabsContent value="rooms" className="space-y-4">
        {activeTab === "rooms" && <RoomsView />}
      </TabsContent>
    </Tabs>
  );
}
