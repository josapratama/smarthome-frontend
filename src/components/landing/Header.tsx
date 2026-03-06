"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, Moon, Sun, Globe, Menu, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  theme: string;
  language: string;
  toggleTheme: () => void;
  setLanguage: (lang: "id" | "en") => void;
  t: (key: string) => string;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export function Header({
  theme,
  language,
  toggleTheme,
  setLanguage,
  t,
  mobileMenuOpen,
  setMobileMenuOpen,
}: HeaderProps) {
  return (
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
          {/* Public Data Links */}
          <Link href="/public/homes">
            <Button variant="ghost" size="sm">
              {t("publicHomes")}
            </Button>
          </Link>
          <Link href="/public/devices">
            <Button variant="ghost" size="sm">
              {t("publicDevices")}
            </Button>
          </Link>

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
          {/* Public Data Links */}
          <Link
            href="/public/homes"
            className="block"
            onClick={() => setMobileMenuOpen(false)}
          >
            <Button
              variant="outline"
              className="w-full h-9 xs:h-10 text-sm xs:text-base"
            >
              {t("publicHomes")}
            </Button>
          </Link>
          <Link
            href="/public/devices"
            className="block"
            onClick={() => setMobileMenuOpen(false)}
          >
            <Button
              variant="outline"
              className="w-full h-9 xs:h-10 text-sm xs:text-base"
            >
              {t("publicDevices")}
            </Button>
          </Link>

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
  );
}
