export interface LanguageOption {
  value: string;
  label: string;
  flag: string;
}

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { value: "id", label: "Bahasa Indonesia", flag: "🇮🇩" },
  { value: "en", label: "English", flag: "🇬🇧" },
  { value: "jv", label: "Basa Jawa", flag: "🇮🇩" },
  { value: "su", label: "Basa Sunda", flag: "🇮🇩" },
  { value: "plm", label: "Baso Palembang", flag: "🇮🇩" },
  { value: "es", label: "Español", flag: "🇪🇸" },
  { value: "ja", label: "日本語", flag: "🇯🇵" },
  { value: "zh", label: "中文", flag: "🇨🇳" },
  { value: "zhPinyin", label: "中文 (Pīnyīn)", flag: "🇨🇳" },
  { value: "ko", label: "한국어", flag: "🇰🇷" },
  { value: "ar", label: "العربية", flag: "🇸🇦" },
];

export interface TimezoneOption {
  value: string;
  label: string;
}

export const TIMEZONE_OPTIONS: TimezoneOption[] = [
  { value: "UTC", label: "UTC (GMT+0)" },
  { value: "Asia/Jakarta", label: "Asia/Jakarta (GMT+7)" },
  { value: "Asia/Tokyo", label: "Asia/Tokyo (GMT+9)" },
  { value: "Europe/London", label: "Europe/London (GMT+0)" },
  { value: "America/New_York", label: "America/New York (GMT-5)" },
  { value: "America/Los_Angeles", label: "America/Los Angeles (GMT-8)" },
];
