import { apiClient } from "./base";

export interface Device {
  id: number;
  homeId: number;
  roomId?: number;
  deviceKey: string;
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

export const devicesApi = {
  list: async (homeId?: number) => {
    const params = homeId ? `?homeId=${homeId}` : "";
    const res = await apiClient.get<{ data: DeviceWithDetails[] }>(
      `/api/devices${params}`,
    );
    return res.data;
  },

  getById: async (deviceId: number) => {
    const res = await apiClient.get<{ data: DeviceWithDetails }>(
      `/api/devices/${deviceId}`,
    );
    return res.data;
  },

  update: async (
    deviceId: number,
    input: { name?: string; roomId?: number | null },
  ) => {
    const res = await apiClient.patch<{ data: Device }>(
      `/api/devices/${deviceId}`,
      input,
    );
    return res.data;
  },

  delete: async (deviceId: number) => {
    await apiClient.delete(`/api/devices/${deviceId}`);
  },
};
