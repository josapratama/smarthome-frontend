import { apiFetchBrowser } from "../client/fetch";

export interface DeviceConfig {
  id: number;
  deviceId: number;
  config: any;
  updatedBy?: number;
  updatedAt: string;
  createdAt: string;
}

export const deviceConfigApi = {
  get: async (
    deviceId: number,
  ): Promise<{ data: { config: DeviceConfig } } | null> => {
    try {
      return await apiFetchBrowser<{ data: { config: DeviceConfig } }>(
        `/api/v1/devices/${deviceId}/config`,
      );
    } catch (error: any) {
      if (error.status === 404) return null;
      throw error;
    }
  },

  update: async (
    deviceId: number,
    body: { config: any },
  ): Promise<{ data: { config: DeviceConfig } }> => {
    return apiFetchBrowser<{ data: { config: DeviceConfig } }>(
      `/api/v1/devices/${deviceId}/config`,
      {
        method: "PUT",
        body: JSON.stringify(body),
      },
    );
  },

  delete: async (deviceId: number): Promise<void> => {
    await apiFetchBrowser(`/api/v1/devices/${deviceId}/config`, {
      method: "DELETE",
    });
  },
};

export const getDeviceConfig = deviceConfigApi.get;
export const upsertDeviceConfig = deviceConfigApi.update;
