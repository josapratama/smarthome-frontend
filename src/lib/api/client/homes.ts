import { api } from "../client";

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
    const res = await api.get<{ data: { homes: Home[] } }>("/homes");
    return res.data.data.homes;
  },

  getById: async (homeId: number) => {
    const res = await api.get<{ data: { home: Home } }>(`/homes/${homeId}`);
    return res.data.data.home;
  },

  create: async (input: CreateHomeInput) => {
    const res = await api.post<{ data: { home: Home } }>("/homes", input);
    return res.data.data.home;
  },

  update: async (homeId: number, input: UpdateHomeInput) => {
    const res = await api.patch<{ data: { home: Home } }>(
      `/homes/${homeId}`,
      input,
    );
    return res.data.data.home;
  },

  delete: async (homeId: number) => {
    await api.delete(`/homes/${homeId}`);
  },
};
