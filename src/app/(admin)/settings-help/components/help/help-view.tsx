"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, HelpCircle, Folder, CheckCircle } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { PageHeader } from "@/components/ui/page-header";
import { getFAQs, getCategories } from "@/lib/api/services/faq";
import { FAQList } from "../../faq-list";
import { FaqCategories } from "./faq-categories";
import { ChatCtaCard } from "./chat-cta-card";
import { v4 as uuidv4 } from "uuid";

function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "";
  let sid = localStorage.getItem("chat_session_id");
  if (!sid) {
    sid = uuidv4();
    localStorage.setItem("chat_session_id", sid);
  }
  return sid;
}

export function HelpView() {
  const { t } = useTranslation();
  const [faqs, setFaqs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>(
    {},
  );
  const [sessionId] = useState<string>(getOrCreateSessionId);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadFAQs();
    loadCategories();
  }, [selectedCategory, searchQuery]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const onSearch = () => {
      const input =
        searchRef.current?.querySelector("input") ??
        (document.querySelector("input") as HTMLInputElement | null);
      input?.focus();
      input?.select();
    };
    window.addEventListener("topbar-search", onSearch);
    return () => window.removeEventListener("topbar-search", onSearch);
  }, []);

  async function loadFAQs() {
    setIsLoading(true);
    try {
      const data = await getFAQs({
        category: (selectedCategory as any) || undefined,
        search: searchQuery || undefined,
        isPublished: true,
      });
      setFaqs(data);
    } catch {
      // silent
    } finally {
      setIsLoading(false);
    }
  }

  async function loadCategories() {
    try {
      const data = await getCategories();
      const counts: Record<string, number> = {};
      data.forEach((cat) => {
        counts[cat.category] = cat.count;
      });
      setCategoryCounts(counts);
    } catch {
      // silent
    }
  }

  const totalFAQs = Object.values(categoryCounts).reduce((a, b) => a + b, 0);

  return (
    <div className="container mx-auto p-4 sm:p-6 max-w-6xl space-y-6">
      <PageHeader
        stats={[
          {
            label: t("totalFAQs"),
            value: totalFAQs,
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
      <div ref={searchRef}>
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
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

      <FaqCategories
        selected={selectedCategory}
        counts={categoryCounts}
        onSelect={setSelectedCategory}
      />

      <FAQList faqs={faqs} isLoading={isLoading} onFeedback={loadFAQs} />

      <ChatCtaCard sessionId={sessionId} />
    </div>
  );
}
