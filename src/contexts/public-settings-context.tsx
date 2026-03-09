"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { translations as localeTranslations } from "@/lib/i18n/locales";
import type { Language as LocaleLanguage } from "@/lib/i18n/locales";

type Theme = "light" | "dark";
type Language = LocaleLanguage;

interface PublicSettingsContextType {
  theme: Theme;
  language: Language;
  setTheme: (theme: Theme) => void;
  setLanguage: (language: Language) => void;
  toggleTheme: () => void;
  t: (key: string) => string;
}

const PublicSettingsContext = createContext<
  PublicSettingsContextType | undefined
>(undefined);

export function PublicSettingsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [theme, setThemeState] = useState<Theme>("dark");
  const [language, setLanguageState] = useState<Language>("id");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Load from localStorage
    const savedTheme = localStorage.getItem("public-theme") as Theme;
    const savedLanguage = localStorage.getItem("public-language") as Language;

    if (savedTheme) setThemeState(savedTheme);
    if (savedLanguage) setLanguageState(savedLanguage);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // Apply theme
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    localStorage.setItem("public-theme", theme);
  }, [theme, mounted]);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem("public-language", language);
  }, [language, mounted]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
  };

  const toggleTheme = () => {
    setThemeState((prev) => (prev === "light" ? "dark" : "light"));
  };

  const t = (key: string): string => {
    // Use locale translations
    const translation = localeTranslations[language];
    return (translation as any)?.[key] || key;
  };

  return (
    <PublicSettingsContext.Provider
      value={{ theme, language, setTheme, setLanguage, toggleTheme, t }}
    >
      {children}
    </PublicSettingsContext.Provider>
  );
}

export function usePublicSettings() {
  const context = useContext(PublicSettingsContext);
  if (!context) {
    throw new Error(
      "usePublicSettings must be used within PublicSettingsProvider",
    );
  }
  return context;
}
