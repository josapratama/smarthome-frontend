import { apiFetchBrowser } from "../client/fetch";

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
    const res = await apiFetchBrowser<{ data: Home[] }>("/api/v1/homes");
    return res.data;
  },

  getById: async (homeId: number) => {
    const res = await apiFetchBrowser<{ data: Home }>(
      `/api/v1/homes/${homeId}`,
    );
    return res.data;
  },

  create: async (input: CreateHomeInput) => {
    const res = await apiFetchBrowser<{ data: Home }>("/api/v1/homes", {
      method: "POST",
      body: JSON.stringify(input),
    });
    return res.data;
  },

  update: async (homeId: number, input: UpdateHomeInput) => {
    const res = await apiFetchBrowser<{ data: Home }>(
      `/api/v1/homes/${homeId}`,
      {
        method: "PATCH",
        body: JSON.stringify(input),
      },
    );
    return res.data;
  },

  delete: async (homeId: number) => {
    await apiFetchBrowser(`/api/v1/homes/${homeId}`, { method: "DELETE" });
  },

  getPendingInvites: async () => {
    const res = await apiFetchBrowser<{ data: any[] }>(
      "/api/v1/user/pending-invites",
    );
    return res.data;
  },
};

// Backward compatibility exports
export const getHomes = homesApi.list;
export const getHomeMembers = async (homeId: number) => {
  const res = await apiFetchBrowser<{ data: any[] }>(
    `/api/v1/homes/${homeId}/members`,
  );
  return res.data;
};
