"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslation } from "@/hooks/use-translation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  listHomeAlarms,
  acknowledgeAlarm,
  resolveAlarm,
} from "@/lib/api/services/alarms";
import { homesApi } from "@/lib/api/services/homes";
import type { AlarmDTO } from "@/lib/api/dto/alarm.dto";

export function useNotifications() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [alarms, setAlarms] = useState<AlarmDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const loadNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const homes = await homesApi.list();

      if (homes.length === 0) {
        setAlarms([]);
        return;
      }

      const alarmsPromises = homes.map((home) =>
        listHomeAlarms(home.id, { limit: 50 })
          .then((response) => response.data)
          .catch(() => []),
      );

      const alarmsArrays = await Promise.all(alarmsPromises);
      const allAlarms = alarmsArrays.flat();

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
  }, [t]);

  // Invalidate badge count di topbar
  const invalidateBadge = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["unread-alarm-count"] });
  }, [queryClient]);

  const markAsRead = async (alarm: AlarmDTO) => {
    try {
      await acknowledgeAlarm(alarm.homeId, alarm.id);
      toast.success(t("markedAsRead") || "Marked as read");
      loadNotifications();
      invalidateBadge();
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
      invalidateBadge();
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
      invalidateBadge();
    } catch (error: any) {
      toast.error(
        error.message ||
          t("failedToDeleteNotification") ||
          "Failed to delete notification",
      );
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  useEffect(() => {
    const handleFilter = () => {
      const filterSection = document.querySelector("[data-filter-section]");
      if (filterSection) {
        filterSection.scrollIntoView({ behavior: "smooth", block: "center" });
        filterSection.classList.add("ring-2", "ring-primary", "ring-offset-2");
        setTimeout(() => {
          filterSection.classList.remove(
            "ring-2",
            "ring-primary",
            "ring-offset-2",
          );
        }, 2000);
      }
    };

    window.addEventListener("topbar-filter", handleFilter);

    return () => {
      window.removeEventListener("topbar-filter", handleFilter);
    };
  }, []);

  const filteredAlarms =
    filter === "unread" ? alarms.filter((a) => a.status === "OPEN") : alarms;

  const unreadCount = alarms.filter((a) => a.status === "OPEN").length;

  return {
    alarms,
    filteredAlarms,
    isLoading,
    filter,
    setFilter,
    unreadCount,
    loadNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };
}
