"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, History, Lock, UserX } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import LoginHistoryTab from "./login-history-tab";
import ActiveSessionsTab from "./active-sessions-tab";
import LoginAttemptsTab from "./login-attempts-tab";
import SecuritySettingsTab from "./security-settings-tab";

export function SecurityTabs() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("history");

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("topbar-title-change", { detail: t("security") }),
    );
    return () => {
      window.dispatchEvent(
        new CustomEvent("topbar-title-change", { detail: null }),
      );
    };
  }, [t]);

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
      <TabsList className="grid w-full grid-cols-4 lg:w-auto">
        <TabsTrigger value="history" className="gap-2">
          <History className="h-4 w-4" />
          <span className="hidden sm:inline">{t("loginHistory")}</span>
        </TabsTrigger>
        <TabsTrigger value="sessions" className="gap-2">
          <Shield className="h-4 w-4" />
          <span className="hidden sm:inline">{t("activeSessions")}</span>
        </TabsTrigger>
        <TabsTrigger value="attempts" className="gap-2">
          <UserX className="h-4 w-4" />
          <span className="hidden sm:inline">{t("failedAttempts")}</span>
        </TabsTrigger>
        <TabsTrigger value="settings" className="gap-2">
          <Lock className="h-4 w-4" />
          <span className="hidden sm:inline">{t("settings")}</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="history" className="space-y-4">
        {activeTab === "history" && <LoginHistoryTab />}
      </TabsContent>
      <TabsContent value="sessions" className="space-y-4">
        {activeTab === "sessions" && <ActiveSessionsTab />}
      </TabsContent>
      <TabsContent value="attempts" className="space-y-4">
        {activeTab === "attempts" && <LoginAttemptsTab />}
      </TabsContent>
      <TabsContent value="settings" className="space-y-4">
        {activeTab === "settings" && <SecuritySettingsTab />}
      </TabsContent>
    </Tabs>
  );
}
