import { apiFetchBrowser } from "./client.browser";

export interface Home {
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

export interface HomeMember {
  id: number;
  homeId: number;
  userId: number;
  roleInHome: string;
  status: string;
  user: {
    id: number;
    username: string;
    email: string;
    avatarUrl: string | null;
  };
}

export async function getHomes(): Promise<Home[]> {
  const response = await apiFetchBrowser<{ data: { homes: Home[] } }>(
    "/api/v1/homes",
  );
  return response.data.homes;
}

export async function getHomeMembers(homeId: number): Promise<HomeMember[]> {
  const response = await apiFetchBrowser<{ data: HomeMember[] }>(
    `/api/v1/homes/${homeId}/members`,
  );
  return response.data;
}
