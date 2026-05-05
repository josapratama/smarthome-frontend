"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Globe } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { useLanguage } from "@/contexts/language-context";

const LANGUAGES = [
  { value: "id", flag: "🇮🇩", label: "Bahasa Indonesia" },
  { value: "en", flag: "🇬🇧", label: "English" },
  { value: "jv", flag: "🇮🇩", label: "Basa Jawa" },
  { value: "su", flag: "🇮🇩", label: "Basa Sunda" },
  { value: "plm", flag: "🇮🇩", label: "Baso Palembang" },
  { value: "es", flag: "🇪🇸", label: "Español" },
  { value: "ja", flag: "🇯🇵", label: "日本語" },
  { value: "zh", flag: "🇨🇳", label: "中文" },
  { value: "zhPinyin", flag: "🇨🇳", label: "中文 (Pīnyīn)" },
  { value: "ko", flag: "🇰🇷", label: "한국어" },
  { value: "ar", flag: "🇸🇦", label: "العربية" },
];

interface LanguageCardProps {
  onSaved: () => void;
}

export function LanguageCard({ onSaved }: LanguageCardProps) {
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguage();

  return (
    <Card className="rounded-2xl shadow-sm border-0 bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <Globe className="h-5 w-5 text-primary" />
          {t("language")}
        </CardTitle>
        <CardDescription className="text-sm">
          {t("languageDescription")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Select
          value={language}
          onValueChange={(v) => {
            setLanguage(v as any);
            onSaved();
          }}
        >
          <SelectTrigger className="h-12 rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LANGUAGES.map(({ value, flag, label }) => (
              <SelectItem key={value} value={value}>
                <div className="flex items-center gap-3 py-1">
                  <span className="text-xl">{flag}</span>
                  <span>{label}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
}
