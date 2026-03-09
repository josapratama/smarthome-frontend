import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { devicesApi } from "../api/services";

export function useDevices(homeId?: number) {
  return useQuery({
    queryKey: ["devices", homeId],
    queryFn: () => devicesApi.list(homeId),
  });
}

export function useDevice(id: number) {
  return useQuery({
    queryKey: ["device", id],
    queryFn: () => devicesApi.getById(id),
    enabled: !!id,
  });
}

export function useUpdateDevice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      deviceId,
      input,
    }: {
      deviceId: number;
      input: { name?: string; roomId?: number | null };
    }) => devicesApi.update(deviceId, input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["device", variables.deviceId],
      });
      queryClient.invalidateQueries({
        queryKey: ["devices"],
      });
    },
  });
}

export function useDeleteDevice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (deviceId: number) => devicesApi.delete(deviceId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["devices"],
      });
    },
  });
}
