import { api } from "../client/axios";

export interface SensorReading {
  id: number;
  deviceId: number;
  channelId?: number;
  metric: string;
  valueNum?: number;
  valueBool?: boolean;
  valueJson?: any;
  unit?: string;
  source?: string;
  quality?: number;
  timestamp: string;
}

export interface TelemetryStats {
  metric: string;
  min: number;
  max: number;
  avg: number;
  count: number;
  unit?: string;
}

export const telemetryApi = {
  // Get latest telemetry for a device
  getLatest: async (deviceId: number): Promise<SensorReading[]> => {
    const { data } = await api.get<{ data: { readings: SensorReading[] } }>(
      `/v1/devices/${deviceId}/telemetry/latest`,
    );
    return data.data.readings;
  },

  // Get telemetry history
  getHistory: async (
    deviceId: number,
    options?: {
      from?: string;
      to?: string;
      metric?: string;
      limit?: number;
    },
  ): Promise<SensorReading[]> => {
    const params = new URLSearchParams();
    if (options?.from) params.append("from", options.from);
    if (options?.to) params.append("to", options.to);
    if (options?.metric) params.append("metric", options.metric);
    if (options?.limit) params.append("limit", options.limit.toString());

    const { data } = await api.get<{ data: { readings: SensorReading[] } }>(
      `/v1/devices/${deviceId}/telemetry?${params.toString()}`,
    );
    return data.data.readings;
  },

  // Get telemetry statistics
  getStats: async (
    deviceId: number,
    options?: {
      from?: string;
      to?: string;
      metrics?: string[];
    },
  ): Promise<TelemetryStats[]> => {
    const params = new URLSearchParams();
    if (options?.from) params.append("from", options.from);
    if (options?.to) params.append("to", options.to);
    if (options?.metrics) {
      options.metrics.forEach((m) => params.append("metrics", m));
    }

    const { data } = await api.get<{ data: { stats: TelemetryStats[] } }>(
      `/v1/devices/${deviceId}/telemetry/stats?${params.toString()}`,
    );
    return data.data.stats;
  },

  // Get available metrics for a device
  getMetrics: async (deviceId: number): Promise<string[]> => {
    const { data } = await api.get<{ data: { metrics: string[] } }>(
      `/v1/devices/${deviceId}/telemetry/metrics`,
    );
    return data.data.metrics;
  },

  // Export telemetry data
  export: async (
    deviceId: number,
    options?: {
      from?: string;
      to?: string;
      format?: "csv" | "json";
    },
  ): Promise<Blob> => {
    const params = new URLSearchParams();
    if (options?.from) params.append("from", options.from);
    if (options?.to) params.append("to", options.to);
    if (options?.format) params.append("format", options.format);

    const { data } = await api.get(
      `/v1/devices/${deviceId}/telemetry/export?${params.toString()}`,
      { responseType: "blob" },
    );
    return data;
  },
};
