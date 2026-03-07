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

  // Get page title based on current route
  const getPageInfo = () => {
    if (pathname.includes("/dashboard"))
      return { title: t("dashboard"), subtitle: t("overview") };
    if (pathname.includes("/devices"))
      return { title: t("devices"), subtitle: t("manageDevices") };
    if (pathname.includes("/homes"))
      return { title: t("homes"), subtitle: t("manageHomes") };
    if (pathname.includes("/rooms"))
      return { title: t("rooms"), subtitle: t("manageRooms") };
    if (pathname.includes("/users"))
      return { title: t("users"), subtitle: t("manageUsers") };
    if (pathname.includes("/firmware"))
      return { title: t("firmware"), subtitle: t("manageFirmware") };
    if (pathname.includes("/ota"))
      return { title: t("ota"), subtitle: t("manageOta") };
    if (pathname.includes("/monitoring"))
      return { title: t("monitoring"), subtitle: t("realTimeMonitoring") };
    if (pathname.includes("/alarms"))
      return { title: t("alarms"), subtitle: t("monitorSecurityAlarms") };
    if (pathname.includes("/energy"))
      return { title: t("energy"), subtitle: t("energyAnalytics") };
    if (pathname.includes("/ai"))
      return { title: t("aiAutomation"), subtitle: t("intelligentAutomation") };
    if (pathname.includes("/commands"))
      return { title: t("commands"), subtitle: t("manageCommands") };
    if (pathname.includes("/invites"))
      return { title: t("invites"), subtitle: t("manageInvites") };
    if (pathname.includes("/notifications"))
      return { title: t("notifications"), subtitle: t("manageNotifications") };
    if (pathname.includes("/app-info"))
      return { title: t("appInformation"), subtitle: t("manageAppInfo") };
    if (pathname.includes("/help"))
      return { title: t("helpCenter"), subtitle: t("faq") };
    if (pathname.includes("/settings"))
      return { title: t("settings"), subtitle: t("preferences") };

    return { title: "Admin Panel", subtitle: t("dashboard") };
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

          {/* Page Title - Breadcrumb Style */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">
              Admin
            </span>
            <span className="text-muted-foreground">/</span>
            <h1 className="text-base md:text-lg font-semibold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
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
