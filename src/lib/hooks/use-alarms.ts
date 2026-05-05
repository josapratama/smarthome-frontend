import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as alarmsApi from "../api/services";
import type { AlarmsQuery, AlarmCreateRequest } from "../api/dto/alarm.dto";

export function useHomeAlarms(homeId: number, query?: AlarmsQuery) {
  return useQuery({
    queryKey: ["alarms", homeId, query],
    queryFn: () => alarmsApi.listHomeAlarms(homeId, query),
    enabled: !!homeId,
  });
}

export function useAcknowledgeAlarm() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ homeId, alarmId }: { homeId: number; alarmId: number }) =>
      alarmsApi.acknowledgeAlarm(homeId, alarmId),
    onSuccess: (_, { homeId }) => {
      queryClient.invalidateQueries({ queryKey: ["alarms", homeId] });
    },
  });
}

export function useResolveAlarm() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ homeId, alarmId }: { homeId: number; alarmId: number }) =>
      alarmsApi.resolveAlarm(homeId, alarmId),
    onSuccess: (_, { homeId }) => {
      queryClient.invalidateQueries({ queryKey: ["alarms", homeId] });
    },
  });
}

export function useCreateHomeAlarm() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      homeId,
      data,
    }: {
      homeId: number;
      data: AlarmCreateRequest;
    }) => alarmsApi.createHomeAlarm(homeId, data),
    onSuccess: (_, { homeId }) => {
      queryClient.invalidateQueries({ queryKey: ["alarms", homeId] });
    },
  });
}
