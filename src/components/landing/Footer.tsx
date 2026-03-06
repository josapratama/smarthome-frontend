"use client";

import { Home } from "lucide-react";

interface FooterProps {
  t: (key: string) => string;
}

export function Footer({ t }: FooterProps) {
  return (
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
  );
}
