"use client";

import { useState } from "react";
import { useTranslation } from "@/hooks/use-translation";
import {
  sendDirectMessage,
  sendHomeMessage,
  DirectConversation,
  HomeConversation,
} from "@/lib/api/services/messaging";
import { Send, Paperclip, Smile } from "lucide-react";
import { toast } from "sonner";

interface MessageInputProps {
  conversation: DirectConversation | HomeConversation;
  type: "dm" | "home";
  onMessageSent: () => void;
}

export function MessageInput({
  conversation,
  type,
  onMessageSent,
}: MessageInputProps) {
  const { t } = useTranslation();
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!content.trim() || sending) return;

    try {
      setSending(true);
      if (type === "dm") {
        const dmConv = conversation as DirectConversation;
        await sendDirectMessage(dmConv.otherUser.id, content.trim());
      } else {
        const homeConv = conversation as HomeConversation;
        await sendHomeMessage(homeConv.homeId, content.trim());
      }
      setContent("");
      onMessageSent();
    } catch (error: any) {
      console.error("Failed to send message:", error);
      toast.error(error.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-900">
      <div className="flex items-end space-x-2">
        {/* Attachment button */}
        <button
          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          title={t("attachFile")}
        >
          <Paperclip className="w-5 h-5" />
        </button>

        {/* Input */}
        <div className="flex-1 relative">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={t("typeMessage")}
            rows={1}
            className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white resize-none"
            style={{ minHeight: "40px", maxHeight: "120px" }}
          />
          <button
            className="absolute right-2 bottom-2 p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            title={t("addEmoji")}
          >
            <Smile className="w-5 h-5" />
          </button>
        </div>

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={!content.trim() || sending}
          className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title={t("send")}
        >
          {sending ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  );
}
