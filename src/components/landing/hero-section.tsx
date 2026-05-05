"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

interface HeroSectionProps {
  t: (key: string) => string;
}

export function HeroSection({ t }: HeroSectionProps) {
  return (
    <section className="container mx-auto px-3 xs:px-4 py-8 xs:py-12 sm:py-16 md:py-24 lg:py-32">
      <div className="max-w-4xl mx-auto text-center space-y-4 xs:space-y-6 md:space-y-8">
        <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent leading-tight px-2 xs:px-4">
          {t("tagline")}
        </h1>
        <p className="text-sm xs:text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-2 xs:px-4 leading-relaxed">
          {t("landingDescription")}
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
  );
}
