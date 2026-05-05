"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/use-translation";
import { getFAQs, markFAQFeedback, type FAQ } from "@/lib/api/services/faq";

export function useFAQ() {
  const { t } = useTranslation();
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [filteredFaqs, setFilteredFaqs] = useState<FAQ[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const searchSectionRef = useRef<HTMLDivElement>(null);

  const loadFAQs = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getFAQs({ isPublished: true });
      setFaqs(data);
      setFilteredFaqs(data);
    } catch (error: any) {
      toast.error(error.message || t("failedToLoadFAQ"));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadFAQs();
  }, [loadFAQs]);

  useEffect(() => {
    let filtered = faqs;
    if (selectedCategory !== "ALL") {
      filtered = filtered.filter((faq) => faq.category === selectedCategory);
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (faq) =>
          faq.question.toLowerCase().includes(query) ||
          faq.answer.toLowerCase().includes(query) ||
          faq.tags.some((tag) => tag.toLowerCase().includes(query)),
      );
    }
    setFilteredFaqs(filtered);
  }, [searchQuery, selectedCategory, faqs]);

  // Focus search input on topbar-search event
  useEffect(() => {
    const handleSearch = () => {
      const input =
        searchSectionRef.current?.querySelector("input") ??
        (document.querySelector("input") as HTMLInputElement | null);
      input?.focus();
      input?.select();
    };
    window.addEventListener("topbar-search", handleSearch);
    return () => window.removeEventListener("topbar-search", handleSearch);
  }, []);

  const handleFeedback = async (faqId: number, helpful: boolean) => {
    try {
      await markFAQFeedback(faqId, helpful);
      toast.success(t("thankYouForFeedback"));
      loadFAQs();
    } catch (error: any) {
      toast.error(error.message || t("failedToSubmitFeedback"));
    }
  };

  const toggleExpanded = (id: number) =>
    setExpandedId((prev) => (prev === id ? null : id));

  return {
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
  };
}
