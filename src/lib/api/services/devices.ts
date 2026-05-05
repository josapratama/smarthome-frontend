import { apiFetchBrowser } from "../client/fetch";

export interface Device {
  id: number;
  homeId: number;
  roomId?: number;
  deviceKey: string;
  // Backend menggunakan deviceName dan deviceType
  deviceName: string;
  deviceType: string;
  // Alias untuk kompatibilitas komponen yang pakai name/type
  name: string;
  type: string;
  status: "ONLINE" | "OFFLINE" | "ERROR";
  lastSeenAt?: string;
  firmwareVersion?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DeviceWithDetails extends Device {
  home?: {
    id: number;
    name: string;
  };
  room?: {
    id: number;
    name: string;
  };
}

// Normalize device response — map deviceName→name, deviceType→type
function normalizeDevice(d: any): DeviceWithDetails {
  return {
    ...d,
    name: d.name ?? d.deviceName ?? "",
    type: d.type ?? d.deviceType ?? "",
    deviceName: d.deviceName ?? d.name ?? "",
    deviceType: d.deviceType ?? d.type ?? "",
    status:
      d.status === true
        ? "ONLINE"
        : d.status === false
          ? "OFFLINE"
          : (d.status ?? "OFFLINE"),
  };
}

export const devicesApi = {
  list: async (homeId?: number) => {
    const url = homeId ? `/api/v1/devices?homeId=${homeId}` : "/api/v1/devices";
    const res = await apiFetchBrowser<{ data: any[] }>(url);
    return (res.data ?? []).map(normalizeDevice);
  },

  getById: async (deviceId: number) => {
    const res = await apiFetchBrowser<{ data: any }>(
      `/api/v1/devices/${deviceId}`,
    );
    return normalizeDevice(res.data);
  },

  update: async (
    deviceId: number,
    input: { name?: string; roomId?: number | null },
  ) => {
    const res = await apiFetchBrowser<{ data: any }>(
      `/api/v1/devices/${deviceId}`,
      {
        method: "PATCH",
        body: JSON.stringify({ deviceName: input.name, roomId: input.roomId }),
      },
    );
    return normalizeDevice(res.data);
  },

  delete: async (deviceId: number) => {
    await apiFetchBrowser(`/api/v1/devices/${deviceId}`, { method: "DELETE" });
  },
};
