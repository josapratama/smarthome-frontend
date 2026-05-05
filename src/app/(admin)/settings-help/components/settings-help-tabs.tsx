"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, HelpCircle } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { SettingsView } from "./settings/settings-view";
import { HelpView } from "./help/help-view";

export function SettingsHelpTabs() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("settings");

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("topbar-title-change", { detail: t("settingsAndHelp") }),
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
        <TabsTrigger value="settings" className="gap-2">
          <Settings className="h-4 w-4" />
          <span className="hidden sm:inline">{t("settings")}</span>
        </TabsTrigger>
        <TabsTrigger value="help" className="gap-2">
          <HelpCircle className="h-4 w-4" />
          <span className="hidden sm:inline">{t("help")}</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="settings" className="space-y-4">
        {activeTab === "settings" && <SettingsView />}
      </TabsContent>

      <TabsContent value="help" className="space-y-4">
        {activeTab === "help" && <HelpView />}
      </TabsContent>
    </Tabs>
  );
}
