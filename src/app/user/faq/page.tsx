"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "@/hooks/use-translation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  HelpCircle,
  Search,
  ChevronDown,
  ChevronUp,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { getFAQs, markFAQFeedback, type FAQ } from "@/lib/api/faq";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function UserFAQPage() {
  const { t } = useTranslation();
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [filteredFaqs, setFilteredFaqs] = useState<FAQ[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  useEffect(() => {
    loadFAQs();
  }, []);

  useEffect(() => {
    filterFAQs();
  }, [searchQuery, selectedCategory, faqs]);

  const loadFAQs = async () => {
    setIsLoading(true);
    try {
      const data = await getFAQs({ isPublished: true });
      setFaqs(data);
      setFilteredFaqs(data);
    } catch (error: any) {
      toast.error(
        error.message || t("failedToLoadFAQ") || "Failed to load FAQ",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const filterFAQs = () => {
    let filtered = faqs;

    // Filter by category
    if (selectedCategory !== "ALL") {
      filtered = filtered.filter((faq) => faq.category === selectedCategory);
    }

    // Filter by search query
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
  };

  const handleFeedback = async (faqId: number, helpful: boolean) => {
    try {
      await markFAQFeedback(faqId, helpful);
      toast.success(t("thankYouForFeedback") || "Thank you for your feedback!");
      loadFAQs();
    } catch (error: any) {
      toast.error(
        error.message ||
          t("failedToSubmitFeedback") ||
          "Failed to submit feedback",
      );
    }
  };

  const categories = [
    { value: "ALL", label: t("all") || "All" },
    { value: "GENERAL", label: t("general") || "General" },
    { value: "DEVICES", label: t("devices") || "Devices" },
    { value: "AI_MODELS", label: t("aiModels") || "AI Models" },
    { value: "ENERGY", label: t("energy") || "Energy" },
    { value: "ALARMS", label: t("alarms") || "Alarms" },
    { value: "AUTOMATION", label: t("automation") || "Automation" },
    { value: "ACCOUNT", label: t("account") || "Account" },
    {
      value: "TROUBLESHOOTING",
      label: t("troubleshooting") || "Troubleshooting",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold mb-1 flex items-center gap-2">
          <HelpCircle className="h-7 w-7" />
          {t("faq") || "Frequently Asked Questions"}
        </h1>
        <p className="text-sm md:text-base text-muted-foreground">
          {t("faqDescription") ||
            "Find answers to common questions about using the smart home system"}
        </p>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("searchFAQ") || "Search questions..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Badge
            key={category.value}
            variant={
              selectedCategory === category.value ? "default" : "outline"
            }
            className="cursor-pointer"
            onClick={() => setSelectedCategory(category.value)}
          >
            {category.label}
          </Badge>
        ))}
      </div>

      {/* FAQ List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
      ) : filteredFaqs.length === 0 ? (
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
      ) : (
        <div className="space-y-3">
          {filteredFaqs.map((faq) => {
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
                          <Badge
                            key={idx}
                            variant="outline"
                            className="text-xs"
                          >
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
      )}

      {/* Help Section */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-2">
            {t("stillNeedHelp") || "Still need help?"}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {t("contactSupportMessage") ||
              "Can't find what you're looking for? Contact our support team or use the AI chat assistant."}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <a href="/user/chat">
                {t("chatWithAI") || "Chat with AI Assistant"}
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
