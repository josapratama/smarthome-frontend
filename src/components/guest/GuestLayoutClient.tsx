"use client";

import { useState } from "react";
import { GuestSidebar } from "./GuestSidebar";
import { GuestTopbar } from "./GuestTopbar";
import { GuestMobileNav } from "./GuestMobileNav";
import { ThemeProvider } from "@/contexts/theme-context";
import { LanguageProvider } from "@/contexts/language-context";

export function GuestLayoutClient({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ThemeProvider>
      <LanguageProvider>
        <div className="min-h-screen bg-background">
          <div className="flex h-screen overflow-hidden">
            {/* Desktop Sidebar */}
            <GuestSidebar className="hidden lg:flex" />

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
              <div
                className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                onClick={() => setSidebarOpen(false)}
              />
            )}

            {/* Mobile Sidebar Drawer */}
            <GuestSidebar
              className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 lg:hidden ${
                sidebarOpen ? "translate-x-0" : "-translate-x-full"
              }`}
              onClose={() => setSidebarOpen(false)}
            />

            <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
              <GuestTopbar onMenuClick={() => setSidebarOpen(true)} />
              <main className="flex-1 overflow-y-auto p-4 pb-20 md:p-6 lg:pb-6">
                {children}
              </main>
            </div>
          </div>

          {/* Mobile Bottom Navigation */}
          <GuestMobileNav />
        </div>
      </LanguageProvider>
    </ThemeProvider>
  );
}
