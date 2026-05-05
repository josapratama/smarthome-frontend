import { en } from "./en";
import { id } from "./id";
import { es } from "./es";
import { ja } from "./ja";
import { zh } from "./zh";
import { ko } from "./ko";
import { ar } from "./ar";
import { jv } from "./jv";
import { plm } from "./plm";
import { su } from "./su";
import { zhPinyin } from "./zh-pinyin";

export const translations = {
  en,
  id,
  es,
  ja,
  zh,
  ko,
  zhPinyin,
  ar,
  jv,
  plm,
  su,
} as const;

export type Language = keyof typeof translations;
export type TranslationKey = keyof typeof translations.en;
