"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Eye,
  Bell,
  AlertTriangle,
  Info,
  CheckCircle,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/language-context";

interface Notification {
  id: number;
  title: string;
  message: string;
  type: "INFO" | "WARNING" | "ERROR" | "SUCCESS";
  isRead: boolean;
  createdAt: string;
}

export default function GuestNotificationsPage() {
  const { t } = useLanguage();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.data || []);
      }
    } catch (error: any) {
      toast.error(error.message || t("failedLoadNotifications"));
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      const res = await fetch(`/api/notifications/${id}/read`, {
        method: "PATCH",
      });
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
        );
      }
    } catch (error: any) {
      toast.error(error.message || t("failedMarkAsRead"));
    }
  };

  const deleteNotification = async (id: number) => {
    try {
      const res = await fetch(`/api/notifications/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        toast.success(t("notificationDeleted"));
      }
    } catch (error: any) {
      toast.error(error.message || t("failedDeleteNotification"));
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "WARNING":
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case "ERROR":
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case "SUCCESS":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      default:
        return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "WARNING":
        return "border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950";
      case "ERROR":
        return "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950";
      case "SUCCESS":
        return "border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950";
      default:
        return "border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950";
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="space-y-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t("notifications")}</h1>
          <p className="text-muted-foreground mt-1">
            {t("viewYourNotifications")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Badge variant="destructive">
              {unreadCount} {t("unread")}
            </Badge>
          )}
          <Badge variant="outline" className="gap-1">
            <Eye className="h-3 w-3" />
            {t("readOnly")}
          </Badge>
        </div>
      </div>

      {/* Notifications List */}
      {notifications.length > 0 ? (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              className={`${getNotificationColor(notification.type)} ${
                !notification.isRead ? "border-2" : ""
              }`}
            >
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <div className="shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h3 className="font-semibold">{notification.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(notification.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {!notification.isRead && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => markAsRead(notification.id)}
                          >
                            {t("markAsRead")}
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteNotification(notification.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {t("noNotifications")}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t("noNotificationsDesc")}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
