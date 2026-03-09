import { api } from "../client/axios";

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
    const res = await api.get<{ data: Home[] }>("/v1/homes");
    return res.data.data;
  },

  getById: async (homeId: number) => {
    const res = await api.get<{ data: Home }>(`/v1/homes/${homeId}`);
    return res.data.data;
  },

  create: async (input: CreateHomeInput) => {
    const res = await api.post<{ data: Home }>("/v1/homes", input);
    return res.data.data;
  },

  update: async (homeId: number, input: UpdateHomeInput) => {
    const res = await api.patch<{ data: Home }>(`/v1/homes/${homeId}`, input);
    return res.data.data;
  },

  delete: async (homeId: number) => {
    await api.delete(`/v1/homes/${homeId}`);
  },
};
