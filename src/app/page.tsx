"use client";

import {
  PublicSettingsProvider,
  usePublicSettings,
} from "@/contexts/public-settings-context";
import { useState } from "react";
import { Header } from "@/components/landing/header";
import { HeroSection } from "@/components/landing/hero-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { CTASection } from "@/components/landing/cta-section";
import { Footer } from "@/components/landing/footer";
import { AuthRedirect } from "@/components/landing/auth-redirect";

function LandingPageContent() {
  const { theme, language, toggleTheme, setLanguage, t } = usePublicSettings();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <AuthRedirect />
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
