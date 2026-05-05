export interface RegisterHome {
  id: number;
  name: string;
}

export interface RegisterRoom {
  id: number;
  name: string;
  homeId: number;
}

export interface CreatedDevice {
  id: number;
  deviceName: string;
  deviceType: string;
  deviceKey: string;
  capabilities?: { mac?: string };
}

/** Format raw input into AA:BB:CC:DD:EE:FF */
export function formatMAC(value: string): string {
  const cleaned = value.replace(/[^0-9A-Fa-f]/g, "");
  const formatted = cleaned.match(/.{1,2}/g)?.join(":") ?? cleaned;
  return formatted.toUpperCase().substring(0, 17);
}

export const MAC_REGEX = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
