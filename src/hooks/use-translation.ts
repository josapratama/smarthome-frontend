"use client";

import { useLanguage } from "@/contexts/language-context";

/**
 * Hook for translations
 * Now uses the LanguageContext for consistency
 */
export function useTranslation() {
  const { language, t } = useLanguage();
  return { t, language };
}
