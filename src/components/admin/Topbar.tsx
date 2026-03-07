"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Bell, Menu } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface TopbarProps {
  onMenuClick?: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // TODO: Fetch real notification count from API
    setUnreadCount(0);
  }, []);

  const handleNotificationClick = () => {
    router.push("/notifications");
  };

  // Listen for custom title change events from pages
  const [customTitle, setCustomTitle] = useState<string | null>(null);

  useEffect(() => {
    const handleTitleChange = (event: CustomEvent<string>) => {
      setCustomTitle(event.detail);
    };

    window.addEventListener(
      "topbar-title-change",
      handleTitleChange as EventListener,
    );
    return () => {
      window.removeEventListener(
        "topbar-title-change",
        handleTitleChange as EventListener,
      );
    };
  }, []);

  // Get page title based on current route
  const getPageInfo = () => {
    // If custom title is set, use it
    if (customTitle) {
      return { title: customTitle };
    }

    if (pathname.includes("/dashboard"))
      return {
        title: t("welcomeBack") || "Welcome Back 👋",
      };

    // Combined pages
    if (pathname.includes("/location-management"))
      return {
        title: t("locationManagement") || "Location Management",
      };
    if (pathname.includes("/communications"))
      return {
        title: t("communications") || "Communications",
      };
    if (pathname.includes("/device-management"))
      return {
        title: t("deviceManagement") || "Device Management",
      };
    if (pathname.includes("/energy"))
      return {
        title: t("energyManagement") || "Energy Management",
      };
    if (pathname.includes("/firmware"))
      return {
        title: t("firmwareManagement") || "Firmware Management",
      };
    if (pathname.includes("/system-tools"))
      return {
        title: t("systemTools") || "System Tools",
      };
    if (pathname.includes("/settings-help"))
      return {
        title: t("settingsHelp") || "Settings & Help",
      };

    // Other pages
    if (pathname.includes("/alarms"))
      return {
        title: t("alarms"),
      };
    if (pathname.includes("/ai"))
      return {
        title: t("aiAutomation"),
      };
    if (pathname.includes("/notifications"))
      return {
        title: t("notifications"),
      };
    if (pathname.includes("/profile"))
      return {
        title: t("profile"),
      };

    return { title: "Admin Panel" };
  };

  const pageInfo = getPageInfo();

  return (
    <header className="bg-card border-b border-border px-4 py-3 md:px-6 md:py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Page Title */}
          <div>
            <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              {pageInfo.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="relative hover:bg-primary/10 transition-colors"
            onClick={handleNotificationClick}
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs animate-pulse"
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </Badge>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
