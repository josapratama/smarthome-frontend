"use client";

import { useTranslation } from "@/hooks/use-translation";
import { ConversationItem } from "./conversation-item";
import { DirectConversation, HomeConversation } from "@/lib/api/services/messaging";

interface ConversationListProps {
  conversations: (DirectConversation | HomeConversation)[];
  type: "dm" | "home";
  selectedId: number | null;
  onSelect: (conversation: any) => void;
  loading: boolean;
}

export function ConversationList({
  conversations,
  type,
  selectedId,
  onSelect,
  loading,
}: ConversationListProps) {
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="p-4 space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="flex items-center space-x-3 p-3">
              <div className="w-12 h-12 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500 dark:text-gray-400">
        <p>{t("noConversations")}</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      {conversations.map((conversation) => (
        <ConversationItem
          key={conversation.id}
          conversation={conversation}
          type={type}
          isSelected={conversation.id === selectedId}
          onClick={() => onSelect(conversation)}
        />
      ))}
    </div>
  );
}
