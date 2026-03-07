"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslation } from "@/hooks/use-translation";
import {
  getDMConversations,
  getHomeConversations,
  DirectConversation,
  HomeConversation,
} from "@/lib/api/messaging";
import { ConversationList } from "@/app/user/messages/conversation-list";
import { ChatWindow } from "@/app/user/messages/chat-window";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Home, User, Users, Mail } from "lucide-react";

export default function MessagesPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<"dm" | "home">("dm");
  const [dmConversations, setDmConversations] = useState<DirectConversation[]>(
    [],
  );
  const [homeConversations, setHomeConversations] = useState<
    HomeConversation[]
  >([]);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const searchSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    const handleSearch = () => {
      if (searchSectionRef.current) {
        const searchInput = searchSectionRef.current.querySelector("input");
        if (searchInput) {
          searchInput.focus();
        }
      }
    };

    window.addEventListener("topbar-search", handleSearch);

    return () => {
      window.removeEventListener("topbar-search", handleSearch);
    };
  }, []);

  const loadConversations = async () => {
    setLoading(true);
    setError(null);
    try {
      const [dm, home] = await Promise.all([
        getDMConversations(),
        getHomeConversations(),
      ]);
      setDmConversations(dm);
      setHomeConversations(home);
    } catch (error: any) {
      console.error("Failed to load conversations:", error);
      setError(error.message || "Failed to load conversations");
      // Don't show toast on initial load, just set error state
      setDmConversations([]);
      setHomeConversations([]);
    } finally {
      setLoading(false);
    }
  };

  const conversations =
    activeTab === "dm" ? dmConversations : homeConversations;
  const dmUnreadCount = dmConversations.reduce(
    (sum, c) => sum + c.unreadCount,
    0,
  );
  const homeUnreadCount = homeConversations.reduce(
    (sum, c) => sum + c.unreadCount,
    0,
  );
  const totalUnread = dmUnreadCount + homeUnreadCount;

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <PageHeader
        stats={[
          {
            label: t("totalConversations"),
            value: dmConversations.length + homeConversations.length,
            icon: MessageSquare,
            color: "text-blue-500",
          },
          {
            label: t("unreadMessages"),
            value: totalUnread,
            icon: Mail,
            color: "text-orange-500",
          },
          {
            label: t("directMessages"),
            value: dmConversations.length,
            icon: Users,
            color: "text-green-500",
          },
        ]}
      />

      {/* Main Content Card */}
      <Card className="rounded-2xl shadow-sm border-0">
        <CardContent className="p-0">
          <Tabs
            value={activeTab}
            onValueChange={(v) => {
              setActiveTab(v as "dm" | "home");
              setSelectedConversation(null);
            }}
            className="w-full"
          >
            {/* Tabs Header */}
            <div className="border-b px-6 pt-6">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="dm" className="relative">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  {t("directMessages")}
                  {dmUnreadCount > 0 && (
                    <Badge className="ml-2 h-5 min-w-5 px-1.5 text-xs">
                      {dmUnreadCount}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="home" className="relative">
                  <Home className="w-4 h-4 mr-2" />
                  {t("homeChats")}
                  {homeUnreadCount > 0 && (
                    <Badge className="ml-2 h-5 min-w-5 px-1.5 text-xs">
                      {homeUnreadCount}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Tabs Content */}
            <div className="flex h-[calc(100vh-20rem)]">
              {/* Conversation List */}
              <div
                className={`w-full md:w-96 border-r overflow-y-auto ${
                  selectedConversation ? "hidden md:block" : "block"
                }`}
              >
                <TabsContent value="dm" className="m-0 h-full">
                  <ConversationList
                    conversations={dmConversations}
                    type="dm"
                    selectedId={selectedConversation?.id}
                    onSelect={setSelectedConversation}
                    loading={loading}
                  />
                </TabsContent>
                <TabsContent value="home" className="m-0 h-full">
                  <ConversationList
                    conversations={homeConversations}
                    type="home"
                    selectedId={selectedConversation?.id}
                    onSelect={setSelectedConversation}
                    loading={loading}
                  />
                </TabsContent>
              </div>

              {/* Chat Window - Desktop */}
              <div className="flex-1 hidden md:flex bg-muted/30">
                {selectedConversation ? (
                  <ChatWindow
                    conversation={selectedConversation}
                    type={activeTab}
                    onMessageSent={loadConversations}
                  />
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                        <MessageSquare className="w-10 h-10 text-primary/50" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">
                        {t("selectConversation")}
                      </h3>
                      <p className="text-sm text-muted-foreground max-w-sm">
                        {t("selectConversationDesc")}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Window - Mobile (Full Screen) */}
              {selectedConversation && (
                <div className="fixed inset-0 z-50 md:hidden bg-background">
                  <div className="h-full flex flex-col">
                    {/* Mobile Header with Back Button */}
                    <div className="flex items-center p-4 border-b bg-card">
                      <button
                        onClick={() => setSelectedConversation(null)}
                        className="mr-3 p-2 hover:bg-muted rounded-lg transition-colors"
                      >
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 19l-7-7 7-7"
                          />
                        </svg>
                      </button>
                      <div className="flex items-center space-x-3 flex-1">
                        {activeTab === "dm" ? (
                          <>
                            {(selectedConversation as DirectConversation)
                              .otherUser.avatarUrl ? (
                              <img
                                src={
                                  (selectedConversation as DirectConversation)
                                    .otherUser.avatarUrl!
                                }
                                alt={
                                  (selectedConversation as DirectConversation)
                                    .otherUser.username
                                }
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                                <User className="w-5 h-5" />
                              </div>
                            )}
                            <h2 className="font-semibold">
                              {
                                (selectedConversation as DirectConversation)
                                  .otherUser.username
                              }
                            </h2>
                          </>
                        ) : (
                          <>
                            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                              <Home className="w-5 h-5" />
                            </div>
                            <h2 className="font-semibold">
                              {
                                (selectedConversation as HomeConversation).home
                                  .name
                              }
                            </h2>
                          </>
                        )}
                      </div>
                    </div>
                    <ChatWindow
                      conversation={selectedConversation}
                      type={activeTab}
                      onMessageSent={loadConversations}
                    />
                  </div>
                </div>
              )}
            </div>
          </Tabs>
        </CardContent>
      </Card>

      {/* Error State */}
      {error && !loading && (
        <Card className="rounded-2xl border-destructive/50 bg-destructive/5">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
                <MessageSquare className="h-5 w-5 text-destructive" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-destructive mb-1">
                  {t("failedToLoadConversations")}
                </h3>
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
