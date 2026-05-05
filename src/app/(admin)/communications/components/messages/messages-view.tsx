"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslation } from "@/hooks/use-translation";
import {
  getDMConversations,
  getHomeConversations,
  type DirectConversation,
  type HomeConversation,
} from "@/lib/api/services/messaging";
import { ConversationList } from "@/app/user/support/components/conversation-list";
import { ChatWindow } from "@/app/user/support/components/chat-window";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Home, Users, Mail } from "lucide-react";

import { MobileChatHeader } from "./mobile-chat-header";
import { ConversationErrorCard } from "./conversation-error-card";

export function MessagesView() {
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
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadConversations();
  }, []);

  // ── Topbar search ─────────────────────────────────────────
  useEffect(() => {
    const onSearch = () => {
      const input = searchRef.current?.querySelector("input");
      input?.focus();
    };
    window.addEventListener("topbar-search", onSearch);
    return () => window.removeEventListener("topbar-search", onSearch);
  }, []);

  async function loadConversations() {
    setLoading(true);
    setError(null);
    try {
      const [dm, home] = await Promise.all([
        getDMConversations().catch((err) => {
          console.warn("DM:", err.message);
          return [];
        }),
        getHomeConversations().catch((err) => {
          console.warn("Home:", err.message);
          return [];
        }),
      ]);
      setDmConversations(dm);
      setHomeConversations(home);
      if (dm.length === 0 && home.length === 0) {
        setError("Unable to load conversations. Please try again later.");
      }
    } catch (err: any) {
      setError(err.message || t("failedToLoadConversations"));
      setDmConversations([]);
      setHomeConversations([]);
    } finally {
      setLoading(false);
    }
  }

  const dmUnread = dmConversations.reduce((s, c) => s + c.unreadCount, 0);
  const homeUnread = homeConversations.reduce((s, c) => s + c.unreadCount, 0);
  const totalUnread = dmUnread + homeUnread;

  return (
    <div className="space-y-6">
      {/* Stats */}
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

      {/* Main card */}
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
            {/* Tab header */}
            <div className="border-b px-4 sm:px-6 pt-4 sm:pt-6">
              <TabsList className="grid w-full max-w-md grid-cols-2 mb-4">
                <TabsTrigger value="dm" className="relative gap-2">
                  <MessageSquare className="w-4 h-4" />
                  <span className="hidden sm:inline">
                    {t("directMessages")}
                  </span>
                  {dmUnread > 0 && (
                    <Badge className="ml-2 h-5 min-w-5 px-1.5 text-xs">
                      {dmUnread}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="home" className="relative gap-2">
                  <Home className="w-4 h-4" />
                  <span className="hidden sm:inline">{t("homeChats")}</span>
                  {homeUnread > 0 && (
                    <Badge className="ml-2 h-5 min-w-5 px-1.5 text-xs">
                      {homeUnread}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Content */}
            <div className="flex h-[calc(100vh-20rem)]">
              {/* Conversation list */}
              <div
                className={`w-full md:w-96 border-r overflow-y-auto ${selectedConversation ? "hidden md:block" : "block"}`}
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

              {/* Desktop chat window */}
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

              {/* Mobile chat window (full screen) */}
              {selectedConversation && (
                <div className="fixed inset-0 z-50 md:hidden bg-background">
                  <div className="h-full flex flex-col">
                    <MobileChatHeader
                      conversation={selectedConversation}
                      type={activeTab}
                      onBack={() => setSelectedConversation(null)}
                    />
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

      {/* Error state */}
      {error && !loading && <ConversationErrorCard message={error} />}
    </div>
  );
}
