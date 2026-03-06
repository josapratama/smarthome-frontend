"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  ChevronUp,
  ThumbsUp,
  ThumbsDown,
  Eye,
} from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { markFAQFeedback, type FAQ } from "@/lib/api/faq";
import { toast } from "sonner";

interface FAQListProps {
  faqs: FAQ[];
  isLoading: boolean;
  onFeedback: () => void;
}

export function FAQList({ faqs, isLoading, onFeedback }: FAQListProps) {
  const { t } = useLanguage();
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const handleFeedback = async (id: number, helpful: boolean) => {
    try {
      await markFAQFeedback(id, helpful);
      toast.success(t("thankYouFeedback"));
      onFeedback();
    } catch (error) {
      console.error("Error marking feedback:", error);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">{t("loading")}</div>;
  }

  if (faqs.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">{t("noFAQsFound")}</p>
          <p className="text-sm text-muted-foreground mt-2">
            {t("tryDifferentFAQSearch")}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {faqs.map((faq) => (
        <Card key={faq.id}>
          <CardContent className="p-4">
            <button
              onClick={() =>
                setExpandedId(expandedId === faq.id ? null : faq.id)
              }
              className="w-full text-left flex items-start justify-between gap-4"
            >
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{faq.question}</h3>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {faq.viewCount}
                  </span>
                  <span className="flex items-center gap-1">
                    <ThumbsUp className="h-3 w-3" />
                    {faq.helpfulCount}
                  </span>
                </div>
              </div>
              {expandedId === faq.id ? (
                <ChevronUp className="h-5 w-5 flex-shrink-0" />
              ) : (
                <ChevronDown className="h-5 w-5 flex-shrink-0" />
              )}
            </button>

            {expandedId === faq.id && (
              <div className="mt-4 pt-4 border-t">
                <div
                  className="prose prose-sm max-w-none dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: faq.answer }}
                />

                <div className="mt-4 pt-4 border-t flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {t("wasThisHelpful")}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleFeedback(faq.id, true)}
                    >
                      <ThumbsUp className="h-4 w-4 mr-1" />
                      {t("helpful")}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleFeedback(faq.id, false)}
                    >
                      <ThumbsDown className="h-4 w-4 mr-1" />
                      {t("notHelpful")}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
