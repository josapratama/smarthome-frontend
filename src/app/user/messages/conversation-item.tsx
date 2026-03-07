"use client";

import { formatDistanceToNow } from "date-fns";
import { User, Home } from "lucide-react";
import { DirectConversation, HomeConversation } from "@/lib/api/messaging";

interface ConversationItemProps {
  conversation: DirectConversation | HomeConversation;
  type: "dm" | "home";
  isSelected: boolean;
  onClick: () => void;
}

export function ConversationItem({
  conversation,
  type,
  isSelected,
  onClick,
}: ConversationItemProps) {
  const lastMessage = conversation.messages[0];
  const unreadCount = conversation.unreadCount;

  const name =
    type === "dm"
      ? (conversation as DirectConversation).otherUser.username
      : (conversation as HomeConversation).home.name;

  const avatarUrl =
    type === "dm"
      ? (conversation as DirectConversation).otherUser.avatarUrl
      : null;

  return (
    <button
      onClick={onClick}
      className={`w-full p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left ${
        isSelected ? "bg-blue-50 dark:bg-blue-900/20" : ""
      }`}
    >
      <div className="flex items-start space-x-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={name}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white">
              {type === "dm" ? (
                <User className="w-6 h-6" />
              ) : (
                <Home className="w-6 h-6" />
              )}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <p className="font-medium text-gray-900 dark:text-white truncate">
              {name}
            </p>
            {lastMessage && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {formatDistanceToNow(new Date(lastMessage.createdAt), {
                  addSuffix: true,
                })}
              </span>
            )}
          </div>
          {lastMessage && (
            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
              {type === "home" && lastMessage.sender.username + ": "}
              {lastMessage.content}
            </p>
          )}
        </div>

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <div className="flex-shrink-0">
            <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-1 min-w-[1.5rem] text-center">
              {unreadCount}
            </span>
          </div>
        )}
      </div>
    </button>
  );
}
