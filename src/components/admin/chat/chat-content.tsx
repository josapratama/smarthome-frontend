"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Bot, User, Loader2 } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import {
  sendMessage,
  getConversation,
  type ChatMessage,
} from "@/lib/api/services/chat";
import { toast } from "sonner";

interface ChatContentProps {
  sessionId: string;
}

export function ChatContent({ sessionId }: ChatContentProps) {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasLoadedRef = useRef(false);

  // Load conversation only once on mount
  useEffect(() => {
    if (!hasLoadedRef.current) {
      hasLoadedRef.current = true;
      loadConversation();
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadConversation = async () => {
    // Check if conversation exists in localStorage
    const conversationExists = localStorage.getItem(
      `chat_conversation_${sessionId}`,
    );

    if (!conversationExists) {
      // New conversation - don't make API call
      setMessages([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const data = await getConversation(sessionId);
      setMessages(data.messages || []);
    } catch (error: any) {
      // If 404, remove the flag and start fresh
      if (error?.status === 404) {
        localStorage.removeItem(`chat_conversation_${sessionId}`);
      }
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isSending) return;

    const userMessage = inputMessage.trim();
    setInputMessage("");
    setIsSending(true);

    // Add user message optimistically
    const tempUserMsg: ChatMessage = {
      id: Date.now(),
      role: "USER",
      content: userMessage,
      createdAt: new Date().toISOString(),
      conversationId: 0,
      model: null,
      tokens: null,
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const response = await sendMessage({
        message: userMessage,
        sessionId,
      });

      // Replace temp message with real messages
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== tempUserMsg.id),
        response.userMessage,
        response.aiMessage,
      ]);

      // Mark conversation as created in localStorage
      localStorage.setItem(`chat_conversation_${sessionId}`, "true");
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
      // Remove temp message on error
      setMessages((prev) => prev.filter((m) => m.id !== tempUserMsg.id));
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Bot className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">{t("startChatting")}</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-2 ${
                message.role === "USER" ? "justify-end" : "justify-start"
              }`}
            >
              {message.role === "ASSISTANT" && (
                <div className="flex-shrink-0">
                  <Bot className="h-6 w-6 text-primary" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === "USER"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>
              {message.role === "USER" && (
                <div className="flex-shrink-0">
                  <User className="h-6 w-6 text-primary" />
                </div>
              )}
            </div>
          ))
        )}
        {isSending && (
          <div className="flex gap-2 justify-start">
            <Bot className="h-6 w-6 text-primary flex-shrink-0" />
            <div className="bg-muted rounded-lg p-3">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t p-4">
        <div className="flex gap-2">
          <Input
            placeholder={t("typeMessage")}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={isSending}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isSending}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
