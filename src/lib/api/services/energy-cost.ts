import { apiFetchBrowser } from "../client/fetch";

export interface EnergyCostSettings {
  id: number;
  homeId: number | null; // null = global default
  costPerKwh: number;
  currency: string;
  updatedAt: string;
  updatedBy: number;
}

export interface EnergyCostUpdateRequest {
  costPerKwh: number;
  currency?: string;
}

// Get energy cost for a specific home (falls back to global if not set)
export async function getEnergyCost(
  homeId?: number,
): Promise<EnergyCostSettings> {
  const url = homeId
    ? `/api/v1/energy-cost?homeId=${homeId}`
    : `/api/v1/energy-cost`;
  const response = await apiFetchBrowser<{ data: EnergyCostSettings }>(url);
  return response.data;
}

// Set energy cost for a specific home (owner only)
export async function setHomeEnergyCost(
  homeId: number,
  data: EnergyCostUpdateRequest,
): Promise<EnergyCostSettings> {
  const response = await apiFetchBrowser<{ data: EnergyCostSettings }>(
    `/api/v1/homes/${homeId}/energy-cost`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    },
  );
  return response.data;
}

// Remove home-specific energy cost (revert to global)
export async function removeHomeEnergyCost(homeId: number): Promise<void> {
  await apiFetchBrowser(`/api/v1/homes/${homeId}/energy-cost`, {
    method: "DELETE",
  });
}

// Admin: Set global default energy cost
export async function setGlobalEnergyCost(
  data: EnergyCostUpdateRequest,
): Promise<EnergyCostSettings> {
  const response = await apiFetchBrowser<{ data: EnergyCostSettings }>(
    `/api/v1/admin/energy-cost/global`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    },
  );
  return response.data;
}
