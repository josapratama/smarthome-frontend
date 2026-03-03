"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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

          {/* Logo/Brand */}
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center">
              <span className="text-white font-bold text-sm">SH</span>
            </div>
            <div className="hidden md:block">
              <h2 className="text-base font-bold leading-none">Smart Home</h2>
              <p className="text-xs text-muted-foreground">{t("guestPanel")}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Username (mobile) */}
          <span className="text-sm font-medium md:hidden">{username}</span>

          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={handleNotificationClick}
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
              >
                {unreadCount}
              </Badge>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
