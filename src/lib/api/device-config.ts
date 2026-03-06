import { apiFetchBrowser } from "./client.browser";
import type {
  DeviceConfigDTO,
  UpsertDeviceConfigRequest,
} from "./dto/device-config.dto";

export async function getDeviceConfig(deviceId: number) {
  return apiFetchBrowser<{ data: DeviceConfigDTO }>(
    `/api/v1/devices/${deviceId}/config`,
  );
}

export async function upsertDeviceConfig(
  deviceId: number,
  data: UpsertDeviceConfigRequest,
) {
  return apiFetchBrowser<{ data: DeviceConfigDTO }>(
    `/api/v1/devices/${deviceId}/config`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    },
  );
}
