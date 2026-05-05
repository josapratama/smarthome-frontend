import { apiFetchBrowser } from "../client/fetch";

export interface PLNTariff {
  key: string;
  golongan: string;
  daya: string;
  tarif: number; // 0 = belum ditentukan admin
  description: string;
}

export interface HomeTariff {
  homeId: number;
  homeName: string;
  selectedTariffKey: string | null;
  tariff: PLNTariff | null;
  costPerKwh: number;
}

export interface EnergyCostSettings {
  id: number;
  homeId: number | null;
  costPerKwh: number;
  currency: string;
  updatedAt: string;
  updatedBy: number;
}

// ─── Admin APIs ───────────────────────────────────────────────────────────────

export async function adminGetTariffs(): Promise<PLNTariff[]> {
  const res = await apiFetchBrowser<{ data: PLNTariff[] }>(
    "/api/v1/admin/energy-cost/tariffs",
  );
  return res.data;
}

export async function adminSetTariff(
  key: string,
  tarif: number,
): Promise<PLNTariff[]> {
  const res = await apiFetchBrowser<{ data: PLNTariff[] }>(
    `/api/v1/admin/energy-cost/tariffs/${key}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tarif }),
    },
  );
  return res.data;
}

export async function adminGetHomeTariffs(): Promise<HomeTariff[]> {
  const res = await apiFetchBrowser<{ data: HomeTariff[] }>(
    "/api/v1/admin/energy-cost/homes",
  );
  return res.data;
}

export async function adminSetHomeTariff(
  homeId: number,
  tariffKey: string,
): Promise<void> {
  await apiFetchBrowser(`/api/v1/admin/energy-cost/homes/${homeId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tariffKey }),
  });
}

export async function adminDeleteHomeTariff(homeId: number): Promise<void> {
  await apiFetchBrowser(`/api/v1/admin/energy-cost/homes/${homeId}`, {
    method: "DELETE",
  });
}

// ─── User/Home APIs ───────────────────────────────────────────────────────────

export async function getHomeTariff(homeId: number): Promise<HomeTariff> {
  const res = await apiFetchBrowser<{ data: HomeTariff }>(
    `/api/v1/homes/${homeId}/tariff`,
  );
  return res.data;
}

export async function setHomeTariff(
  homeId: number,
  tariffKey: string,
): Promise<void> {
  await apiFetchBrowser(`/api/v1/homes/${homeId}/tariff`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tariffKey }),
  });
}

export async function removeHomeTariff(homeId: number): Promise<void> {
  await apiFetchBrowser(`/api/v1/homes/${homeId}/tariff`, {
    method: "DELETE",
  });
}

// Legacy — kept for backward compat with energy stats
export async function getEnergyCost(
  homeId?: number,
): Promise<EnergyCostSettings> {
  const url = homeId
    ? `/api/v1/energy-cost?homeId=${homeId}`
    : `/api/v1/energy-cost`;
  const response = await apiFetchBrowser<{ data: EnergyCostSettings }>(url);
  return response.data;
}

export async function setGlobalEnergyCost(data: {
  costPerKwh: number;
}): Promise<void> {
  // No-op — global cost no longer exists, kept for compat
}

export async function setHomeEnergyCost(
  homeId: number,
  data: { costPerKwh: number },
): Promise<void> {
  // No-op — use setHomeTariff instead
}

export async function removeHomeEnergyCost(homeId: number): Promise<void> {
  await removeHomeTariff(homeId);
}
