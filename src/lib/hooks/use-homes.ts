import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { homesApi, getHomes, getHomeMembers } from "../api/services";

export function useHomes() {
  return useQuery({
    queryKey: ["homes"],
    queryFn: () => getHomes(),
  });
}

export function useHome(homeId: number) {
  return useQuery({
    queryKey: ["home", homeId],
    queryFn: () => homesApi.getById(homeId),
    enabled: !!homeId,
  });
}

export function useHomeMembers(homeId: number) {
  return useQuery({
    queryKey: ["home", homeId, "members"],
    queryFn: () => getHomeMembers(homeId),
    enabled: !!homeId,
  });
}

export function useCreateHome() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: homesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["homes"] });
    },
  });
}

export function useUpdateHome() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      homeId,
      input,
    }: {
      homeId: number;
      input: Parameters<typeof homesApi.update>[1];
    }) => homesApi.update(homeId, input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["home", variables.homeId] });
      queryClient.invalidateQueries({ queryKey: ["homes"] });
    },
  });
}

export function useDeleteHome() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (homeId: number) => homesApi.delete(homeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["homes"] });
    },
  });
}
