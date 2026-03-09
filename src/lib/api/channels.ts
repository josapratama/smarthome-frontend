import { api } from "./client";

export type ChannelType =
  | "RELAY"
  | "SENSOR"
  | "DIMMER"
  | "SERVO"
  | "RGB_LED"
  | "ANALOG_IN"
  | "DIGITAL_IN";

export interface Channel {
  id: number;
  deviceId: number;
  channelNum: number;
  name: string;
  type: ChannelType;
  pinNumber?: number;
  pinMode?: string;
  state: boolean;
  value?: number;
  sensorType?: string;
  unit?: string;
  minValue?: number;
  maxValue?: number;
  isEnabled: boolean;
  lastUpdated?: string;
}

export interface CreateChannelInput {
  channelNum: number;
  name: string;
  type: ChannelType;
  pinNumber?: number;
  pinMode?: string;
  sensorType?: string;
  unit?: string;
  minValue?: number;
  maxValue?: number;
}

export interface UpdateChannelInput {
  name?: string;
  state?: boolean;
  value?: number;
  isEnabled?: boolean;
}

export const channelsApi = {
  // Get all channels for a device
  list: async (deviceId: number): Promise<Channel[]> => {
    const { data } = await api.get<{ data: { channels: Channel[] } }>(
      `/v1/devices/${deviceId}/channels`,
    );
    return data.data.channels;
  },

  // Get single channel
  get: async (deviceId: number, channelId: number): Promise<Channel> => {
    const { data } = await api.get<{ data: { channel: Channel } }>(
      `/v1/devices/${deviceId}/channels/${channelId}`,
    );
    return data.data.channel;
  },

  // Create channel
  create: async (
    deviceId: number,
    input: CreateChannelInput,
  ): Promise<Channel> => {
    const { data } = await api.post<{ data: { channel: Channel } }>(
      `/v1/devices/${deviceId}/channels`,
      input,
    );
    return data.data.channel;
  },

  // Update channel
  update: async (
    deviceId: number,
    channelId: number,
    input: UpdateChannelInput,
  ): Promise<Channel> => {
    const { data } = await api.put<{ data: { channel: Channel } }>(
      `/v1/devices/${deviceId}/channels/${channelId}`,
      input,
    );
    return data.data.channel;
  },

  // Delete channel
  delete: async (deviceId: number, channelId: number): Promise<void> => {
    await api.delete(`/v1/devices/${deviceId}/channels/${channelId}`);
  },

  // Control channel (set state/value)
  control: async (
    deviceId: number,
    channelId: number,
    state?: boolean,
    value?: number,
  ): Promise<Channel> => {
    const { data } = await api.post<{ data: { channel: Channel } }>(
      `/v1/devices/${deviceId}/channels/${channelId}/control`,
      { state, value },
    );
    return data.data.channel;
  },
};

// Backward compatibility aliases
export const getDeviceChannels = channelsApi.list;
export const createChannel = channelsApi.create;
export const updateChannel = channelsApi.update;
export const deleteChannel = channelsApi.delete;
export const setChannelState = channelsApi.control;
