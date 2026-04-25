"use client";

import { useTranslation } from "@/hooks/use-translation";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { BookOpen, HelpCircle, Search, MessageCircle } from "lucide-react";
import { useFAQ } from "./hooks";
import { FAQSearchBar, FAQCategoryFilter, FAQList } from "./components";
import { FAQ_CATEGORIES } from "./constants/faq-categories";

export default function FAQContent() {
  const { t } = useTranslation();
  const {
    faqs,
    filteredFaqs,
    isLoading,
    searchQuery,
    setSearchQuery,
    expandedId,
    toggleExpanded,
    selectedCategory,
    setSelectedCategory,
    searchSectionRef,
    handleFeedback,
  } = useFAQ();

  return (
    <div className="space-y-6">
      <PageHeader
        stats={[
          {
            label: t("totalFAQs"),
            value: faqs.length,
            icon: BookOpen,
            color: "text-blue-500",
          },
          {
            label: t("categories"),
            value: FAQ_CATEGORIES.length - 1,
            icon: HelpCircle,
            color: "text-purple-500",
          },
          {
            label: t("searchResults"),
            value: filteredFaqs.length,
            icon: Search,
            color: "text-green-500",
          },
        ]}
        actions={
          <Button asChild variant="outline">
            <a href="/user/chat">
              <MessageCircle className="h-4 w-4 mr-2" />
              {t("chatWithAI")}
            </a>
          </Button>
        }
      />

      <FAQSearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        containerRef={searchSectionRef}
      />

      <FAQCategoryFilter
        selected={selectedCategory}
        onSelect={setSelectedCategory}
      />

      <FAQList
        faqs={filteredFaqs}
        isLoading={isLoading}
        expandedId={expandedId}
        onToggle={toggleExpanded}
        onFeedback={handleFeedback}
      />
    </div>
  );
}
