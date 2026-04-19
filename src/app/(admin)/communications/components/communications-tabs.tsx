"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Bell } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { MessagesView } from "./messages/messages-view";
import { NotificationsView } from "./notifications/notifications-view";

export function CommunicationsTabs() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("messages");

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("topbar-title-change", { detail: t("communications") }),
    );
    return () => {
      window.dispatchEvent(
        new CustomEvent("topbar-title-change", { detail: null }),
      );
    };
  }, [t]);

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
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
        {activeTab === "messages" && <MessagesView />}
      </TabsContent>

      <TabsContent value="notifications" className="space-y-4">
        {activeTab === "notifications" && <NotificationsView />}
      </TabsContent>
    </Tabs>
  );
}
