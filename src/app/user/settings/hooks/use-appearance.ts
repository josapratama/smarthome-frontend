"use client";

import { useTranslation } from "@/hooks/use-translation";
import { useTheme } from "@/contexts/theme-context";
import { useLanguage } from "@/contexts/language-context";
import { toast } from "sonner";
import { preferencesApi } from "@/lib/api/services/preferences";

export function useAppearance() {
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage } = useLanguage();

  const handleThemeChange = async (newTheme: string) => {
    setTheme(newTheme as "light" | "dark" | "system");
    try {
      await preferencesApi.update({ theme: newTheme as any });
      toast.success(t("settingsSaved"));
    } catch (error) {
      console.error("Failed to save theme preference:", error);
    }
  };

  const handleLanguageChange = async (newLanguage: string) => {
    setLanguage(newLanguage as any);
    try {
      await preferencesApi.update({ language: newLanguage });
      toast.success(t("settingsSaved"));
    } catch (error) {
      console.error("Failed to save language preference:", error);
    }
  };

  return {
    theme,
    language,
    handleThemeChange,
    handleLanguageChange,
  };
}
