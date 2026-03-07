"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/ui/page-header";
import { Terminal, Mail, Info } from "lucide-react";
import CommandsUI from "./commands-ui";
import InvitesUI from "./invites-ui";
import AppInfoUI from "./app-info-ui";
import { useLanguage } from "@/contexts/language-context";

export default function SystemToolsPage() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("commands");

  useEffect(() => {
    // Update topbar title
    window.dispatchEvent(
      new CustomEvent("topbar-title-change", {
        detail: t("systemTools"),
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
        <TabsList className="grid w-full grid-cols-3 lg:w-auto">
          <TabsTrigger value="commands" className="gap-2">
            <Terminal className="h-4 w-4" />
            <span className="hidden sm:inline">{t("commands")}</span>
          </TabsTrigger>
          <TabsTrigger value="invites" className="gap-2">
            <Mail className="h-4 w-4" />
            <span className="hidden sm:inline">{t("invites")}</span>
          </TabsTrigger>
          <TabsTrigger value="app-info" className="gap-2">
            <Info className="h-4 w-4" />
            <span className="hidden sm:inline">{t("appInfo")}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="commands" className="space-y-4">
          {activeTab === "commands" && <CommandsUI />}
        </TabsContent>

        <TabsContent value="invites" className="space-y-4">
          {activeTab === "invites" && <InvitesUI />}
        </TabsContent>

        <TabsContent value="app-info" className="space-y-4">
          {activeTab === "app-info" && <AppInfoUI />}
        </TabsContent>
      </Tabs>
    </div>
  );
}
