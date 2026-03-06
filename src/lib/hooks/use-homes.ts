import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as homesApi from "../api/homes";

export function useHomes() {
  return useQuery({
    queryKey: ["homes"],
    queryFn: () => homesApi.getHomes(),
  });
}

export function useHomeMembers(homeId: number) {
  return useQuery({
    queryKey: ["home", homeId, "members"],
    queryFn: () => homesApi.getHomeMembers(homeId),
    enabled: !!homeId,
  });
}
