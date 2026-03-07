"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Bell, Menu } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface GuestTopbarProps {
  onMenuClick?: () => void;
}

export function GuestTopbar({ onMenuClick }: GuestTopbarProps) {
  const { t } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);
  const [username, setUsername] = useState("");

  useEffect(() => {
    loadUserInfo();
  }, []);

  const loadUserInfo = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUsername(data.data?.username || "Guest");
      }
    } catch (error) {
      console.error("Failed to load user info:", error);
    }
  };

  const handleNotificationClick = () => {
    router.push("/guest/notifications");
  };

  // Get page title based on current route
  const getPageInfo = () => {
    if (pathname.includes("/dashboard"))
      return { title: t("dashboard"), subtitle: t("guestDashboardDesc") };
    if (pathname.includes("/devices"))
      return { title: t("devices"), subtitle: t("viewDeviceStatus") };
    if (pathname.includes("/homes"))
      return { title: t("homes"), subtitle: t("homesYouCanView") };
    if (pathname.includes("/invitations"))
      return { title: t("invitations"), subtitle: t("pendingInvitations") };
    if (pathname.includes("/notifications"))
      return { title: t("notifications"), subtitle: t("allNotifications") };
    if (pathname.includes("/settings"))
      return { title: t("settings"), subtitle: t("preferences") };
    if (pathname.includes("/profile"))
      return { title: t("profile"), subtitle: t("accountInformation") };

    return { title: "Guest Panel", subtitle: t("viewOnly") };
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
              Guest
            </span>
            <span className="text-muted-foreground">/</span>
            <h1 className="text-base md:text-lg font-semibold bg-gradient-to-r from-purple-600 via-purple-500 to-purple-400 bg-clip-text text-transparent">
              {pageInfo.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Username (mobile) */}
          <span className="text-sm font-medium md:hidden">{username}</span>

          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="relative hover:bg-purple-500/10 transition-colors"
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
