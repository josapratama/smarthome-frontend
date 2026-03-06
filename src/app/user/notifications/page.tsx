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
import {
  listHomeAlarms,
  acknowledgeAlarm,
  resolveAlarm,
} from "@/lib/api/alarms";
import { homesApi } from "@/lib/api/client/homes";
import type { AlarmDTO } from "@/lib/api/dto/alarm.dto";
import { formatDistanceToNow } from "date-fns";

export default function NotificationsPage() {
  const { t } = useTranslation();
  const [alarms, setAlarms] = useState<AlarmDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setIsLoading(true);
    try {
      // Get all homes first
      const homes = await homesApi.list();

      if (homes.length === 0) {
        setAlarms([]);
        return;
      }

      // Get alarms from all homes
      const alarmsPromises = homes.map((home) =>
        listHomeAlarms(home.id, { limit: 50 })
          .then((response) => response.data)
          .catch(() => []),
      );

      const alarmsArrays = await Promise.all(alarmsPromises);
      const allAlarms = alarmsArrays.flat();

      // Sort by triggeredAt descending
      allAlarms.sort(
        (a, b) =>
          new Date(b.triggeredAt).getTime() - new Date(a.triggeredAt).getTime(),
      );

      setAlarms(allAlarms);
    } catch (error: any) {
      toast.error(
        error.message ||
          t("failedLoadNotifications") ||
          "Failed to load notifications",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getNotificationIcon = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
      case "HIGH":
        return "🔴";
      case "MEDIUM":
        return "🟡";
      default:
        return "🔵";
    }
  };

  const getNotificationColor = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
      case "HIGH":
        return "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30";
      case "MEDIUM":
        return "border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950/30";
      default:
        return "border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30";
    }
  };

  const getTextColor = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
      case "HIGH":
        return "text-red-700 dark:text-red-300";
      case "MEDIUM":
        return "text-yellow-700 dark:text-yellow-300";
      default:
        return "text-blue-700 dark:text-blue-300";
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return (
          <Badge variant="destructive">{t("critical") || "Critical"}</Badge>
        );
      case "HIGH":
        return <Badge variant="destructive">{t("high") || "High"}</Badge>;
      case "MEDIUM":
        return (
          <Badge className="bg-yellow-600">{t("medium") || "Medium"}</Badge>
        );
      default:
        return <Badge variant="secondary">{t("low") || "Low"}</Badge>;
    }
  };

  const markAsRead = async (alarm: AlarmDTO) => {
    try {
      await acknowledgeAlarm(alarm.homeId, alarm.id);
      toast.success(t("markedAsRead") || "Marked as read");
      loadNotifications();
    } catch (error: any) {
      toast.error(
        error.message || t("failedToMarkAsRead") || "Failed to mark as read",
      );
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadAlarms = alarms.filter((a) => a.status === "OPEN");
      await Promise.all(
        unreadAlarms.map((alarm) => acknowledgeAlarm(alarm.homeId, alarm.id)),
      );
      toast.success(t("allMarkedAsRead") || "All marked as read");
      loadNotifications();
    } catch (error: any) {
      toast.error(
        error.message ||
          t("failedToMarkAllAsRead") ||
          "Failed to mark all as read",
      );
    }
  };

  const deleteNotification = async (alarm: AlarmDTO) => {
    try {
      await resolveAlarm(alarm.homeId, alarm.id);
      toast.success(t("notificationDeleted") || "Notification deleted");
      loadNotifications();
    } catch (error: any) {
      toast.error(
        error.message ||
          t("failedToDeleteNotification") ||
          "Failed to delete notification",
      );
    }
  };

  const filteredAlarms =
    filter === "unread" ? alarms.filter((a) => a.status === "OPEN") : alarms;

  const unreadCount = alarms.filter((a) => a.status === "OPEN").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {t("notifications") || "Notifications"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t("manageNotifications") || "Manage your notifications and alerts"}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button onClick={markAllAsRead} variant="outline">
            <CheckCheck className="h-4 w-4 mr-2" />
            {t("markAllAsRead") || "Mark All as Read"}
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold">{alarms.length}</div>
              <div className="text-sm text-muted-foreground mt-1">
                {t("allNotifications") || "All Notifications"}
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
                {t("unreadNotifications") || "Unread"}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
        <TabsList>
          <TabsTrigger value="all">
            {t("all") || "All"} ({alarms.length})
          </TabsTrigger>
          <TabsTrigger value="unread">
            {t("unread") || "Unread"} ({unreadCount})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="space-y-4 mt-6">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 rounded-lg" />
              ))}
            </div>
          ) : filteredAlarms.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="p-12 text-center">
                <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h2 className="text-xl font-semibold mb-2">
                  {t("noNotifications") || "No Notifications"}
                </h2>
                <p className="text-muted-foreground">
                  {filter === "unread"
                    ? t("allNotificationsRead") ||
                      "All notifications have been read!"
                    : t("notificationsWillAppear") ||
                      "Notifications will appear here"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredAlarms.map((alarm) => (
                <Card
                  key={alarm.id}
                  className={`border-l-4 transition-all hover:shadow-md ${
                    alarm.status === "OPEN"
                      ? getNotificationColor(alarm.severity)
                      : ""
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className="text-3xl flex-shrink-0">
                        {getNotificationIcon(alarm.severity)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3
                              className={`font-semibold ${getTextColor(alarm.severity)}`}
                            >
                              {alarm.type}
                            </h3>
                            {getSeverityBadge(alarm.severity)}
                            {alarm.status === "OPEN" && (
                              <Badge variant="default" className="h-5">
                                {t("new") || "New"}
                              </Badge>
                            )}
                          </div>
                          <div className="flex gap-1">
                            {alarm.status === "OPEN" && (
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8"
                                onClick={() => markAsRead(alarm)}
                              >
                                <CheckCheck className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-destructive"
                              onClick={() => deleteNotification(alarm)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm text-foreground mb-2">
                          {alarm.message}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            📱 {t("device") || "Device"} #{alarm.deviceId}
                          </span>
                          <span className="flex items-center gap-1">
                            🏠 {t("home") || "Home"} #{alarm.homeId}
                          </span>
                          <span>
                            {formatDistanceToNow(new Date(alarm.triggeredAt), {
                              addSuffix: true,
                            })}
                          </span>
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
