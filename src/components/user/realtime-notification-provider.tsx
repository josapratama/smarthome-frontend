"use client";

import { useRealtimeNotifications } from "@/lib/hooks/use-realtime-notifications";

/**
 * Mounts the realtime notification WebSocket listener.
 * Place this inside the user layout so it's active for all user pages.
 */
export function RealtimeNotificationProvider() {
  useRealtimeNotifications();
  return null;
}
