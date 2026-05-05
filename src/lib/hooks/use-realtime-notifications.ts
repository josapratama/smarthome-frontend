"use client";

import { useEffect, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { io, Socket } from "socket.io-client";
import { toast } from "sonner";

type AlarmPayload = {
  id: number;
  homeId: number;
  deviceId: number;
  type: string;
  message: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  triggeredAt: string;
};

const SEVERITY_EMOJI: Record<string, string> = {
  CRITICAL: "🔴",
  HIGH: "🟠",
  MEDIUM: "🟡",
  LOW: "🔵",
};

/**
 * Request browser notification permission once.
 */
async function requestBrowserPermission(): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return false;
  }
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const result = await Notification.requestPermission();
  return result === "granted";
}

/**
 * Show a native browser notification.
 */
function showBrowserNotification(alarm: AlarmPayload) {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;

  const emoji = SEVERITY_EMOJI[alarm.severity] ?? "🔔";
  const title = `${emoji} ${alarm.type.replace(/_/g, " ")}`;
  const body = alarm.message;

  try {
    const notif = new Notification(title, {
      body,
      icon: "/favicon.ico",
      tag: `alarm-${alarm.id}`, // deduplicate same alarm
      requireInteraction:
        alarm.severity === "CRITICAL" || alarm.severity === "HIGH",
    });

    notif.onclick = () => {
      window.focus();
      notif.close();
    };
  } catch {
    // Notification API not available in this context
  }
}

/**
 * Show a Sonner toast for the alarm.
 */
function showToastNotification(alarm: AlarmPayload) {
  const emoji = SEVERITY_EMOJI[alarm.severity] ?? "🔔";
  const title = `${emoji} ${alarm.type.replace(/_/g, " ")}`;

  const toastFn =
    alarm.severity === "CRITICAL" || alarm.severity === "HIGH"
      ? toast.error
      : alarm.severity === "MEDIUM"
        ? toast.warning
        : toast.info;

  toastFn(title, {
    description: alarm.message,
    duration: alarm.severity === "CRITICAL" ? 10000 : 5000,
    action: {
      label: "View",
      onClick: () => {
        window.location.href = "/user/alerts";
      },
    },
  });
}

/**
 * useRealtimeNotifications
 *
 * Connects to the WebSocket server and listens for new alarm events.
 * When an alarm arrives:
 * - Shows a Sonner toast
 * - Shows a native browser notification (if permission granted)
 * - Invalidates React Query caches so the UI refreshes
 */
export function useRealtimeNotifications() {
  const queryClient = useQueryClient();
  const socketRef = useRef<Socket | null>(null);
  const permissionRequestedRef = useRef(false);

  const handleNewAlarm = useCallback(
    (alarm: AlarmPayload) => {
      // Refresh notification/alarm lists
      queryClient.invalidateQueries({ queryKey: ["alarms"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["alarm-stats"] });
      // Update badge count di topbar
      queryClient.invalidateQueries({ queryKey: ["unread-alarm-count"] });

      // Show toast
      showToastNotification(alarm);

      // Show browser notification
      showBrowserNotification(alarm);
    },
    [queryClient],
  );

  useEffect(() => {
    // Request browser notification permission once
    if (!permissionRequestedRef.current) {
      permissionRequestedRef.current = true;
      requestBrowserPermission();
    }

    const wsUrl =
      process.env.NEXT_PUBLIC_WS_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:3000";

    const socket = io(wsUrl, {
      transports: ["websocket", "polling"],
      autoConnect: false, // Don't auto-connect — backend has no Socket.IO
      reconnection: false,
    });

    // Only connect if WS URL is explicitly configured
    if (process.env.NEXT_PUBLIC_WS_URL) {
      socket.connect();
    }

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("[RealtimeNotif] WebSocket connected");
    });

    socket.on("disconnect", () => {
      console.log("[RealtimeNotif] WebSocket disconnected");
    });

    socket.on("alarm:new", handleNewAlarm);

    // Also listen for generic notification events
    socket.on("notification:new", (data: { alarm?: AlarmPayload }) => {
      if (data.alarm) handleNewAlarm(data.alarm);
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    });

    return () => {
      socket.off("alarm:new", handleNewAlarm);
      socket.off("notification:new");
      socket.disconnect();
    };
  }, [handleNewAlarm, queryClient]);

  return null;
}
