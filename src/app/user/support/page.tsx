"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, HelpCircle } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import dynamic from "next/dynamic";
import { PageHeader } from "@/components/ui/page-header";

// Lazy load the heavy components
const MessagesContent = dynamic(() => import("./messages-content"), {
  ssr: false,
});
const FAQContent = dynamic(() => import("./faq-content"), { ssr: false });

export default function SupportPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("messages");

  return (
    <div className="space-y-4">
      <PageHeader />

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-2 lg:w-auto">
          <TabsTrigger value="messages" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">{t("messages")}</span>
          </TabsTrigger>
          <TabsTrigger value="faq" className="gap-2">
            <HelpCircle className="h-4 w-4" />
            <span className="hidden sm:inline">{t("faq")}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="messages" className="space-y-4">
          {activeTab === "messages" && <MessagesContent />}
        </TabsContent>

        <TabsContent value="faq" className="space-y-4">
          {activeTab === "faq" && <FAQContent />}
        </TabsContent>
      </Tabs>
    </div>
  );
}
