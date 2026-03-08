import { api } from "./client";

export interface DeviceConfig {
  id: number;
  deviceId: number;
  config: any;
  updatedBy?: number;
  updatedAt: string;
  createdAt: string;
}

export const deviceConfigApi = {
  // Get device configuration
  get: async (deviceId: number): Promise<DeviceConfig | null> => {
    try {
      const { data } = await api.get<{ data: { config: DeviceConfig } }>(
        `/v1/devices/${deviceId}/config`,
      );
      return data.data.config;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  // Update device configuration
  update: async (deviceId: number, config: any): Promise<DeviceConfig> => {
    const { data } = await api.put<{ data: { config: DeviceConfig } }>(
      `/v1/devices/${deviceId}/config`,
      { config },
    );
    return data.data.config;
  },

  // Delete device configuration
  delete: async (deviceId: number): Promise<void> => {
    await api.delete(`/v1/devices/${deviceId}/config`);
  },

  // Get config schema/template for device type
  getTemplate: async (deviceType: string): Promise<any> => {
    const { data } = await api.get<{ data: { template: any } }>(
      `/v1/device-config/template/${deviceType}`,
    );
    return data.data.template;
  },
};
