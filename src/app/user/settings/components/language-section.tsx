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
import { LANGUAGE_OPTIONS } from "../constants/languages";

interface LanguageSectionProps {
  language: string;
  onLanguageChange: (value: string) => void;
}

export function LanguageSection({
  language,
  onLanguageChange,
}: LanguageSectionProps) {
  const { t } = useTranslation();

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
        <Select value={language} onValueChange={onLanguageChange}>
          <SelectTrigger className="h-12 rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LANGUAGE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <div className="flex items-center gap-3 py-1">
                  <span className="text-xl">{option.flag}</span>
                  <span>{option.label}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
}
