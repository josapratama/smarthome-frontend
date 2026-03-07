"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "@/hooks/use-translation";
import {
  getDMConversations,
  getHomeConversations,
  DirectConversation,
  HomeConversation,
} from "@/lib/api/messaging";
import { ConversationList } from "@/app/user/messages/conversation-list";
import { ChatWindow } from "@/app/user/messages/chat-window";
import { MessageSquare, Home, User } from "lucide-react";
import { toast } from "sonner";

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

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      const [dm, home] = await Promise.all([
        getDMConversations(),
        getHomeConversations(),
      ]);
      setDmConversations(dm);
      setHomeConversations(home);
    } catch (error: any) {
      console.error("Failed to load conversations:", error);
      toast.error(error.message || "Failed to load conversations");
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

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-4">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          {t("messages")}
        </h1>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <button
          onClick={() => {
            setActiveTab("dm");
            setSelectedConversation(null);
          }}
          className={`flex items-center space-x-2 px-6 py-3 border-b-2 transition-colors ${
            activeTab === "dm"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>{t("directMessages")}</span>
          {dmUnreadCount > 0 && (
            <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-0.5">
              {dmUnreadCount}
            </span>
          )}
        </button>
        <button
          onClick={() => {
            setActiveTab("home");
            setSelectedConversation(null);
          }}
          className={`flex items-center space-x-2 px-6 py-3 border-b-2 transition-colors ${
            activeTab === "home"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
          }`}
        >
          <Home className="w-4 h-4" />
          <span>{t("homeChats")}</span>
          {homeUnreadCount > 0 && (
            <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-0.5">
              {homeUnreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Conversation List */}
        <div
          className={`w-full md:w-96 border-r border-gray-200 dark:border-gray-700 overflow-y-auto bg-white dark:bg-gray-900 ${
            selectedConversation ? "hidden md:block" : "block"
          }`}
        >
          <ConversationList
            conversations={conversations}
            type={activeTab}
            selectedId={selectedConversation?.id}
            onSelect={setSelectedConversation}
            loading={loading}
          />
        </div>

        {/* Chat Window - Desktop */}
        <div className="flex-1 hidden md:flex bg-gray-50 dark:bg-gray-800">
          {selectedConversation ? (
            <ChatWindow
              conversation={selectedConversation}
              type={activeTab}
              onMessageSent={loadConversations}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
              <div className="text-center">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>{t("selectConversation")}</p>
              </div>
            </div>
          )}
        </div>

        {/* Chat Window - Mobile (Full Screen) */}
        {selectedConversation && (
          <div className="fixed inset-0 z-50 md:hidden bg-white dark:bg-gray-900">
            <div className="h-full flex flex-col">
              {/* Mobile Header with Back Button */}
              <div className="flex items-center p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                <button
                  onClick={() => setSelectedConversation(null)}
                  className="mr-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                >
                  <svg
                    className="w-6 h-6 text-gray-600 dark:text-gray-400"
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
                      {(selectedConversation as DirectConversation).otherUser
                        .avatarUrl ? (
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
                        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
                          <User className="w-5 h-5" />
                        </div>
                      )}
                      <h2 className="font-semibold text-gray-900 dark:text-white">
                        {
                          (selectedConversation as DirectConversation).otherUser
                            .username
                        }
                      </h2>
                    </>
                  ) : (
                    <>
                      <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
                        <Home className="w-5 h-5" />
                      </div>
                      <h2 className="font-semibold text-gray-900 dark:text-white">
                        {(selectedConversation as HomeConversation).home.name}
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
    </div>
  );
}
