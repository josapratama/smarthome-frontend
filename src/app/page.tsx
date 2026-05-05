"use client";

import {
  PublicSettingsProvider,
  usePublicSettings,
} from "@/contexts/public-settings-context";
import { HeroSection } from "@/components/landing/hero-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { CTASection } from "@/components/landing/cta-section";
import { AuthRedirect } from "@/components/landing/auth-redirect";
import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";

function LandingPageContent() {
  const { t } = usePublicSettings();

  return (
    <div className="min-h-screen bg-background">
      <AuthRedirect />
      <Header />
      <HeroSection t={t} />
      <FeaturesSection t={t} />
      <CTASection t={t} />
      <Footer />
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
