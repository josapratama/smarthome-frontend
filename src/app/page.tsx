"use client";

import {
  PublicSettingsProvider,
  usePublicSettings,
} from "@/contexts/public-settings-context";
import { useState } from "react";
import { Header } from "@/components/landing/Header";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { CTASection } from "@/components/landing/CTASection";
import { Footer } from "@/components/landing/Footer";

function LandingPageContent() {
  const { theme, language, toggleTheme, setLanguage, t } = usePublicSettings();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Header
        theme={theme}
        language={language}
        toggleTheme={toggleTheme}
        setLanguage={setLanguage}
        t={t}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />
      <HeroSection t={t} />
      <FeaturesSection t={t} />
      <CTASection t={t} />
      <Footer t={t} />
    </div>
  );
}

export default function LandingPage() {
  return (
    <PublicSettingsProvider>
      <LandingPageContent />
    </PublicSettingsProvider>
  );
}
