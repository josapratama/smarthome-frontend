"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, ThumbsUp, ThumbsDown } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import type { FAQ } from "@/lib/api/services/faq";

interface FAQItemProps {
  faq: FAQ;
  isExpanded: boolean;
  onToggle: () => void;
  onFeedback: (helpful: boolean) => void;
}

export function FAQItem({
  faq,
  isExpanded,
  onToggle,
  onFeedback,
}: FAQItemProps) {
  const { t } = useTranslation();

  return (
    <Card className="overflow-hidden">
      <CardHeader
        className="cursor-pointer hover:bg-accent/50 transition-colors p-4"
        onClick={onToggle}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-base md:text-lg font-semibold mb-2">
              {faq.question}
            </CardTitle>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="text-xs">
                {faq.category}
              </Badge>
              {faq.tags.slice(0, 3).map((tag, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-muted-foreground shrink-0" />
          ) : (
            <ChevronDown className="h-5 w-5 text-muted-foreground shrink-0" />
          )}
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="p-4 pt-0 space-y-4">
          <div
            className="prose prose-sm dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: faq.answer }}
          />

          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>
                👁️ {faq.viewCount} {t("views")}
              </span>
              <span>👍 {faq.helpfulCount}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground mr-2">
                {t("wasThisHelpful")}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onFeedback(true)}
                className="gap-1"
              >
                <ThumbsUp className="h-4 w-4" />
                {t("yes")}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onFeedback(false)}
                className="gap-1"
              >
                <ThumbsDown className="h-4 w-4" />
                {t("no")}
              </Button>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
