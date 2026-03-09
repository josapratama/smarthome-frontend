import { api, apiClient } from "../client/axios";

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
    const res = await api.get<{ data: DeviceWithDetails[] }>(
      `/v1/devices${params}`,
    );
    return res.data.data;
  },

  getById: async (deviceId: number) => {
    const res = await api.get<{ data: DeviceWithDetails }>(
      `/v1/devices/${deviceId}`,
    );
    return res.data.data;
  },

  update: async (
    deviceId: number,
    input: { name?: string; roomId?: number | null },
  ) => {
    const res = await api.patch<{ data: Device }>(
      `/v1/devices/${deviceId}`,
      input,
    );
    return res.data.data;
  },

  delete: async (deviceId: number) => {
    await api.delete(`/v1/devices/${deviceId}`);
  },
};
