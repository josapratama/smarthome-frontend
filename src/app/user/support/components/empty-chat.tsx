"use client";

import { MessageSquare } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";

export function EmptyChat() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center h-[600px] text-center p-6">
      <MessageSquare className="h-16 w-16 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold mb-2">{t("selectConversation")}</h3>
      <p className="text-sm text-muted-foreground max-w-md">
        {t("selectConversationDescription")}
      </p>
    </div>
  );
}
