"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

interface CTASectionProps {
  t: (key: string) => string;
}

export function CTASection({ t }: CTASectionProps) {
  return (
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
  );
}
