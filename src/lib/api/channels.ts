import { apiClient } from "./client";
import type {
  ChannelDTO,
  CreateChannelDTO,
  UpdateChannelDTO,
  ChannelStateDTO,
  ChannelStateHistoryDTO,
} from "./dto/channel.dto";

export async function getDeviceChannels(
  deviceId: number,
): Promise<ChannelDTO[]> {
  const res = await apiClient.get(`/v1/channels/device/${deviceId}`);
  return res.data;
}

export async function getChannel(channelId: number): Promise<ChannelDTO> {
  const res = await apiClient.get(`/v1/channels/${channelId}`);
  return res.data;
}

export async function createChannel(
  data: CreateChannelDTO,
): Promise<ChannelDTO> {
  const res = await apiClient.post("/v1/channels", data);
  return res.data;
}

export async function updateChannel(
  channelId: number,
  data: UpdateChannelDTO,
): Promise<ChannelDTO> {
  const res = await apiClient.patch(`/v1/channels/${channelId}`, data);
  return res.data;
}

export async function deleteChannel(channelId: number): Promise<void> {
  await apiClient.delete(`/v1/channels/${channelId}`);
}

export async function setChannelState(
  channelId: number,
  data: ChannelStateDTO,
): Promise<void> {
  await apiClient.post(`/v1/channels/${channelId}/state`, data);
}

export async function getChannelHistory(
  channelId: number,
  limit?: number,
): Promise<ChannelStateHistoryDTO[]> {
  const params = limit ? { limit: limit.toString() } : {};
  const res = await apiClient.get(`/v1/channels/${channelId}/history`, {
    params,
  });
  return res.data;
}
