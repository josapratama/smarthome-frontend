"use client";

import { useTranslation } from "@/hooks/use-translation";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import type { ChatConversation } from "@/lib/api/services/chat";

interface ConversationSidebarProps {
  conversations: ChatConversation[];
  currentConversationId?: number;
  isLoading: boolean;
  onSelect: (conv: ChatConversation) => void;
  onDelete: (sessionId: string) => void;
}

export function ConversationSidebar({
  conversations,
  currentConversationId,
  isLoading,
  onSelect,
  onDelete,
}: ConversationSidebarProps) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="space-y-2 p-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 rounded-lg" />
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="p-6 text-center text-sm text-muted-foreground">
        {t("noConversations") || "No conversations yet"}
      </div>
    );
  }

  return (
    <div className="space-y-1 p-2">
      {conversations.map((conv) => (
        <div
          key={conv.id}
          className={cn(
            "flex items-center justify-between p-3 rounded-lg cursor-pointer hover:bg-accent transition-colors",
            currentConversationId === conv.id && "bg-accent",
          )}
          onClick={() => onSelect(conv)}
        >
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {conv.title || t("newConversation") || "New Conversation"}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(conv.updatedAt), {
                addSuffix: true,
              })}
            </p>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(conv.sessionId);
            }}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ))}
    </div>
  );
}
