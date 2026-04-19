"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "@/hooks/use-translation";
import { NotificationStats } from "./notification-stats";

export function NotificationsView() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    // Simulate loading — replace with real API call when available
    const timer = setTimeout(() => {
      setLoading(false);
      setNotifications([]);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <NotificationStats total={notifications.length} unread={0} />

      <Card className="rounded-xl sm:rounded-2xl shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base sm:text-lg">
              {t("recentNotifications")}
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLoading(true)}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              {t("refresh")}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Bell className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-sm sm:text-base text-muted-foreground">
              {t("noNotifications")}
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground mt-2">
              {t("notificationsWillAppear")}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
