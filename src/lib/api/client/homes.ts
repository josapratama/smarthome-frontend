import { apiClient } from "./base";

export interface Home {
  id: number;
  name: string;
  ownerUserId: number;
  addressText?: string;
  city?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateHomeInput {
  name: string;
  ownerUserId: number;
  addressText?: string;
  city?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
}

export interface UpdateHomeInput {
  name?: string;
  addressText?: string;
  city?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
}

export const homesApi = {
  list: async () => {
    const res = await apiClient.get<{ data: { homes: Home[] } }>("/api/homes");
    return res.data.homes;
  },

  getById: async (homeId: number) => {
    const res = await apiClient.get<{ data: { home: Home } }>(
      `/api/homes/${homeId}`,
    );
    return res.data.home;
  },

  create: async (input: CreateHomeInput) => {
    const res = await apiClient.post<{ data: { home: Home } }>(
      "/api/homes",
      input,
    );
    return res.data.home;
  },

  update: async (homeId: number, input: UpdateHomeInput) => {
    const res = await apiClient.patch<{ data: { home: Home } }>(
      `/api/homes/${homeId}`,
      input,
    );
    return res.data.home;
  },

  delete: async (homeId: number) => {
    await apiClient.delete(`/api/homes/${homeId}`);
  },
};
