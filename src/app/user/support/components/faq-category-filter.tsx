"use client";

import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/hooks/use-translation";
import { FAQ_CATEGORIES } from "../constants/faq-categories";

interface FAQCategoryFilterProps {
  selected: string;
  onSelect: (value: string) => void;
}

export function FAQCategoryFilter({
  selected,
  onSelect,
}: FAQCategoryFilterProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-wrap gap-2">
      {FAQ_CATEGORIES.map((category) => (
        <Badge
          key={category.value}
          variant={selected === category.value ? "default" : "outline"}
          className="cursor-pointer"
          onClick={() => onSelect(category.value)}
        >
          {t(category.labelKey)}
        </Badge>
      ))}
    </div>
  );
}
