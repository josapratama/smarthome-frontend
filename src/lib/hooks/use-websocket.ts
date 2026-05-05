import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { io, Socket } from "socket.io-client";
import type {
  DeviceStatusEvent,
  TelemetryEvent,
  AlarmEvent as AlarmEventType,
} from "../types";

export function useWebSocket() {
  const queryClient = useQueryClient();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3000", {
      transports: ["websocket"],
      autoConnect: false, // Don't auto-connect — backend has no Socket.IO
    });

    // Only connect if WS URL is explicitly configured
    if (process.env.NEXT_PUBLIC_WS_URL) {
      socket.connect();
    }

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("WebSocket connected");
    });

    socket.on("disconnect", () => {
      console.log("WebSocket disconnected");
    });

    socket.on("device:status", (data: DeviceStatusEvent) => {
      queryClient.invalidateQueries({ queryKey: ["device", data.deviceId] });
      queryClient.invalidateQueries({ queryKey: ["devices"] });
    });

    socket.on("telemetry:update", (data: TelemetryEvent) => {
      queryClient.setQueryData(
        ["device", data.deviceId, "telemetry"],
        (old: TelemetryEvent["data"][] | undefined) => {
          if (!old) return [data.data];
          return [data.data, ...old.slice(0, 99)];
        },
      );
    });

    socket.on("alarm:new", (data: AlarmEventType) => {
      queryClient.invalidateQueries({ queryKey: ["alarms"] });
      queryClient.invalidateQueries({ queryKey: ["alarms", "stats"] });
    });

    return () => {
      socket.disconnect();
    };
  }, [queryClient]);

  return socketRef.current;
}
