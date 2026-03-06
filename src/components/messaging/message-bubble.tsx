"use client";

import { format } from "date-fns";
import { DirectMessage, HomeMessage } from "@/lib/api/messaging";
import { Check, CheckCheck } from "lucide-react";

interface MessageBubbleProps {
  message: DirectMessage | HomeMessage;
  type: "dm" | "home";
  isOwn: boolean;
}

export function MessageBubble({ message, type, isOwn }: MessageBubbleProps) {
  const isDM = type === "dm";
  const dmMessage = isDM ? (message as DirectMessage) : null;
  const homeMessage = !isDM ? (message as HomeMessage) : null;

  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
      <div className={`flex items-end space-x-2 max-w-[70%]`}>
        {/* Avatar for other users in home chat */}
        {!isOwn && type === "home" && (
          <div className="flex-shrink-0 mb-1">
            {homeMessage?.sender.avatarUrl ? (
              <img
                src={homeMessage.sender.avatarUrl}
                alt={homeMessage.sender.username}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center text-white text-xs">
                {homeMessage?.sender.username.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col">
          {/* Sender name for home chat */}
          {!isOwn && type === "home" && (
            <span className="text-xs text-gray-600 dark:text-gray-400 mb-1 ml-2">
              {homeMessage?.sender.username}
            </span>
          )}

          {/* Message bubble */}
          <div
            className={`rounded-2xl px-4 py-2 ${
              isOwn
                ? "bg-blue-600 text-white rounded-br-none"
                : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-none"
            }`}
          >
            <p className="text-sm whitespace-pre-wrap break-words">
              {message.content}
            </p>

            {/* Attachment */}
            {message.attachmentUrl && (
              <div className="mt-2">
                {message.attachmentType?.startsWith("image/") ? (
                  <img
                    src={message.attachmentUrl}
                    alt="Attachment"
                    className="rounded-lg max-w-full"
                  />
                ) : (
                  <a
                    href={message.attachmentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm underline"
                  >
                    {message.attachmentUrl.split("/").pop()}
                  </a>
                )}
              </div>
            )}

            {/* Timestamp and status */}
            <div className="flex items-center justify-end space-x-1 mt-1">
              <span
                className={`text-xs ${
                  isOwn ? "text-blue-100" : "text-gray-500 dark:text-gray-400"
                }`}
              >
                {format(new Date(message.createdAt), "HH:mm")}
              </span>
              {isOwn && isDM && dmMessage && (
                <span className="text-blue-100">
                  {dmMessage.status === "READ" ? (
                    <CheckCheck className="w-3 h-3" />
                  ) : dmMessage.status === "DELIVERED" ? (
                    <CheckCheck className="w-3 h-3 opacity-50" />
                  ) : (
                    <Check className="w-3 h-3 opacity-50" />
                  )}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
