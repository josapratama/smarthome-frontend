import { api } from "../client/axios";
import type { Room } from "../types";

export const roomsApi = {
  async getRooms(homeId: number): Promise<Room[]> {
    const { data } = await api.get<Room[]>(`/v1/homes/${homeId}/rooms`);
    return data;
  },

  async getRoom(id: number): Promise<Room> {
    const { data } = await api.get<Room>(`/v1/rooms/${id}`);
    return data;
  },

  async createRoom(homeId: number, name: string): Promise<Room> {
    const { data } = await api.post<Room>(`/v1/homes/${homeId}/rooms`, {
      name,
    });
    return data;
  },

  async updateRoom(id: number, name: string): Promise<Room> {
    const { data } = await api.patch<Room>(`/v1/rooms/${id}`, { name });
    return data;
  },

  async deleteRoom(id: number): Promise<void> {
    await api.delete(`/v1/rooms/${id}`);
  },
};
