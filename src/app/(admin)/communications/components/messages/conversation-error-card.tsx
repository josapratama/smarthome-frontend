import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";

interface ConversationErrorCardProps {
  message: string;
}

export function ConversationErrorCard({ message }: ConversationErrorCardProps) {
  const { t } = useTranslation();

  return (
    <Card className="rounded-2xl border-destructive/50 bg-destructive/5">
      <CardContent className="p-6">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
            <MessageSquare className="h-5 w-5 text-destructive" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-destructive mb-1">
              {t("failedToLoadConversations")}
            </h3>
            <p className="text-sm text-muted-foreground">{message}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
