import { apiFetchBrowser } from "../client/fetch";
import type { RoomDTO } from "../dto/rooms.dto";

export type Room = RoomDTO;
export type { RoomDTO };

export const roomsApi = {
  async getRooms(homeId: number): Promise<RoomDTO[]> {
    const res = await apiFetchBrowser<{ data: RoomDTO[] }>(
      `/api/v1/homes/${homeId}/rooms`,
    );
    return res.data;
  },

  async getRoom(id: number): Promise<RoomDTO> {
    const res = await apiFetchBrowser<{ data: RoomDTO }>(`/api/v1/rooms/${id}`);
    return res.data;
  },

  async createRoom(homeId: number, name: string): Promise<RoomDTO> {
    const res = await apiFetchBrowser<{ data: RoomDTO }>(
      `/api/v1/homes/${homeId}/rooms`,
      {
        method: "POST",
        body: JSON.stringify({ name }),
      },
    );
    return res.data;
  },

  async updateRoom(id: number, name: string): Promise<RoomDTO> {
    const res = await apiFetchBrowser<{ data: RoomDTO }>(
      `/api/v1/rooms/${id}`,
      {
        method: "PATCH",
        body: JSON.stringify({ name }),
      },
    );
    return res.data;
  },

  async deleteRoom(id: number): Promise<void> {
    await apiFetchBrowser(`/api/v1/rooms/${id}`, { method: "DELETE" });
  },
};
