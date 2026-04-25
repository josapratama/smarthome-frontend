"use client";

import { useTranslation } from "@/hooks/use-translation";
import { Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import type { ChatMessage } from "@/lib/api/services/chat";
import type { RefObject } from "react";

interface ChatMessagesProps {
  messages: ChatMessage[];
  isSending: boolean;
  messagesEndRef: RefObject<HTMLDivElement>;
}

export function ChatMessages({
  messages,
  isSending,
  messagesEndRef,
}: ChatMessagesProps) {
  const { t } = useTranslation();

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <Bot className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">
          {t("startConversation") || "Start a conversation"}
        </h3>
        <p className="text-sm text-muted-foreground max-w-md">
          {t("askAnything") ||
            "Ask me anything about your smart home, devices, energy usage, or troubleshooting."}
        </p>
      </div>
    );
  }

  return (
    <>
      {messages.map((message) => (
        <div
          key={message.id}
          className={cn(
            "flex gap-3",
            message.role === "USER" ? "justify-end" : "justify-start",
          )}
        >
          {message.role === "ASSISTANT" && (
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Bot className="h-5 w-5 text-primary" />
            </div>
          )}
          <div
            className={cn(
              "max-w-[80%] rounded-lg p-3",
              message.role === "USER"
                ? "bg-primary text-primary-foreground"
                : "bg-muted",
            )}
          >
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            <p className="text-xs opacity-70 mt-1">
              {formatDistanceToNow(new Date(message.createdAt), {
                addSuffix: true,
              })}
            </p>
          </div>
          {message.role === "USER" && (
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center shrink-0">
              <User className="h-5 w-5 text-primary-foreground" />
            </div>
          )}
        </div>
      ))}

      {isSending && (
        <div className="flex gap-3 justify-start">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Bot className="h-5 w-5 text-primary animate-pulse" />
          </div>
          <div className="bg-muted rounded-lg p-3">
            <div className="flex gap-1">
              <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" />
              <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce delay-100" />
              <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce delay-200" />
            </div>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </>
  );
}
