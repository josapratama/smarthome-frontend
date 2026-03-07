"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "@/hooks/use-translation";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Users, Mail } from "lucide-react";
import { ChatWindow } from "@/app/user/messages/chat-window";
import {
  getDMConversations,
  getHomeConversations,
  getDMUnreadCount,
  getHomeUnreadCount,
  type DirectConversation,
  type HomeConversation,
} from "@/lib/api/messaging";
import { toast } from "sonner";
import { ConversationList } from "./conversation-list";

export default function UserMessagesPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<"dm" | "home">("dm");
  const [dmConversations, setDmConversations] = useState<DirectConversation[]>(
    [],
  );
  const [homeConversations, setHomeConversations] = useState<
    HomeConversation[]
  >([]);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [dmUnreadCount, setDmUnreadCount] = useState(0);
  const [homeUnreadCount, setHomeUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadConversations();
    loadUnreadCounts();

    // Refresh every 30 seconds
    const interval = setInterval(() => {
      loadConversations();
      loadUnreadCounts();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const loadConversations = async () => {
    setIsLoading(true);
    try {
      const [dmData, homeData] = await Promise.all([
        getDMConversations().catch(() => []),
        getHomeConversations().catch(() => []),
      ]);
      setDmConversations(dmData);
      setHomeConversations(homeData);
    } catch (error: any) {
      // Silent fail - just log to console
      console.error("Failed to load conversations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUnreadCounts = async () => {
    try {
      const [dmCount, homeCount] = await Promise.all([
        getDMUnreadCount().catch(() => 0),
        getHomeUnreadCount().catch(() => 0),
      ]);
      setDmUnreadCount(dmCount);
      setHomeUnreadCount(homeCount);
    } catch (error) {
      console.error("Failed to load unread counts:", error);
    }
  };

  const handleConversationSelect = (conversation: any) => {
    setSelectedConversation(conversation);
  };

  const handleMessageSent = () => {
    loadConversations();
    loadUnreadCounts();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold mb-1 flex items-center gap-2">
          <MessageSquare className="h-7 w-7" />
          {t("messages") || "Messages"}
        </h1>
        <p className="text-sm md:text-base text-muted-foreground">
          {t("messagesDescription") || "Chat with other users and home members"}
        </p>
      </div>

      <Card className="overflow-hidden">
        <Tabs
          value={activeTab}
          onValueChange={(value) => {
            setActiveTab(value as "dm" | "home");
            setSelectedConversation(null);
          }}
        >
          <div className="border-b px-4">
            <TabsList className="w-full justify-start h-auto p-0 bg-transparent">
              <TabsTrigger
                value="dm"
                className="relative data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-primary rounded-none px-4 py-3"
              >
                <Mail className="h-4 w-4 mr-2" />
                {t("directMessages") || "Direct Messages"}
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
                {t("homeChats") || "Home Chats"}
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
                  conversations={dmConversations}
                  selectedId={selectedConversation?.id}
                  onSelect={handleConversationSelect}
                  loading={isLoading}
                  type="dm"
                />
              </TabsContent>
              <TabsContent value="home" className="m-0">
                <ConversationList
                  conversations={homeConversations}
                  selectedId={selectedConversation?.id}
                  onSelect={handleConversationSelect}
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
                  onMessageSent={handleMessageSent}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-[600px] text-center p-6">
                  <MessageSquare className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    {t("selectConversation") || "Select a conversation"}
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-md">
                    {t("selectConversationDescription") ||
                      "Choose a conversation from the list to start chatting"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </Tabs>
      </Card>
    </div>
  );
}
