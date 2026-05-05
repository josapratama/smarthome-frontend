"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "@/hooks/use-translation";

const CATEGORIES = [
  "GENERAL",
  "DEVICES",
  "AI_MODELS",
  "ENERGY",
  "ALARMS",
  "AUTOMATION",
  "ACCOUNT",
  "TROUBLESHOOTING",
] as const;

type Category = (typeof CATEGORIES)[number];

interface FaqCategoriesProps {
  selected: string | null;
  counts: Record<string, number>;
  onSelect: (category: string | null) => void;
}

export function FaqCategories({
  selected,
  counts,
  onSelect,
}: FaqCategoriesProps) {
  const { t } = useTranslation();

  const labels: Record<string, string> = {
    GENERAL: t("faqGeneral"),
    DEVICES: t("devices"),
    AI_MODELS: t("faqAiModels"),
    ENERGY: t("energy"),
    ALARMS: t("alarms"),
    AUTOMATION: t("faqAutomation"),
    ACCOUNT: t("faqAccount"),
    TROUBLESHOOTING: t("faqTroubleshooting"),
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>{t("categories")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selected === null ? "default" : "outline"}
            size="sm"
            onClick={() => onSelect(null)}
            className="rounded-full"
          >
            {t("allCategories")}
          </Button>
          {CATEGORIES.map((cat) => (
            <Button
              key={cat}
              variant={selected === cat ? "default" : "outline"}
              size="sm"
              onClick={() => onSelect(cat)}
              className="rounded-full"
            >
              {labels[cat] ?? cat}
              {counts[cat] ? (
                <span className="ml-1.5 px-1.5 py-0.5 text-xs rounded-full bg-background/20">
                  {counts[cat]}
                </span>
              ) : null}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
