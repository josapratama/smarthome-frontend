"use client";

import { usePreferences, useAppearance } from "./hooks";
import {
  ThemeSection,
  LanguageSection,
  NotificationsSection,
  TimezoneSection,
  PrivacySecuritySection,
  LoadingState,
} from "./components";

export default function SettingsPage() {
  const { theme, language, handleThemeChange, handleLanguageChange } =
    useAppearance();
  const {
    preferences,
    isLoading,
    handleNotificationChange,
    handleTimezoneChange,
  } = usePreferences();

  if (isLoading) return <LoadingState />;

  return (
    <div className="space-y-4 p-4 pb-20">
      <ThemeSection theme={theme} onThemeChange={handleThemeChange} />

      <LanguageSection
        language={language}
        onLanguageChange={handleLanguageChange}
      />

      <NotificationsSection
        notifications={preferences?.notifications}
        onNotificationChange={handleNotificationChange}
      />

      <TimezoneSection
        timezone={preferences?.timezone}
        onTimezoneChange={handleTimezoneChange}
      />

      <PrivacySecuritySection />
    </div>
  );
}
