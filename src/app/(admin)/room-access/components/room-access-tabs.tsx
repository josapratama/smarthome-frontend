"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Users, History } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import RoomAccessGrantsTab from "./access-grants-tab";
import RoomAccessLogsTab from "./access-logs-tab";
import RoomPrivacyTab from "./room-privacy-tab";

export function RoomAccessTabs() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("grants");

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("topbar-title-change", {
        detail: t("roomAccessControl"),
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
      <TabsList className="grid w-full grid-cols-3 lg:w-auto">
        <TabsTrigger value="grants" className="gap-2">
          <Users className="h-4 w-4" />
          <span className="hidden sm:inline">{t("accessGrants")}</span>
        </TabsTrigger>
        <TabsTrigger value="privacy" className="gap-2">
          <Shield className="h-4 w-4" />
          <span className="hidden sm:inline">{t("roomPrivacy")}</span>
        </TabsTrigger>
        <TabsTrigger value="logs" className="gap-2">
          <History className="h-4 w-4" />
          <span className="hidden sm:inline">{t("accessLogs")}</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="grants" className="space-y-4">
        {activeTab === "grants" && <RoomAccessGrantsTab />}
      </TabsContent>
      <TabsContent value="privacy" className="space-y-4">
        {activeTab === "privacy" && <RoomPrivacyTab />}
      </TabsContent>
      <TabsContent value="logs" className="space-y-4">
        {activeTab === "logs" && <RoomAccessLogsTab />}
      </TabsContent>
    </Tabs>
  );
}
