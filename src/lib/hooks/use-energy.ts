import { useQuery } from "@tanstack/react-query";
import type { EnergyFilters } from "../types";
import { energyApi } from "../api/services";

export function useEnergyUsage(filters: EnergyFilters) {
  return useQuery({
    queryKey: ["energy", filters],
    queryFn: () => energyApi.getEnergyUsage(filters),
  });
}

export function useEnergyPredictions(deviceId: number, days = 7) {
  return useQuery({
    queryKey: ["energy", deviceId, "predictions", days],
    queryFn: () => energyApi.getEnergyPredictions(deviceId, days),
    enabled: !!deviceId,
  });
}

export function useEnergyStats(homeId?: number) {
  return useQuery({
    queryKey: ["energy", "stats", homeId],
    queryFn: () => energyApi.getEnergyStats(homeId),
  });
}

export function useDailyEnergyUsage(
  homeId: number,
  startDate: string,
  endDate: string,
) {
  return useQuery({
    queryKey: ["energy", "daily", homeId, startDate, endDate],
    queryFn: () => energyApi.getDailyUsage(homeId, startDate, endDate),
    enabled: !!homeId && !!startDate && !!endDate,
  });
}
