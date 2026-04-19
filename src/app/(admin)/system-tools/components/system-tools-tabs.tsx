"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Terminal, Mail, Info } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { CommandsView } from "./commands/commands-view";
import { InvitesView } from "./invites/invites-view";
import { AppInfoView } from "./app-info/app-info-view";

export function SystemToolsTabs() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("commands");

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("topbar-title-change", { detail: t("systemTools") }),
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
        {activeTab === "commands" && <CommandsView />}
      </TabsContent>

      <TabsContent value="invites" className="space-y-4">
        {activeTab === "invites" && <InvitesView />}
      </TabsContent>

      <TabsContent value="app-info" className="space-y-4">
        {activeTab === "app-info" && <AppInfoView />}
      </TabsContent>
    </Tabs>
  );
}
