export interface FAQCategory {
  value: string;
  labelKey: string;
}

export const FAQ_CATEGORIES: FAQCategory[] = [
  { value: "ALL", labelKey: "all" },
  { value: "GENERAL", labelKey: "general" },
  { value: "DEVICES", labelKey: "devices" },
  { value: "AI_MODELS", labelKey: "aiModels" },
  { value: "ENERGY", labelKey: "energy" },
  { value: "ALARMS", labelKey: "alarms" },
  { value: "AUTOMATION", labelKey: "automation" },
  { value: "ACCOUNT", labelKey: "account" },
  { value: "TROUBLESHOOTING", labelKey: "troubleshooting" },
];
