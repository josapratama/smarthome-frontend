/**
 * Room DTOs
 */

export interface RoomDTO {
  id: number;
  name: string;
  homeId: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface RoomCreateRequest {
  name: string;
  homeId: number;
}
