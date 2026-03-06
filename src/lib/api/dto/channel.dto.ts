export type ChannelType =
  | "RELAY"
  | "DIMMER"
  | "LED"
  | "SENSOR"
  | "SWITCH"
  | "FAN"
  | "MOTOR"
  | "SERVO"
  | "RGB_LED"
  | "ANALOG_IN"
  | "DIGITAL_IN"
  | "OTHER";

export interface ChannelDTO {
  id: number;
  deviceId: number;
  channelNum: number;
  name: string;
  type: ChannelType;
  pinNumber: number | null;
  pinMode: string | null;
  state: boolean;
  value: number | null;
  sensorType: string | null;
  unit: string | null;
  colorR: number | null;
  colorG: number | null;
  colorB: number | null;
  isEnabled: boolean;
  config: Record<string, unknown> | null;
  icon: string | null;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateChannelDTO {
  deviceId: number;
  channelNum: number;
  name: string;
  type: ChannelType;
  pinNumber?: number | null;
  pinMode?: string | null;
  sensorType?: string | null;
  unit?: string | null;
  icon?: string | null;
  order?: number;
  config?: Record<string, unknown> | null;
}

export interface UpdateChannelDTO {
  name?: string;
  pinNumber?: number | null;
  pinMode?: string | null;
  sensorType?: string | null;
  unit?: string | null;
  icon?: string | null;
  order?: number;
  isEnabled?: boolean;
  config?: Record<string, unknown> | null;
}

export interface ChannelStateDTO {
  state?: boolean;
  value?: number;
  colorR?: number;
  colorG?: number;
  colorB?: number;
}

export interface ChannelStateHistoryDTO {
  id: number;
  channelId: number;
  state: boolean;
  value: number | null;
  timestamp: string;
}
