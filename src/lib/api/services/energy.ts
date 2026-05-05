import { apiFetchBrowser } from "../client/fetch";
import type {
  EnergyUsageDaily,
  EnergyPrediction,
  EnergyFilters,
  EnergyStats,
} from "../types";

export const energyApi = {
  async getEnergyUsage(filters: EnergyFilters): Promise<EnergyUsageDaily[]> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== null) params.append(k, String(v));
    });
    const res = await apiFetchBrowser<EnergyUsageDaily[]>(
      `/api/v1/energy/usage?${params.toString()}`,
    );
    return res;
  },

  async getEnergyPredictions(
    deviceId: number,
    days = 7,
  ): Promise<EnergyPrediction[]> {
    const res = await apiFetchBrowser<EnergyPrediction[]>(
      `/api/v1/energy/predictions/${deviceId}?days=${days}`,
    );
    return res;
  },

  async getEnergyStats(homeId?: number): Promise<EnergyStats> {
    const url = homeId
      ? `/api/v1/energy/stats?homeId=${homeId}`
      : "/api/v1/energy/stats";
    const res = await apiFetchBrowser<EnergyStats>(url);
    return res;
  },

  async getDailyUsage(
    homeId: number,
    startDate: string,
    endDate: string,
  ): Promise<EnergyUsageDaily[]> {
    const res = await apiFetchBrowser<EnergyUsageDaily[]>(
      `/api/v1/energy/daily?homeId=${homeId}&startDate=${startDate}&endDate=${endDate}`,
    );
    return res;
  },
};
