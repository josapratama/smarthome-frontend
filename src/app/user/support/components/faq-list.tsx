"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { HelpCircle } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { FAQItem } from "./faq-item";
import type { FAQ } from "@/lib/api/services/faq";

interface FAQListProps {
  faqs: FAQ[];
  isLoading: boolean;
  expandedId: number | null;
  onToggle: (id: number) => void;
  onFeedback: (id: number, helpful: boolean) => void;
}

export function FAQList({
  faqs,
  isLoading,
  expandedId,
  onToggle,
  onFeedback,
}: FAQListProps) {
  const { t } = useTranslation();

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
          <h3 className="text-lg font-semibold mb-2">{t("noFAQFound")}</h3>
          <p className="text-sm text-muted-foreground">
            {t("tryDifferentSearch")}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {faqs.map((faq) => (
        <FAQItem
          key={faq.id}
          faq={faq}
          isExpanded={expandedId === faq.id}
          onToggle={() => onToggle(faq.id)}
          onFeedback={(helpful) => onFeedback(faq.id, helpful)}
        />
      ))}
    </div>
  );
}
