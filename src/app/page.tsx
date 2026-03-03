"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Home,
  Shield,
  Zap,
  Lock,
  Activity,
  Cpu,
  Moon,
  Sun,
  Globe,
  Menu,
  X,
} from "lucide-react";
import {
  PublicSettingsProvider,
  usePublicSettings,
} from "@/contexts/public-settings-context";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function LandingPageContent() {
  const { theme, language, toggleTheme, setLanguage, t } = usePublicSettings();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const features = [
    {
      icon: Shield,
      title: t("securePrivate"),
      description: t("secureDesc"),
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      icon: Zap,
      title: t("realTimeControl"),
      description: t("realTimeDesc"),
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
    },
    {
      icon: Lock,
      title: t("roleBasedAccess"),
      description: t("roleBasedDesc"),
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      icon: Activity,
      title: t("automation"),
      description: t("automationDesc"),
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      icon: Zap,
      title: t("energyMonitoring"),
      description: t("energyMonitoringDesc"),
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
    {
      icon: Cpu,
      title: t("multiDevice"),
      description: t("multiDeviceDesc"),
      color: "text-pink-500",
      bgColor: "bg-pink-500/10",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header/Navbar */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-3 xs:px-4 h-14 sm:h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-1.5 xs:gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="h-7 w-7 xs:h-8 xs:w-8 sm:h-10 sm:w-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Home className="h-3.5 w-3.5 xs:h-4 xs:w-4 sm:h-6 sm:w-6 text-white" />
            </div>
            <span className="text-base xs:text-lg sm:text-xl font-bold">
              {t("smartHome")}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2 lg:gap-4">
            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Globe className="h-4 w-4 lg:h-5 lg:w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setLanguage("id")}>
                  <span className={language === "id" ? "font-bold" : ""}>
                    🇮🇩 Bahasa Indonesia
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage("en")}>
                  <span className={language === "en" ? "font-bold" : ""}>
                    🇬🇧 English
                  </span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-9 w-9"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4 lg:h-5 lg:w-5" />
              ) : (
                <Moon className="h-4 w-4 lg:h-5 lg:w-5" />
              )}
            </Button>

            <Link href="/login">
              <Button variant="ghost" size="sm">
                {t("login")}
              </Button>
            </Link>
            <Link href="/register">
              <Button
                size="sm"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {t("signUp")}
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-8 w-8 xs:h-9 xs:w-9"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-4.5 w-4.5 xs:h-5 xs:w-5" />
            ) : (
              <Menu className="h-4.5 w-4.5 xs:h-5 xs:w-5" />
            )}
          </Button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-background p-3 xs:p-4 space-y-2.5 xs:space-y-3">
            <div className="flex items-center justify-between pb-2.5 xs:pb-3 border-b">
              <span className="text-xs xs:text-sm font-medium">
                {language === "id" ? "Bahasa" : "Language"}
              </span>
              <div className="flex gap-1.5 xs:gap-2">
                <Button
                  variant={language === "id" ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setLanguage("id");
                    setMobileMenuOpen(false);
                  }}
                  className="h-7 xs:h-8 text-xs xs:text-sm px-2 xs:px-3"
                >
                  🇮🇩
                </Button>
                <Button
                  variant={language === "en" ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setLanguage("en");
                    setMobileMenuOpen(false);
                  }}
                  className="h-7 xs:h-8 text-xs xs:text-sm px-2 xs:px-3"
                >
                  🇬🇧
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between pb-2.5 xs:pb-3 border-b">
              <span className="text-xs xs:text-sm font-medium">Theme</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  toggleTheme();
                  setMobileMenuOpen(false);
                }}
                className="h-7 xs:h-8 text-xs xs:text-sm"
              >
                {theme === "dark" ? (
                  <Sun className="h-3.5 w-3.5 xs:h-4 xs:w-4 mr-1.5 xs:mr-2" />
                ) : (
                  <Moon className="h-3.5 w-3.5 xs:h-4 xs:w-4 mr-1.5 xs:mr-2" />
                )}
                {theme === "dark" ? "Light" : "Dark"}
              </Button>
            </div>
            <Link
              href="/login"
              className="block"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Button
                variant="outline"
                className="w-full h-9 xs:h-10 text-sm xs:text-base"
              >
                {t("login")}
              </Button>
            </Link>
            <Link
              href="/register"
              className="block"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Button className="w-full h-9 xs:h-10 bg-gradient-to-r from-blue-600 to-purple-600 text-sm xs:text-base">
                {t("signUp")}
              </Button>
            </Link>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-3 xs:px-4 py-8 xs:py-12 sm:py-16 md:py-24 lg:py-32">
        <div className="max-w-4xl mx-auto text-center space-y-4 xs:space-y-6 md:space-y-8">
          <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent leading-tight px-2 xs:px-4">
            {t("tagline")}
          </h1>
          <p className="text-sm xs:text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-2 xs:px-4 leading-relaxed">
            {t("description")}
          </p>
          <div className="flex flex-col sm:flex-row gap-2.5 xs:gap-3 sm:gap-4 justify-center px-2 xs:px-4 pt-2">
            <Link href="/register" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-sm xs:text-base md:text-lg px-5 xs:px-6 md:px-8 h-10 xs:h-11 md:h-12 font-medium"
              >
                {t("getStarted")}
              </Button>
            </Link>
            <Link href="#features" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto text-sm xs:text-base md:text-lg px-5 xs:px-6 md:px-8 h-10 xs:h-11 md:h-12 font-medium"
              >
                {t("learnMore")}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="container mx-auto px-3 xs:px-4 py-8 xs:py-12 sm:py-16 md:py-20 bg-muted/30"
      >
        <div className="max-w-6xl mx-auto">
          <h2 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-6 xs:mb-8 md:mb-12 px-2 xs:px-4">
            {t("features")}
          </h2>
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3 xs:gap-4 md:gap-6 lg:gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="p-3.5 xs:p-4 sm:p-5 md:p-6 rounded-xl border bg-card hover:shadow-lg transition-all duration-200"
                >
                  <div
                    className={`h-9 w-9 xs:h-10 xs:w-10 sm:h-11 sm:w-11 md:h-12 md:w-12 rounded-lg ${feature.bgColor} flex items-center justify-center mb-2.5 xs:mb-3 md:mb-4`}
                  >
                    <Icon
                      className={`h-4.5 w-4.5 xs:h-5 xs:w-5 sm:h-5.5 sm:w-5.5 md:h-6 md:w-6 ${feature.color}`}
                    />
                  </div>
                  <h3 className="text-sm xs:text-base sm:text-lg md:text-xl font-semibold mb-1.5 xs:mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-xs xs:text-sm md:text-base text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-3 xs:px-4 py-8 xs:py-12 sm:py-16 md:py-20">
        <div className="max-w-4xl mx-auto text-center space-y-4 xs:space-y-6 md:space-y-8 p-5 xs:p-6 sm:p-8 md:p-12 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600">
          <h2 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl font-bold text-white px-2 xs:px-4">
            {t("readyToStart")}
          </h2>
          <p className="text-sm xs:text-base sm:text-lg md:text-xl text-white/90 px-2 xs:px-4 leading-relaxed">
            {t("readyDesc")}
          </p>
          <Link href="/register">
            <Button
              size="lg"
              variant="secondary"
              className="text-sm xs:text-base md:text-lg px-5 xs:px-6 md:px-8 h-10 xs:h-11 md:h-12 font-medium"
            >
              {t("signUp")}
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30">
        <div className="container mx-auto px-3 xs:px-4 py-5 xs:py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 xs:gap-4">
            <div className="flex items-center gap-1.5 xs:gap-2">
              <div className="h-6 w-6 xs:h-7 xs:w-7 sm:h-8 sm:w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Home className="h-3 w-3 xs:h-4 xs:w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <span className="font-semibold text-xs xs:text-sm sm:text-base">
                {t("smartHome")}
              </span>
            </div>
            <p className="text-[10px] xs:text-xs sm:text-sm text-muted-foreground text-center">
              © 2024 {t("smartHome")}. {t("allRightsReserved")}.
            </p>
          </div>
        </div>
      </footer>
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
