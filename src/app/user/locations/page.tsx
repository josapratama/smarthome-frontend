"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Home, DoorOpen } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import dynamic from "next/dynamic";
import { PageHeader } from "@/components/ui/page-header";

// Lazy load the heavy components
const HomesContent = dynamic(() => import("./homes-content"), { ssr: false });
const RoomsContent = dynamic(() => import("./rooms-content"), { ssr: false });

export default function LocationsPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("homes");

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
          {activeTab === "homes" && <HomesContent />}
        </TabsContent>

        <TabsContent value="rooms" className="space-y-4">
          {activeTab === "rooms" && <RoomsContent />}
        </TabsContent>
      </Tabs>
    </div>
  );
}
