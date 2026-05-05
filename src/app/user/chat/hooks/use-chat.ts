"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useTranslation } from "@/hooks/use-translation";
import { toast } from "sonner";
import {
  sendMessage,
  getConversations,
  getConversation,
  deleteConversation,
  type ChatConversation,
  type ChatMessage,
} from "@/lib/api/services/chat";

export function useChat() {
  const { t } = useTranslation();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [currentConversation, setCurrentConversation] =
    useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const loadConversations = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getConversations();
      setConversations(data);
      if (data.length > 0 && !currentConversation) {
        setCurrentConversation(data[0]);
        setMessages(data[0].messages || []);
      }
    } catch (error: any) {
      toast.error(
        error.message ||
          t("failedToLoadConversations") ||
          "Failed to load conversations",
      );
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t]);

  const handleNewConversation = useCallback(() => {
    setCurrentConversation(null);
    setMessages([]);
  }, []);

  const handleSendMessage = useCallback(async () => {
    if (!inputMessage.trim() || isSending) return;

    const userMessage = inputMessage.trim();
    setInputMessage("");
    setIsSending(true);

    try {
      const response = await sendMessage({
        message: userMessage,
        conversationId: currentConversation?.id,
        sessionId: currentConversation?.sessionId,
      });

      setMessages((prev) => [
        ...prev,
        response.userMessage,
        response.aiMessage,
      ]);

      if (!currentConversation) {
        const fullConversation = await getConversation(
          response.conversation.sessionId,
        );
        setCurrentConversation(fullConversation);
        loadConversations();
      }
    } catch (error: any) {
      toast.error(
        error.message || t("failedToSendMessage") || "Failed to send message",
      );
    } finally {
      setIsSending(false);
    }
  }, [inputMessage, isSending, currentConversation, t, loadConversations]);

  const handleDeleteConversation = useCallback(
    async (sessionId: string) => {
      try {
        await deleteConversation(sessionId);
        toast.success(t("conversationDeleted") || "Conversation deleted");
        loadConversations();
        if (currentConversation?.sessionId === sessionId) {
          handleNewConversation();
        }
      } catch (error: any) {
        toast.error(
          error.message ||
            t("failedToDeleteConversation") ||
            "Failed to delete conversation",
        );
      }
    },
    [currentConversation, t, loadConversations, handleNewConversation],
  );

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    },
    [handleSendMessage],
  );

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Listen to topbar-add event
  useEffect(() => {
    const handleAdd = () => {
      handleNewConversation();
    };
    window.addEventListener("topbar-add", handleAdd);
    return () => {
      window.removeEventListener("topbar-add", handleAdd);
    };
  }, [handleNewConversation]);

  return {
    conversations,
    currentConversation,
    messages,
    inputMessage,
    setInputMessage,
    isLoading,
    isSending,
    messagesEndRef,
    handleSendMessage,
    handleNewConversation,
    handleDeleteConversation,
    handleKeyPress,
    setCurrentConversation,
    setMessages,
  };
}
