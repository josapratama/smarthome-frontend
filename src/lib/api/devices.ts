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
    const { data } = await api.get<PaginatedResponse<Device>>(
      "/api/v1/devices",
      {
        params: filters,
      },
    );
    return data;
  },

  async getDevice(id: number): Promise<Device> {
    const { data } = await api.get<Device>(`/api/v1/devices/${id}`);
    return data;
  },

  async updateDevice(id: number, updates: Partial<Device>): Promise<Device> {
    const { data } = await api.patch<Device>(`/api/v1/devices/${id}`, updates);
    return data;
  },

  async deleteDevice(id: number): Promise<void> {
    await api.delete(`/api/v1/devices/${id}`);
  },

  async getDeviceTelemetry(
    deviceId: number,
    limit = 100,
  ): Promise<SensorData[]> {
    const { data } = await api.get<SensorData[]>(
      `/api/v1/devices/${deviceId}/telemetry`,
      { params: { limit } },
    );
    return data;
  },

  async sendCommand(
    deviceId: number,
    type: string,
    payload: Record<string, unknown>,
  ): Promise<Command> {
    const { data } = await api.post<Command>(
      `/api/v1/devices/${deviceId}/command`,
      {
        type,
        payload,
      },
    );
    return data;
  },

  async getCommandStatus(commandId: number): Promise<Command> {
    const { data } = await api.get<Command>(`/api/v1/commands/${commandId}`);
    return data;
  },

  async getDeviceCommands(deviceId: number): Promise<Command[]> {
    const { data } = await api.get<Command[]>(
      `/api/v1/devices/${deviceId}/commands`,
    );
    return data;
  },
};
