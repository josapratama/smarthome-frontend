import { apiClient } from "./base";

export interface Room {
  homeId: number;
  id: number;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoomInput {
  name: string;
  description?: string;
}

export interface UpdateRoomInput {
  name?: string;
  description?: string;
}

export const roomsApi = {
  listByHome: async (homeId: number) => {
    const res = await apiClient.get<{ data: Room[] }>(
      `/api/homes/${homeId}/rooms`,
    );
    return res.data;
  },

  getById: async (roomId: number) => {
    const res = await apiClient.get<{ data: Room }>(`/api/rooms/${roomId}`);
    return res.data;
  },

  create: async (homeId: number, input: CreateRoomInput) => {
    const res = await apiClient.post<{ data: Room }>(
      `/api/homes/${homeId}/rooms`,
      input,
    );
    return res.data;
  },

  update: async (roomId: number, input: UpdateRoomInput) => {
    const res = await apiClient.patch<{ data: Room }>(
      `/api/rooms/${roomId}`,
      input,
    );
    return res.data;
  },

  delete: async (roomId: number) => {
    await apiClient.delete(`/api/rooms/${roomId}`);
  },
};
