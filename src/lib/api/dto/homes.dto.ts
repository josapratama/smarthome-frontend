/**
 * Home DTOs
 */

export interface HomeDTO {
  id: number;
  name: string;
  ownerUserId: number;
  addressText: string | null;
  city: string | null;
  postalCode: string | null;
  latitude: number | null;
  longitude: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface HomesListResponse {
  data: HomeDTO[];
  nextCursor?: number | null;
}

export interface HomeCreateRequest {
  name: string;
  ownerUserId: number;
  addressText?: string;
  city?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
}

export interface HomeUpdateRequest {
  name?: string;
  ownerUserId?: number;
  addressText?: string;
  city?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
}
