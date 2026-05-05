/**
 * Device DTOs
 */

export interface DeviceDTO {
  id: number;
  deviceName: string;
  deviceType: string;
  status: boolean;
  homeId: number;
  roomId?: number | null;
  mqttClientId?: string | null;
  deviceKey?: string | null;
  lastSeenAt?: string | null;
  pairedByUserId: number;
  pairedAt?: string | null;
  unpairedAt?: string | null;
  deletedAt?: string | null;
  capabilities?: any;
  updatedAt: string;
  createdAt?: string;
}

export interface DeviceCreateRequest {
  deviceName: string;
  deviceType: string;
  homeId: number;
  roomId?: number;
  macAddress?: string;
}

export interface DeviceUpdateRequest {
  deviceName?: string;
  roomId?: number;
}
