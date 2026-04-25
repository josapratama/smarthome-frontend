"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MessageCircle } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { ChatContent } from "@/components/admin/chat/chat-content";

interface ChatCtaCardProps {
  sessionId: string;
}

export function ChatCtaCard({ sessionId }: ChatCtaCardProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Card className="mt-8 bg-primary/5 border-primary/20">
        <CardContent className="p-6 text-center">
          <MessageCircle className="h-12 w-12 mx-auto mb-4 text-primary" />
          <h3 className="text-xl font-semibold mb-2">{t("chatWithAI")}</h3>
          <p className="text-muted-foreground mb-4">{t("askMeAnything")}</p>
          <Button onClick={() => setOpen(true)} className="md:hidden">
            <MessageCircle className="h-4 w-4 mr-2" />
            {t("startChatting")}
          </Button>
          <p className="text-sm text-muted-foreground hidden md:block">
            {t("clickChatButton")}
          </p>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="p-0 max-w-full h-[90vh] sm:max-w-md flex flex-col">
          <DialogHeader className="p-4 border-b">
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              {t("aiAssistant")}
            </DialogTitle>
          </DialogHeader>
          {sessionId && (
            <div className="flex-1 overflow-hidden">
              <ChatContent sessionId={sessionId} />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
