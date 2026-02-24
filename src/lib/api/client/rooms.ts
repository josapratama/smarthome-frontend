import { api } from "../client";

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
    const res = await api.get<{ data: Room[] }>(`/api/homes/${homeId}/rooms`);
    return res.data;
  },

  getById: async (roomId: number) => {
    const res = await api.get<{ data: Room }>(`/api/rooms/${roomId}`);
    return res.data;
  },

  create: async (homeId: number, input: CreateRoomInput) => {
    const res = await api.post<{ data: Room }>(
      `/api/homes/${homeId}/rooms`,
      input,
    );
    return res.data;
  },

  update: async (roomId: number, input: UpdateRoomInput) => {
    const res = await api.patch<{ data: Room }>(`/api/rooms/${roomId}`, input);
    return res.data;
  },

  delete: async (roomId: number) => {
    await api.delete(`/api/rooms/${roomId}`);
  },
};
