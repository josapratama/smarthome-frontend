import { apiFetchBrowser } from "../client/fetch";

// Shape yang dikembalikan backend (SensorDataDTO)
export interface SensorReading {
  id: number;
  deviceId: number;
  // PZEM / power meter fields
  current?: number | null;
  powerW?: number | null;
  energyKwh?: number | null;
  voltageV?: number | null;
  currentA?: number | null;
  frequencyHz?: number | null;
  powerFactor?: number | null;
  // Gas / flame sensor fields
  gasPpm?: number | null;
  flame?: boolean | null;
  // Bin level
  binLevel?: number | null;
  // Distance
  distanceCm?: number | null;
  timestamp: string;
  // Generic metric/value for chart compatibility
  metric?: string;
  valueNum?: number | null;
  unit?: string;
}

export interface TelemetryStats {
  metric: string;
  min: number;
  max: number;
  avg: number;
  count: number;
  unit?: string;
}

// Metric fields yang ada di SensorDataDTO beserta unit-nya
const METRIC_FIELDS: {
  key: keyof SensorReading;
  label: string;
  unit: string;
}[] = [
  { key: "powerW", label: "power", unit: "W" },
  { key: "voltageV", label: "voltage", unit: "V" },
  { key: "currentA", label: "current", unit: "A" },
  { key: "energyKwh", label: "energy", unit: "kWh" },
  { key: "frequencyHz", label: "frequency", unit: "Hz" },
  { key: "powerFactor", label: "power_factor", unit: "" },
  { key: "gasPpm", label: "gas_ppm", unit: "ppm" },
  { key: "distanceCm", label: "distance", unit: "cm" },
  { key: "binLevel", label: "bin_level", unit: "%" },
];

/**
 * Flatten SensorDataDTO rows menjadi array SensorReading per metric,
 * sehingga chart bisa render per metric.
 */
function flattenToReadings(rows: SensorReading[]): SensorReading[] {
  const result: SensorReading[] = [];
  for (const row of rows) {
    for (const { key, label, unit } of METRIC_FIELDS) {
      const val = row[key];
      if (val !== null && val !== undefined) {
        result.push({
          ...row,
          metric: label,
          valueNum: val as number,
          unit,
        });
      }
    }
    // flame sebagai boolean → convert ke 0/1
    if (row.flame !== null && row.flame !== undefined) {
      result.push({
        ...row,
        metric: "flame",
        valueNum: row.flame ? 1 : 0,
        unit: "",
      });
    }
  }
  return result;
}

/**
 * Hitung stats dari readings yang sudah di-flatten.
 */
function computeStats(
  readings: SensorReading[],
  metrics: string[],
): TelemetryStats[] {
  const grouped: Record<string, number[]> = {};
  const units: Record<string, string> = {};

  for (const r of readings) {
    if (!r.metric || r.valueNum === null || r.valueNum === undefined) continue;
    if (metrics.length > 0 && !metrics.includes(r.metric)) continue;
    if (!grouped[r.metric]) grouped[r.metric] = [];
    grouped[r.metric].push(r.valueNum);
    if (r.unit) units[r.metric] = r.unit;
  }

  return Object.entries(grouped).map(([metric, values]) => ({
    metric,
    min: Math.min(...values),
    max: Math.max(...values),
    avg: values.reduce((a, b) => a + b, 0) / values.length,
    count: values.length,
    unit: units[metric],
  }));
}

export const telemetryApi = {
  // GET /api/v1/devices/{deviceId}/telemetry/latest
  getLatest: async (deviceId: number): Promise<SensorReading[]> => {
    const res = await apiFetchBrowser<{ data: SensorReading | null }>(
      `/api/v1/devices/${deviceId}/telemetry/latest`,
    );
    if (!res.data) return [];
    return flattenToReadings([res.data]);
  },

  // GET /api/v1/devices/{deviceId}/telemetry
  getHistory: async (
    deviceId: number,
    options?: { from?: string; to?: string; metric?: string; limit?: number },
  ): Promise<SensorReading[]> => {
    const params = new URLSearchParams();
    if (options?.from) params.append("from", options.from);
    if (options?.to) params.append("to", options.to);
    if (options?.limit) params.append("limit", options.limit.toString());

    const res = await apiFetchBrowser<{ data: SensorReading[] }>(
      `/api/v1/devices/${deviceId}/telemetry?${params.toString()}`,
    );

    const rows = Array.isArray(res.data) ? res.data : [];
    const flattened = flattenToReadings(rows);

    // Filter by metric jika diminta
    if (options?.metric && options.metric !== "all") {
      return flattened.filter((r) => r.metric === options.metric);
    }
    return flattened;
  },

  // Dihitung client-side dari data history
  getStats: async (
    deviceId: number,
    options?: { from?: string; to?: string; metrics?: string[] },
  ): Promise<TelemetryStats[]> => {
    const params = new URLSearchParams();
    if (options?.from) params.append("from", options.from);
    if (options?.to) params.append("to", options.to);

    const res = await apiFetchBrowser<{ data: SensorReading[] }>(
      `/api/v1/devices/${deviceId}/telemetry?${params.toString()}`,
    );

    const rows = Array.isArray(res.data) ? res.data : [];
    const flattened = flattenToReadings(rows);
    return computeStats(flattened, options?.metrics ?? []);
  },

  // Dihitung client-side dari data latest
  getMetrics: async (deviceId: number): Promise<string[]> => {
    const res = await apiFetchBrowser<{ data: SensorReading | null }>(
      `/api/v1/devices/${deviceId}/telemetry/latest`,
    );
    if (!res.data) return [];
    const flattened = flattenToReadings([res.data]);
    const metrics = [
      ...new Set(flattened.map((r) => r.metric!).filter(Boolean)),
    ];
    return metrics;
  },

  // Export — masih pakai fetch langsung untuk blob
  export: async (
    deviceId: number,
    options?: { from?: string; to?: string; format?: "csv" | "json" },
  ): Promise<Blob> => {
    const params = new URLSearchParams();
    if (options?.from) params.append("from", options.from);
    if (options?.to) params.append("to", options.to);
    if (options?.format) params.append("format", options.format);
    const res = await fetch(
      `/api/proxy/devices/${deviceId}/telemetry/export?${params.toString()}`,
      { credentials: "include" },
    );
    return res.blob();
  },
};
