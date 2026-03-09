"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  HelpCircle,
  ChevronDown,
  ChevronUp,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { markFAQFeedback, type FAQ } from "@/lib/api/services/faq";
import { toast } from "sonner";

interface FAQListProps {
  faqs: FAQ[];
  isLoading: boolean;
  onFeedback?: () => void;
}

export function FAQList({ faqs, isLoading, onFeedback }: FAQListProps) {
  const { t } = useLanguage();
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const handleFeedback = async (faqId: number, helpful: boolean) => {
    try {
      await markFAQFeedback(faqId, helpful);
      toast.success(t("thankYouForFeedback") || "Thank you for your feedback!");
      if (onFeedback) onFeedback();
    } catch (error: any) {
      toast.error(
        error.message ||
          t("failedToSubmitFeedback") ||
          "Failed to submit feedback",
      );
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-20 rounded-lg" />
        ))}
      </div>
    );
  }

  if (faqs.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <HelpCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">
            {t("noFAQFound") || "No FAQ Found"}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t("tryDifferentSearch") ||
              "Try a different search term or category"}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {faqs.map((faq) => {
        const isExpanded = expandedId === faq.id;

        return (
          <Card key={faq.id} className="overflow-hidden">
            <CardHeader
              className="cursor-pointer hover:bg-accent/50 transition-colors p-4"
              onClick={() => setExpandedId(isExpanded ? null : faq.id)}
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
                      👁️ {faq.viewCount} {t("views") || "views"}
                    </span>
                    <span>👍 {faq.helpfulCount}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground mr-2">
                      {t("wasThisHelpful") || "Was this helpful?"}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleFeedback(faq.id, true)}
                      className="gap-1"
                    >
                      <ThumbsUp className="h-4 w-4" />
                      {t("yes") || "Yes"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleFeedback(faq.id, false)}
                      className="gap-1"
                    >
                      <ThumbsDown className="h-4 w-4" />
                      {t("no") || "No"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}
