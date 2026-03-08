"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Bell, Menu, RefreshCw, Search, Filter, Plus } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getUnreadAlarmCount } from "@/lib/api/alarms";

interface UserTopbarProps {
  onMenuClick?: () => void;
}

export function UserTopbar({ onMenuClick }: UserTopbarProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadUnreadCount();

    // Refresh count every 30 seconds
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadUnreadCount = async () => {
    try {
      const count = await getUnreadAlarmCount();
      setUnreadCount(count);
    } catch (error) {
      console.error("Failed to load unread count:", error);
    }
  };

  const handleNotificationClick = () => {
    router.push("/user/notifications");
  };

  // Get page title, action buttons based on current route
  const getPageInfo = () => {
    if (pathname.includes("/dashboard"))
      return {
        title: t("welcomeBack") || "Welcome Back 👋",
        actions: ["notification"],
      };
    if (pathname.includes("/devices"))
      return {
        title: t("devices"),
        actions: ["search", "filter", "notification"],
      };
    if (pathname.includes("/homes"))
      return {
        title: t("homes"),
        actions: ["add", "notification"],
      };
    if (pathname.includes("/rooms"))
      return {
        title: t("rooms"),
        actions: ["add", "notification"],
      };
    if (pathname.includes("/energy"))
      return {
        title: t("energy"),
        actions: ["refresh", "filter", "notification"],
      };
    if (pathname.includes("/alarms"))
      return {
        title: t("alarms"),
        actions: ["refresh", "filter", "notification"],
      };
    if (pathname.includes("/messages"))
      return {
        title: t("messages"),
        actions: ["search", "notification"],
      };
    if (pathname.includes("/faq"))
      return {
        title: t("faq"),
        actions: ["search", "notification"],
      };
    if (pathname.includes("/chat"))
      return {
        title: t("chatAI") || "Chat AI",
        actions: ["add", "notification"],
      };
    if (pathname.includes("/notifications"))
      return {
        title: t("notifications"),
        actions: ["filter"],
      };
    if (pathname.includes("/app-info"))
      return {
        title: t("appInformation"),
        actions: ["notification"],
      };
    if (pathname.includes("/settings"))
      return {
        title: t("settings"),
        actions: ["notification"],
      };
    if (pathname.includes("/profile"))
      return {
        title: t("profile"),
        actions: ["notification"],
      };

    return { title: "Smart Home", actions: ["notification"] };
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
          {/* Action Buttons */}
          {pageInfo.actions.includes("search") && (
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-primary/10 transition-colors"
              onClick={() => {
                window.dispatchEvent(new CustomEvent("topbar-search"));
              }}
            >
              <Search className="h-5 w-5" />
            </Button>
          )}

          {pageInfo.actions.includes("filter") && (
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-primary/10 transition-colors"
              onClick={() => {
                window.dispatchEvent(new CustomEvent("topbar-filter"));
              }}
            >
              <Filter className="h-5 w-5" />
            </Button>
          )}

          {pageInfo.actions.includes("refresh") && (
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-primary/10 transition-colors"
              onClick={() => {
                window.dispatchEvent(new CustomEvent("topbar-refresh"));
              }}
            >
              <RefreshCw className="h-5 w-5" />
            </Button>
          )}

          {pageInfo.actions.includes("add") && (
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-primary/10 transition-colors"
              onClick={() => {
                window.dispatchEvent(new CustomEvent("topbar-add"));
              }}
            >
              <Plus className="h-5 w-5" />
            </Button>
          )}

          {/* Notifications */}
          {pageInfo.actions.includes("notification") && (
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
          )}
        </div>
      </div>
    </header>
  );
}
