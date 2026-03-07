"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Terminal, Mail, Info } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import CommandsUI from "./commands-ui";
import InvitesUI from "./invites-ui";
import AppInfoUI from "./app-info-ui";

export default function SystemToolsPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("commands");

  // Update topbar title when tab changes
  useEffect(() => {
    let title = t("commands");
    if (activeTab === "invites") title = t("invites");
    if (activeTab === "app-info") title = t("appInfo");

    window.dispatchEvent(
      new CustomEvent("topbar-title-change", { detail: title }),
    );

    return () => {
      window.dispatchEvent(
        new CustomEvent("topbar-title-change", { detail: null }),
      );
    };
  }, [activeTab, t]);

  return (
    <div className="space-y-4">
      <PageHeader />

      <Card className="rounded-2xl shadow-sm overflow-hidden">
        <div className="border-b bg-muted/50">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="w-full h-auto bg-transparent p-0 justify-start rounded-none border-b-0 overflow-x-auto">
              <TabsTrigger
                value="commands"
                className="relative rounded-none border-b-2 border-transparent px-4 md:px-6 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:font-semibold flex-shrink-0"
              >
                <Terminal className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline">{t("commands")}</span>
              </TabsTrigger>
              <TabsTrigger
                value="invites"
                className="relative rounded-none border-b-2 border-transparent px-4 md:px-6 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:font-semibold flex-shrink-0"
              >
                <Mail className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline">{t("invites")}</span>
              </TabsTrigger>
              <TabsTrigger
                value="app-info"
                className="relative rounded-none border-b-2 border-transparent px-4 md:px-6 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:font-semibold flex-shrink-0"
              >
                <Info className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline">{t("appInfo")}</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <CardContent className="p-4 md:p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsContent value="commands" className="m-0">
              <CommandsUI />
            </TabsContent>
            <TabsContent value="invites" className="m-0">
              <InvitesUI />
            </TabsContent>
            <TabsContent value="app-info" className="m-0">
              <AppInfoUI />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
