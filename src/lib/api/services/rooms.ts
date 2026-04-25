import { api } from "../client/axios";
import type { RoomDTO } from "../dto/rooms.dto";

export type Room = RoomDTO;
export type { RoomDTO };

export const roomsApi = {
  async getRooms(homeId: number): Promise<RoomDTO[]> {
    const { data } = await api.get<RoomDTO[]>(`/v1/homes/${homeId}/rooms`);
    return data;
  },

  async getRoom(id: number): Promise<RoomDTO> {
    const { data } = await api.get<RoomDTO>(`/v1/rooms/${id}`);
    return data;
  },

  async createRoom(homeId: number, name: string): Promise<RoomDTO> {
    const { data } = await api.post<RoomDTO>(`/v1/homes/${homeId}/rooms`, {
      name,
    });
    return data;
  },

  async updateRoom(id: number, name: string): Promise<RoomDTO> {
    const { data } = await api.patch<RoomDTO>(`/v1/rooms/${id}`, { name });
    return data;
  },

  async deleteRoom(id: number): Promise<void> {
    await api.delete(`/v1/rooms/${id}`);
  },
};
