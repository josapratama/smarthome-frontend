"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Bell } from "lucide-react";
import MessagesUI from "./messages-ui";
import NotificationsUI from "./notifications-ui";
import { useLanguage } from "@/contexts/language-context";
import { PageHeader } from "@/components/ui/page-header";

export default function CommunicationsPage() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("messages");

  useEffect(() => {
    // Update topbar title
    window.dispatchEvent(
      new CustomEvent("topbar-title-change", {
        detail: t("communications"),
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
        <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:inline-flex">
          <TabsTrigger value="messages" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">{t("messages")}</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">{t("notifications")}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="messages" className="space-y-4">
          {activeTab === "messages" && <MessagesUI />}
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          {activeTab === "notifications" && <NotificationsUI />}
        </TabsContent>
      </Tabs>
    </div>
  );
}
