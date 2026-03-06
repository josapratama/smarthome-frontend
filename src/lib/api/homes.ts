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

export async function getHomes(): Promise<Home[]> {
  const response = await apiFetchBrowser<{ data: { homes: Home[] } }>(
    "/api/v1/homes",
  );
  return response.data.homes;
}
