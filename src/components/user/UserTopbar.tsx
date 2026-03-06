"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Menu } from "lucide-react";
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
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <span className="text-white font-bold text-sm">SH</span>
            </div>
            <div className="hidden md:block">
              <h2 className="text-base font-bold leading-none">Smart Home</h2>
              <p className="text-xs text-muted-foreground">Pusat Kontrol</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
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
