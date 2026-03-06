import { api } from "./client";
import type {
  EnergyUsageDaily,
  EnergyPrediction,
  EnergyFilters,
  EnergyStats,
} from "../types";

export const energyApi = {
  async getEnergyUsage(filters: EnergyFilters): Promise<EnergyUsageDaily[]> {
    const { data } = await api.get<EnergyUsageDaily[]>("/v1/energy/usage", {
      params: filters,
    });
    return data;
  },

  async getEnergyPredictions(
    deviceId: number,
    days = 7,
  ): Promise<EnergyPrediction[]> {
    const { data } = await api.get<EnergyPrediction[]>(
      `/v1/energy/predictions/${deviceId}`,
      { params: { days } },
    );
    return data;
  },

  async getEnergyStats(homeId?: number): Promise<EnergyStats> {
    const { data } = await api.get<EnergyStats>("/v1/energy/stats", {
      params: { homeId },
    });
    return data;
  },

  async getDailyUsage(
    homeId: number,
    startDate: string,
    endDate: string,
  ): Promise<EnergyUsageDaily[]> {
    const { data } = await api.get<EnergyUsageDaily[]>("/v1/energy/daily", {
      params: { homeId, startDate, endDate },
    });
    return data;
  },
};
