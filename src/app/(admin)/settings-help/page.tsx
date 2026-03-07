"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/ui/page-header";
import { Settings, HelpCircle } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import SettingsUI from "./settings-ui";
import HelpUI from "./help-ui";

export default function SettingsHelpPage() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("settings");

  useEffect(() => {
    // Update topbar title
    window.dispatchEvent(
      new CustomEvent("topbar-title-change", {
        detail: t("settingsAndHelp"),
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
          {activeTab === "settings" && <SettingsUI />}
        </TabsContent>

        <TabsContent value="help" className="space-y-4">
          {activeTab === "help" && <HelpUI />}
        </TabsContent>
      </Tabs>
    </div>
  );
}
