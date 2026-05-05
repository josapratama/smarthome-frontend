export interface DeviceConfigDTO {
  id: number;
  deviceId: number;
  config: Record<string, any>;
  updatedBy: number | null;
  updatedAt: string;
  createdAt: string;
}

export interface UpsertDeviceConfigRequest {
  config: Record<string, any>;
}
