"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Search,
  MessageCircle,
  HelpCircle,
  Folder,
  CheckCircle,
} from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { getFAQs, getCategories, type FAQ } from "@/lib/api/faq";
import { FAQList } from "./faq-list";
import { ChatContent } from "@/app/user/chat/chat-content";
import { v4 as uuidv4 } from "uuid";

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

export default function HelpUI() {
  const { t } = useLanguage();
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>(
    {},
  );
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [sessionId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      let sid = localStorage.getItem("chat_session_id");
      if (!sid) {
        sid = uuidv4();
        localStorage.setItem("chat_session_id", sid);
      }
      return sid;
    }
    return "";
  });

  const searchSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadFAQs();
    loadCategories();
  }, [selectedCategory, searchQuery]);

  useEffect(() => {
    const handleSearch = () => {
      let searchInput: HTMLInputElement | null = null;
      if (searchSectionRef.current) {
        searchInput = searchSectionRef.current.querySelector(
          "input",
        ) as HTMLInputElement;
      }
      if (!searchInput) {
        searchInput = document.querySelector("input") as HTMLInputElement;
      }
      if (searchInput) {
        searchInput.focus();
        searchInput.select();
      }
    };

    window.addEventListener("topbar-search", handleSearch);

    return () => {
      window.removeEventListener("topbar-search", handleSearch);
    };
  }, []);

  const loadFAQs = async () => {
    setIsLoading(true);
    try {
      const data = await getFAQs({
        category: (selectedCategory as any) || undefined,
        search: searchQuery || undefined,
        isPublished: true,
      });
      setFaqs(data);
    } catch (error) {
      console.error("Error loading FAQs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await getCategories();
      const counts: Record<string, number> = {};
      data.forEach((cat) => {
        counts[cat.category] = cat.count;
      });
      setCategoryCounts(counts);
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  };

  const getCategoryLabel = (category: string) => {
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
    return labels[category] || category;
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 max-w-6xl space-y-6">
      {/* Header with Stats */}
      <PageHeader
        stats={[
          {
            label: t("totalFAQs"),
            value: Object.values(categoryCounts).reduce((a, b) => a + b, 0),
            icon: HelpCircle,
            color: "text-blue-500",
          },
          {
            label: t("categories"),
            value: Object.keys(categoryCounts).length,
            icon: Folder,
            color: "text-green-500",
          },
          {
            label: t("published"),
            value: faqs.length,
            icon: CheckCircle,
            color: "text-purple-500",
          },
        ]}
      />

      {/* Search */}
      <div ref={searchSectionRef}>
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder={t("searchFAQ")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Categories */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>{t("categories")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
              className="rounded-full"
            >
              {t("allCategories")}
            </Button>
            {CATEGORIES.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="rounded-full"
              >
                {getCategoryLabel(category)}
                {categoryCounts[category] ? (
                  <span className="ml-1.5 px-1.5 py-0.5 text-xs rounded-full bg-background/20">
                    {categoryCounts[category]}
                  </span>
                ) : null}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* FAQ List */}
      <FAQList faqs={faqs} isLoading={isLoading} onFeedback={loadFAQs} />

      {/* Chat CTA */}
      <Card className="mt-8 bg-primary/5 border-primary/20">
        <CardContent className="p-6 text-center">
          <MessageCircle className="h-12 w-12 mx-auto mb-4 text-primary" />
          <h3 className="text-xl font-semibold mb-2">{t("chatWithAI")}</h3>
          <p className="text-muted-foreground mb-4">{t("askMeAnything")}</p>
          <Button onClick={() => setIsChatOpen(true)} className="md:hidden">
            <MessageCircle className="h-4 w-4 mr-2" />
            {t("startChatting")}
          </Button>
          <p className="text-sm text-muted-foreground hidden md:block">
            {t("clickChatButton")}
          </p>
        </CardContent>
      </Card>

      {/* Mobile Chat Dialog */}
      <Dialog open={isChatOpen} onOpenChange={setIsChatOpen}>
        <DialogContent className="p-0 max-w-full h-[90vh] sm:max-w-md flex flex-col">
          <DialogHeader className="p-4 border-b">
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              {t("aiAssistant")}
            </DialogTitle>
          </DialogHeader>
          {sessionId && (
            <div className="flex-1 overflow-hidden">
              <ChatContent sessionId={sessionId} />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
