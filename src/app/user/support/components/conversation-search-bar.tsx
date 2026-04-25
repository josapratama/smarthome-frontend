"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";

interface ConversationSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  containerRef: React.RefObject<HTMLDivElement>;
}

export function ConversationSearchBar({
  value,
  onChange,
  containerRef,
}: ConversationSearchBarProps) {
  const { t } = useTranslation();

  return (
    <div ref={containerRef}>
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("searchConversations")}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
