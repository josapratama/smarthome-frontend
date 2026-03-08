"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, Bell } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import dynamic from "next/dynamic";
import { PageHeader } from "@/components/ui/page-header";

// Lazy load the heavy components
const AlarmsContent = dynamic(() => import("./alarms-content"), { ssr: false });
const NotificationsContent = dynamic(() => import("./notifications-content"), {
  ssr: false,
});

export default function AlertsPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("alarms");

  return (
    <div className="space-y-4">
      <PageHeader />

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-2 lg:w-auto">
          <TabsTrigger value="alarms" className="gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span className="hidden sm:inline">{t("alarms")}</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">{t("notifications")}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="alarms" className="space-y-4">
          {activeTab === "alarms" && <AlarmsContent />}
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          {activeTab === "notifications" && <NotificationsContent />}
        </TabsContent>
      </Tabs>
    </div>
  );
}
