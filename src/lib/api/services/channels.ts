import { apiFetchBrowser } from "../client/fetch";

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
    const data = await apiFetchBrowser<{ data: { channels: Channel[] } }>(
      `/api/v1/channels/device/${deviceId}`,
    );
    return data?.data?.channels ?? [];
  },

  // Get single channel
  get: async (deviceId: number, channelId: number): Promise<Channel> => {
    const data = await apiFetchBrowser<{ data: { channel: Channel } }>(
      `/api/v1/channels/${channelId}`,
    );
    return data.data.channel;
  },

  // Create channel
  create: async (
    deviceId: number,
    input: CreateChannelInput,
  ): Promise<Channel> => {
    const data = await apiFetchBrowser<{ data: { channel: Channel } }>(
      `/api/v1/channels`,
      {
        method: "POST",
        body: JSON.stringify({ ...input, deviceId }),
      },
    );
    return data.data.channel;
  },

  // Update channel
  update: async (
    deviceId: number,
    channelId: number,
    input: UpdateChannelInput,
  ): Promise<Channel> => {
    const data = await apiFetchBrowser<{ data: { channel: Channel } }>(
      `/api/v1/channels/${channelId}`,
      {
        method: "PATCH",
        body: JSON.stringify(input),
      },
    );
    return data.data.channel;
  },

  // Delete channel
  delete: async (deviceId: number, channelId: number): Promise<void> => {
    await apiFetchBrowser(`/api/v1/channels/${channelId}`, {
      method: "DELETE",
    });
  },

  // Control channel (set state/value)
  control: async (
    deviceId: number,
    channelId: number,
    state?: boolean,
    value?: number,
  ): Promise<Channel> => {
    await apiFetchBrowser(`/api/v1/channels/${channelId}/state`, {
      method: "POST",
      body: JSON.stringify({ state, value }),
    });
    // Fetch updated channel after state change
    return channelsApi.get(deviceId, channelId);
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
