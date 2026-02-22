import { en } from "./en";
import { id } from "./id";
import { es } from "./es";
import { ja } from "./ja";
import { zh } from "./zh";
import { ko } from "./ko";

export const translations = {
  en,
  id,
  es,
  ja,
  zh,
  ko,
} as const;

export type Language = keyof typeof translations;
export type TranslationKey = keyof typeof translations.en;
