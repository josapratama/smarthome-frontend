"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, CheckCheck, Trash2 } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { toast } from "sonner";

interface Notification {
  id: string;
  type: "danger" | "warning" | "info";
  title: string;
  message: string;
  deviceName?: string;
  timestamp: Date;
  read: boolean;
}

export default function NotificationsPage() {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setIsLoading(true);
    try {
      // TODO: Fetch real notifications from API
      // Mock notifications for now
      const mockNotifications: Notification[] = [
        {
          id: "1",
          type: "danger",
          title: "Peringatan Suhu Tinggi",
          message: "Suhu ruang tamu melebihi 35°C",
          deviceName: "Sensor Suhu",
          timestamp: new Date(Date.now() - 5 * 60000),
          read: false,
        },
        {
          id: "2",
          type: "warning",
          title: "Konsumsi Daya Tinggi",
          message: "Penggunaan daya saat ini di atas normal",
          deviceName: "Meteran Daya",
          timestamp: new Date(Date.now() - 15 * 60000),
          read: false,
        },
        {
          id: "3",
          type: "info",
          title: "Perangkat Terhubung",
          message: "Perangkat baru berhasil dipasangkan",
          deviceName: "Lampu Pintar",
          timestamp: new Date(Date.now() - 60 * 60000),
          read: true,
        },
        {
          id: "4",
          type: "danger",
          title: "Gerakan Terdeteksi",
          message: "Gerakan tidak biasa terdeteksi di garasi",
          deviceName: "Sensor Gerak",
          timestamp: new Date(Date.now() - 2 * 60 * 60000),
          read: true,
        },
        {
          id: "5",
          type: "info",
          title: "Pembaruan Firmware Tersedia",
          message: "Versi firmware baru 2.1.0 tersedia",
          deviceName: "Thermostat Pintar",
          timestamp: new Date(Date.now() - 24 * 60 * 60000),
          read: true,
        },
      ];
      setNotifications(mockNotifications);
    } catch (error) {
      toast.error(t("failedLoadNotifications"));
    } finally {
      setIsLoading(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "danger":
        return "🔴";
      case "warning":
        return "🟡";
      default:
        return "🔵";
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "danger":
        return "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30";
      case "warning":
        return "border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950/30";
      default:
        return "border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30";
    }
  };

  const getTextColor = (type: string) => {
    switch (type) {
      case "danger":
        return "text-red-700 dark:text-red-300";
      case "warning":
        return "text-yellow-700 dark:text-yellow-300";
      default:
        return "text-blue-700 dark:text-blue-300";
    }
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return "Baru saja";
    if (minutes < 60) return `${minutes} menit lalu`;
    if (hours < 24) return `${hours} jam lalu`;
    return `${days} hari lalu`;
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
    toast.success(t("markAsRead"));
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success(t("markAllAsRead"));
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    toast.success(t("notificationDeleted"));
  };

  const filteredNotifications =
    filter === "unread" ? notifications.filter((n) => !n.read) : notifications;

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t("notifications")}</h1>
          <p className="text-muted-foreground mt-1">
            {t("manageNotifications")}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button onClick={markAllAsRead} variant="outline">
            <CheckCheck className="h-4 w-4 mr-2" />
            {t("markAllAsRead")}
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold">{notifications.length}</div>
              <div className="text-sm text-muted-foreground mt-1">
                {t("allNotifications")}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">
                {unreadCount}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {t("unreadNotifications")}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
        <TabsList>
          <TabsTrigger value="all">
            {t("allNotifications")} ({notifications.length})
          </TabsTrigger>
          <TabsTrigger value="unread">
            {t("unreadNotifications")} ({unreadCount})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="space-y-4 mt-6">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 rounded-lg" />
              ))}
            </div>
          ) : filteredNotifications.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="p-12 text-center">
                <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h2 className="text-xl font-semibold mb-2">
                  {t("noNotifications")}
                </h2>
                <p className="text-muted-foreground">
                  {filter === "unread"
                    ? "Semua notifikasi sudah dibaca!"
                    : "Notifikasi akan muncul di sini"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredNotifications.map((notification) => (
                <Card
                  key={notification.id}
                  className={`border-l-4 transition-all hover:shadow-md ${
                    !notification.read
                      ? getNotificationColor(notification.type)
                      : ""
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className="text-3xl flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <h3
                              className={`font-semibold ${getTextColor(notification.type)}`}
                            >
                              {notification.title}
                            </h3>
                            {!notification.read && (
                              <Badge variant="default" className="h-5">
                                Baru
                              </Badge>
                            )}
                          </div>
                          <div className="flex gap-1">
                            {!notification.read && (
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8"
                                onClick={() => markAsRead(notification.id)}
                              >
                                <CheckCheck className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-destructive"
                              onClick={() =>
                                deleteNotification(notification.id)
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm text-foreground mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          {notification.deviceName && (
                            <span className="flex items-center gap-1">
                              📱 {notification.deviceName}
                            </span>
                          )}
                          <span>{formatTimestamp(notification.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
