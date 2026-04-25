"use client";

import { useTranslation } from "@/hooks/use-translation";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Mail, MessageSquare, Users } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { ChatWindow } from "./components/chat-window";
import { ConversationList } from "./components/conversation-list";
import { useConversations } from "./hooks";
import { ConversationSearchBar, EmptyChat } from "./components";

export default function MessagesContent() {
  const { t } = useTranslation();
  const {
    activeTab,
    handleTabChange,
    dmConversations,
    homeConversations,
    filteredDmConversations,
    filteredHomeConversations,
    selectedConversation,
    setSelectedConversation,
    dmUnreadCount,
    homeUnreadCount,
    isLoading,
    searchQuery,
    setSearchQuery,
    searchSectionRef,
    refresh,
  } = useConversations();

  return (
    <div className="space-y-6">
      <PageHeader
        stats={[
          {
            label: t("directMessages"),
            value: dmConversations.length,
            icon: Mail,
            color: "text-blue-500",
          },
          {
            label: t("homeChats"),
            value: homeConversations.length,
            icon: Users,
            color: "text-green-500",
          },
          {
            label: t("unreadMessages"),
            value: dmUnreadCount + homeUnreadCount,
            icon: MessageSquare,
            color: "text-orange-500",
          },
        ]}
      />

      <ConversationSearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        containerRef={searchSectionRef}
      />

      <Card className="overflow-hidden">
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <div className="border-b px-4">
            <TabsList className="w-full justify-start h-auto p-0 bg-transparent">
              <TabsTrigger
                value="dm"
                className="relative data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-primary rounded-none px-4 py-3"
              >
                <Mail className="h-4 w-4 mr-2" />
                {t("directMessages")}
                {dmUnreadCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="ml-2 h-5 min-w-5 px-1"
                  >
                    {dmUnreadCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="home"
                className="relative data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-primary rounded-none px-4 py-3"
              >
                <Users className="h-4 w-4 mr-2" />
                {t("homeChats")}
                {homeUnreadCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="ml-2 h-5 min-w-5 px-1"
                  >
                    {homeUnreadCount}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3">
            {/* Conversations List */}
            <div className="lg:col-span-1 border-r">
              <TabsContent value="dm" className="m-0">
                <ConversationList
                  conversations={filteredDmConversations}
                  selectedId={selectedConversation?.id ?? null}
                  onSelect={setSelectedConversation}
                  loading={isLoading}
                  type="dm"
                />
              </TabsContent>
              <TabsContent value="home" className="m-0">
                <ConversationList
                  conversations={filteredHomeConversations}
                  selectedId={selectedConversation?.id ?? null}
                  onSelect={setSelectedConversation}
                  loading={isLoading}
                  type="home"
                />
              </TabsContent>
            </div>

            {/* Chat Window */}
            <div className="lg:col-span-2">
              {selectedConversation ? (
                <ChatWindow
                  conversation={selectedConversation}
                  type={activeTab}
                  onMessageSent={refresh}
                />
              ) : (
                <EmptyChat />
              )}
            </div>
          </div>
        </Tabs>
      </Card>
    </div>
  );
}
