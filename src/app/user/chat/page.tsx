"use client";

import { useTranslation } from "@/hooks/use-translation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot } from "lucide-react";
import { useChat } from "./hooks/use-chat";
import { ConversationSidebar } from "./components/conversation-sidebar";
import { ChatMessages } from "./components/chat-messages";
import { ChatInput } from "./components/chat-input";

export default function UserChatPage() {
  const { t } = useTranslation();
  const {
    conversations,
    currentConversation,
    messages,
    inputMessage,
    setInputMessage,
    isLoading,
    isSending,
    messagesEndRef,
    handleSendMessage,
    handleDeleteConversation,
    handleKeyPress,
    setCurrentConversation,
    setMessages,
  } = useChat();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Conversations Sidebar */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              {t("conversations") || "Conversations"}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ConversationSidebar
              conversations={conversations}
              currentConversationId={currentConversation?.id}
              isLoading={isLoading}
              onSelect={(conv) => {
                setCurrentConversation(conv);
                setMessages(conv.messages || []);
              }}
              onDelete={handleDeleteConversation}
            />
          </CardContent>
        </Card>

        {/* Chat Area */}
        <Card className="lg:col-span-3 flex flex-col h-[calc(100vh-16rem)]">
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-base flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              {currentConversation?.title || t("aiAssistant") || "AI Assistant"}
            </CardTitle>
          </CardHeader>

          {/* Messages */}
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            <ChatMessages
              messages={messages}
              isSending={isSending}
              messagesEndRef={messagesEndRef}
            />
          </CardContent>

          {/* Input */}
          <div className="p-4 border-t">
            <ChatInput
              value={inputMessage}
              onChange={setInputMessage}
              onSend={handleSendMessage}
              onKeyDown={handleKeyPress}
              disabled={isSending}
            />
          </div>
        </Card>
      </div>
    </div>
  );
}
