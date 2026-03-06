"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bot, X } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { ChatContent } from "./chat-content";

interface ChatWindowProps {
  sessionId: string;
  onClose?: () => void;
}

export function ChatWindow({ sessionId, onClose }: ChatWindowProps) {
  const { t } = useLanguage();

  return (
    <Card className="fixed bottom-24 right-6 w-96 h-[500px] shadow-2xl z-50 md:flex flex-col hidden">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            <CardTitle>{t("aiAssistant")}</CardTitle>
          </div>
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <div className="flex-1 overflow-hidden">
        <ChatContent sessionId={sessionId} />
      </div>
    </Card>
  );
}
