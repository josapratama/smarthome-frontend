"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { MobileNav } from "./mobile-nav";
import { ChatWidget } from "@/components/admin/chat/chat-widget";
import { ThemeProvider } from "@/contexts/theme-context";
import { LanguageProvider } from "@/contexts/language-context";
import { AdminProfileProvider } from "@/contexts/admin-profile-context";
import { TokenInitializer } from "@/components/auth/token-initializer";

export function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ThemeProvider>
      <LanguageProvider>
        <AdminProfileProvider>
          <TokenInitializer />
          <div className="h-screen bg-background overflow-hidden">
            <div className="flex h-full">
              {/* Desktop Sidebar */}
              <Sidebar className="hidden lg:flex" />

              {/* Mobile Sidebar Overlay */}
              {sidebarOpen && (
                <div
                  className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                  onClick={() => setSidebarOpen(false)}
                />
              )}

              {/* Mobile Sidebar Drawer */}
              <Sidebar
                className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 lg:hidden ${
                  sidebarOpen ? "translate-x-0" : "-translate-x-full"
                }`}
                onClose={() => setSidebarOpen(false)}
              />

              <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
                <Topbar onMenuClick={() => setSidebarOpen(true)} />
                <main className="flex-1 overflow-y-auto p-4 pb-20 md:p-6 lg:pb-6">
                  {children}
                </main>
              </div>
            </div>

            {/* Mobile Bottom Navigation */}
            <MobileNav />

            {/* Chat Widget */}
            <ChatWidget />
          </div>
        </AdminProfileProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
