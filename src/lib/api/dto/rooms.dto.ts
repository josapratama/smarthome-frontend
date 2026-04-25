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
  ownerId?: number | null;
  privacyLevel?: "PUBLIC" | "PRIVATE" | "SHARED" | "RESTRICTED";
  description?: string | null;
}

export interface RoomCreateRequest {
  name: string;
  homeId: number;
}
