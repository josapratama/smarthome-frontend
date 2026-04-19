import { api } from "../client/axios";

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
    const res = await fetch(`/api/proxy/channels/device/${deviceId}`, {
      credentials: "include",
    });
    const data = await res.json();
    return data?.data?.channels ?? [];
  },

  // Get single channel
  get: async (deviceId: number, channelId: number): Promise<Channel> => {
    const res = await fetch(`/api/proxy/channels/${channelId}`, {
      credentials: "include",
    });
    const data = await res.json();
    return data.data.channel;
  },

  // Create channel
  create: async (
    deviceId: number,
    input: CreateChannelInput,
  ): Promise<Channel> => {
    const res = await fetch(`/api/proxy/channels`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...input, deviceId }),
    });
    const data = await res.json();
    return data.data.channel;
  },

  // Update channel
  update: async (
    deviceId: number,
    channelId: number,
    input: UpdateChannelInput,
  ): Promise<Channel> => {
    const res = await fetch(`/api/proxy/channels/${channelId}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const data = await res.json();
    return data.data.channel;
  },

  // Delete channel
  delete: async (deviceId: number, channelId: number): Promise<void> => {
    await fetch(`/api/proxy/channels/${channelId}`, {
      method: "DELETE",
      credentials: "include",
    });
  },

  // Control channel (set state/value)
  control: async (
    deviceId: number,
    channelId: number,
    state?: boolean,
    value?: number,
  ): Promise<Channel> => {
    const res = await fetch(`/api/proxy/channels/${channelId}/state`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ state, value }),
    });
    const data = await res.json();
    return data.data.channel;
  },
};

// Backward compatibility aliases — UI calls these with (deviceId, ...) pattern
export const getDeviceChannels = (deviceId: number) =>
  channelsApi.list(deviceId);
export const createChannel = (
  input: import("@/lib/api/dto/channel.dto").CreateChannelDTO,
) => channelsApi.create(input.deviceId, input as any);
export const updateChannel = (
  channelId: number,
  input: import("@/lib/api/dto/channel.dto").UpdateChannelDTO,
) => channelsApi.update(0, channelId, input as any);
export const deleteChannel = (channelId: number) =>
  channelsApi.delete(0, channelId);
export const setChannelState = (
  channelId: number,
  data: { state?: boolean; value?: number },
) => channelsApi.control(0, channelId, data.state, data.value);
