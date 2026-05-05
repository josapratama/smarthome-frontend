/**
 * Format key dari snake_case atau SCREAMING_SNAKE_CASE ke Title Case
 * Contoh: "app_version" -> "App Version"
 */
export function formatKey(key: string): string {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

/**
 * Get category title dengan fallback
 */
export function getCategoryTitle(
  category: string,
  t: (key: string) => string,
): string {
  const titleMap: Record<string, string> = {
    general: t("generalInformation"),
    about: t("about"),
    contact: t("contactInformation"),
    legal: t("legal"),
  };

  return titleMap[category] || formatKey(category);
}

/**
 * Get category description dengan fallback
 */
export function getCategoryDescription(
  category: string,
  t: (key: string) => string,
): string {
  const descriptionMap: Record<string, string> = {
    general: t("basicApplicationInformation"),
    about: t("learnMoreAboutThisApplication"),
    contact: t("getInTouchWithUs"),
    legal: t("termsAndPolicies"),
  };

  return descriptionMap[category] || "";
}
