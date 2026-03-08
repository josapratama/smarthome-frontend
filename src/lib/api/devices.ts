import { api } from "./client";
import type {
  Device,
  DeviceFilters,
  PaginatedResponse,
  SensorData,
  Command,
  CommandStatus,
} from "../types";

export const devicesApi = {
  async getDevices(
    filters?: DeviceFilters,
  ): Promise<PaginatedResponse<Device>> {
    const { data } = await api.get<PaginatedResponse<Device>>("/v1/devices", {
      params: filters,
    });
    return data;
  },

  async getDevice(id: number): Promise<Device> {
    const { data } = await api.get<Device>(`/v1/devices/${id}`);
    return data;
  },

  async updateDevice(id: number, updates: Partial<Device>): Promise<Device> {
    const { data } = await api.patch<Device>(`/v1/devices/${id}`, updates);
    return data;
  },

  async deleteDevice(id: number): Promise<void> {
    await api.delete(`/v1/devices/${id}`);
  },

  async getDeviceTelemetry(
    deviceId: number,
    limit = 100,
  ): Promise<SensorData[]> {
    const { data } = await api.get<SensorData[]>(
      `/v1/devices/${deviceId}/telemetry`,
      { params: { limit } },
    );
    return data;
  },

  async getLatestTelemetry(deviceId: number): Promise<SensorData | null> {
    const { data } = await api.get<{ data: SensorData | null }>(
      `/v1/devices/${deviceId}/telemetry/latest`,
    );
    return data.data;
  },

  async sendCommand(
    deviceId: number,
    type: string,
    payload: Record<string, unknown>,
  ): Promise<Command> {
    const { data } = await api.post<Command>(
      `/v1/devices/${deviceId}/command`,
      {
        type,
        payload,
      },
    );
    return data;
  },

  async getCommandStatus(commandId: number): Promise<Command> {
    const { data } = await api.get<Command>(`/v1/commands/${commandId}`);
    return data;
  },

  async getDeviceCommands(deviceId: number): Promise<Command[]> {
    const { data } = await api.get<Command[]>(
      `/v1/devices/${deviceId}/commands`,
    );
    return data;
  },

  async getAllLatestTelemetry(
    homeId?: number,
  ): Promise<Record<number, SensorData>> {
    try {
      const devicesResponse = await this.getDevices(
        homeId ? { homeId } : undefined,
      );
      const devices = devicesResponse.data || [];

      const telemetryPromises = devices.map(async (device) => {
        try {
          const telemetry = await this.getLatestTelemetry(device.id);
          return { deviceId: device.id, telemetry };
        } catch {
          return { deviceId: device.id, telemetry: null };
        }
      });

      const results = await Promise.all(telemetryPromises);
      const telemetryMap: Record<number, SensorData> = {};

      results.forEach(({ deviceId, telemetry }) => {
        if (telemetry) {
          telemetryMap[deviceId] = telemetry;
        }
      });

      return telemetryMap;
    } catch (error) {
      console.error("Failed to get all latest telemetry:", error);
      return {};
    }
  },
};
