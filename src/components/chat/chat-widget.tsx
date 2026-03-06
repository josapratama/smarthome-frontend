"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle, X } from "lucide-react";
import { ChatWindow } from "@/components/chat/chat-window";
import { v4 as uuidv4 } from "uuid";

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [sessionId, setSessionId] = useState<string>(() => {
    // Initialize session ID immediately to prevent remounting
    if (typeof window !== "undefined") {
      let sid = localStorage.getItem("chat_session_id");
      if (!sid) {
        sid = uuidv4();
        localStorage.setItem("chat_session_id", sid);
      }
      return sid;
    }
    return "";
  });

  return (
    <>
      {/* Floating Button - Hidden on mobile (< 768px) */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50 hidden md:flex"
        size="icon"
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageCircle className="h-6 w-6" />
        )}
      </Button>

      {/* Chat Window - Responsive positioning */}
      {isOpen && sessionId && (
        <ChatWindow sessionId={sessionId} onClose={() => setIsOpen(false)} />
      )}
    </>
  );
}
