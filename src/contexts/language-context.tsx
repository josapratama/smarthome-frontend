"use client";

import { createContext, useContext, useEffect, useState, useMemo } from "react";
import { translations, type Language } from "@/lib/i18n/translations";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("id");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Load language from localStorage, default to Indonesian
    const savedLang = localStorage.getItem("language") as Language;
    if (savedLang && translations[savedLang]) {
      setLanguageState(savedLang);
    } else {
      // Set default to Indonesian if no saved preference
      setLanguageState("id");
      localStorage.setItem("language", "id");
    }
  }, []);

  const setLanguage = (lang: Language) => {
    console.log("[Language] Changing language from", language, "to:", lang);
    setLanguageState(lang);
    localStorage.setItem("language", lang);
  };

  const t = (key: string): string => {
    const translation = translations[language];
    const result =
      (translation as any)[key] || (translations.id as any)[key] || key;
    return result;
  };

  const contextValue = useMemo(
    () => ({ language, setLanguage, t }),
    [language],
  );

  // Return a loading placeholder instead of null to prevent hydration mismatch
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
