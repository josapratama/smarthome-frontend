"use client";

import { Home, User } from "lucide-react";
import type {
  DirectConversation,
  HomeConversation,
} from "@/lib/api/services/messaging";

interface MobileChatHeaderProps {
  conversation: DirectConversation | HomeConversation;
  type: "dm" | "home";
  onBack: () => void;
}

export function MobileChatHeader({
  conversation,
  type,
  onBack,
}: MobileChatHeaderProps) {
  return (
    <div className="flex items-center p-4 border-b bg-card">
      <button
        onClick={onBack}
        className="mr-3 p-2 hover:bg-muted rounded-lg transition-colors"
        aria-label="Back"
      >
        <svg
          className="w-6 h-6"
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
        {type === "dm" ? (
          <>
            {(conversation as DirectConversation).otherUser.avatarUrl ? (
              <img
                src={(conversation as DirectConversation).otherUser.avatarUrl!}
                alt={(conversation as DirectConversation).otherUser.username}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                <User className="w-5 h-5" />
              </div>
            )}
            <h2 className="font-semibold">
              {(conversation as DirectConversation).otherUser.username}
            </h2>
          </>
        ) : (
          <>
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
              <Home className="w-5 h-5" />
            </div>
            <h2 className="font-semibold">
              {(conversation as HomeConversation).home.name}
            </h2>
          </>
        )}
      </div>
    </div>
  );
}
