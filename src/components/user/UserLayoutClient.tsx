"use client";

import { useState } from "react";
import { UserSidebar } from "./UserSidebar";
import { UserTopbar } from "./UserTopbar";
import { UserMobileNav } from "./UserMobileNav";
import { ThemeProvider } from "@/contexts/theme-context";
import { LanguageProvider } from "@/contexts/language-context";

export function UserLayoutClient({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ThemeProvider>
      <LanguageProvider>
        <div className="flex h-screen overflow-hidden bg-background">
          {/* Desktop Sidebar */}
          <UserSidebar className="hidden lg:flex" />

          {/* Mobile Sidebar Overlay */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Mobile Sidebar Drawer */}
          <UserSidebar
            className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 lg:hidden ${
              sidebarOpen ? "translate-x-0" : "-translate-x-full"
            }`}
            onClose={() => setSidebarOpen(false)}
          />

          <div className="flex-1 flex flex-col overflow-hidden">
            <UserTopbar onMenuClick={() => setSidebarOpen(true)} />
            <main className="flex-1 overflow-y-auto p-4 pb-20 md:p-6 lg:pb-6">
              {children}
            </main>
          </div>

          {/* Mobile Bottom Navigation */}
          <UserMobileNav />
        </div>
      </LanguageProvider>
    </ThemeProvider>
  );
}
