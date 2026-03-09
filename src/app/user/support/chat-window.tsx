"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslation } from "@/hooks/use-translation";
import {
  getDMMessages,
  getHomeMessages,
  DirectConversation,
  HomeConversation,
  DirectMessage,
  HomeMessage,
  markDMAsRead,
  markHomeMessageAsRead,
} from "@/lib/api/services/messaging";
import { User, Home, MoreVertical } from "lucide-react";
import { toast } from "sonner";
import { MessageBubble } from "./message-bubble";
import { MessageInput } from "./message-input";

interface ChatWindowProps {
  conversation: DirectConversation | HomeConversation;
  type: "dm" | "home";
  onMessageSent: () => void;
}

export function ChatWindow({
  conversation,
  type,
  onMessageSent,
}: ChatWindowProps) {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<(DirectMessage | HomeMessage)[]>([]);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMessages();
  }, [conversation.id]);

  useEffect(() => {
    scrollToBottom();
    markMessagesAsRead();
  }, [messages]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const msgs =
        type === "dm"
          ? await getDMMessages(conversation.id, { limit: 50 })
          : await getHomeMessages(conversation.id, { limit: 50 });
      setMessages(msgs.reverse());
    } catch (error: any) {
      console.error("Failed to load messages:", error);
      toast.error(error.message || "Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  const markMessagesAsRead = async () => {
    try {
      const unreadMessages = messages.filter((msg) => {
        if (type === "dm") {
          const dmMsg = msg as DirectMessage;
          const dmConv = conversation as DirectConversation;
          return dmMsg.status !== "READ" && dmMsg.senderId !== dmConv.user1Id;
        } else {
          const homeMsg = msg as HomeMessage;
          return homeMsg.readBy.length === 0;
        }
      });

      for (const msg of unreadMessages) {
        if (type === "dm") {
          await markDMAsRead(msg.id);
        } else {
          await markHomeMessageAsRead(msg.id);
        }
      }
    } catch (error) {
      console.error("Failed to mark messages as read:", error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleMessageSent = () => {
    loadMessages();
    onMessageSent();
  };

  const name =
    type === "dm"
      ? (conversation as DirectConversation).otherUser.username
      : (conversation as HomeConversation).home.name;

  const avatarUrl =
    type === "dm"
      ? (conversation as DirectConversation).otherUser.avatarUrl
      : null;

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <div className="flex items-center space-x-3">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={name}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
              {type === "dm" ? (
                <User className="w-5 h-5" />
              ) : (
                <Home className="w-5 h-5" />
              )}
            </div>
          )}
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">
              {name}
            </h2>
            {type === "home" && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t("homeChat")}
              </p>
            )}
          </div>
        </div>
        <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
          <MoreVertical className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-800">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
            <p>{t("noMessages")}</p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                type={type}
                isOwn={
                  type === "dm"
                    ? (message as DirectMessage).senderId ===
                      (conversation as DirectConversation).user1Id
                    : false
                }
              />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <MessageInput
        conversation={conversation}
        type={type}
        onMessageSent={handleMessageSent}
      />
    </div>
  );
}
