"use client";

import { useEffect, useState, useRef } from "react";
import { useTranslation } from "@/hooks/use-translation";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MessageSquare, Users, Mail, Search } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { ChatWindow } from "./chat-window";
import {
  getDMConversations,
  getHomeConversations,
  getDMUnreadCount,
  getHomeUnreadCount,
  type DirectConversation,
  type HomeConversation,
} from "@/lib/api/messaging";
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
  const [searchQuery, setSearchQuery] = useState("");

  // Ref for search functionality
  const searchSectionRef = useRef<HTMLDivElement>(null);

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

  // Listen to topbar events
  useEffect(() => {
    const handleSearch = () => {
      let searchInput: HTMLInputElement | null = null;

      if (searchSectionRef.current) {
        searchInput = searchSectionRef.current.querySelector(
          "input",
        ) as HTMLInputElement;
      }

      if (!searchInput) {
        searchInput = document.querySelector("input") as HTMLInputElement;
      }

      if (searchInput) {
        searchInput.focus();
        searchInput.select();
      }
    };

    window.addEventListener("topbar-search", handleSearch);

    return () => {
      window.removeEventListener("topbar-search", handleSearch);
    };
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

  // Filter conversations based on search query
  const filteredDmConversations = searchQuery
    ? dmConversations.filter((conv) => {
        const query = searchQuery.toLowerCase();
        const otherUser = conv.otherUser;
        return (
          otherUser.email?.toLowerCase().includes(query) ||
          otherUser.username?.toLowerCase().includes(query)
        );
      })
    : dmConversations;

  const filteredHomeConversations = searchQuery
    ? homeConversations.filter((conv) => {
        const query = searchQuery.toLowerCase();
        return conv.home.name?.toLowerCase().includes(query);
      })
    : homeConversations;

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
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

      {/* Search Bar */}
      <div ref={searchSectionRef}>
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={
                  t("searchConversations") || "Search conversations..."
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardContent>
        </Card>
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
                  conversations={filteredDmConversations}
                  selectedId={selectedConversation?.id}
                  onSelect={handleConversationSelect}
                  loading={isLoading}
                  type="dm"
                />
              </TabsContent>
              <TabsContent value="home" className="m-0">
                <ConversationList
                  conversations={filteredHomeConversations}
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
