import { apiFetchBrowser } from "../client/fetch";
import type {
  AlarmDTO,
  AlarmCreateRequest,
  AlarmsQuery,
} from "../dto/alarm.dto";

export async function listHomeAlarms(homeId: number, query?: AlarmsQuery) {
  const params = new URLSearchParams();
  if (query?.from) params.append("from", query.from);
  if (query?.to) params.append("to", query.to);
  if (query?.status) params.append("status", query.status);
  if (query?.limit) params.append("limit", query.limit.toString());

  const url = `/api/v1/homes/${homeId}/alarms${params.toString() ? `?${params.toString()}` : ""}`;
  return apiFetchBrowser<{ data: AlarmDTO[] }>(url);
}

export async function createHomeAlarm(
  homeId: number,
  data: AlarmCreateRequest,
) {
  return apiFetchBrowser<{ data: AlarmDTO }>(`/api/v1/homes/${homeId}/alarms`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function acknowledgeAlarm(homeId: number, alarmId: number) {
  return apiFetchBrowser<{ data: AlarmDTO }>(
    `/api/v1/homes/${homeId}/alarms/${alarmId}/ack`,
    { method: "POST" },
  );
}

export async function resolveAlarm(homeId: number, alarmId: number) {
  return apiFetchBrowser<{ data: AlarmDTO }>(
    `/api/v1/homes/${homeId}/alarms/${alarmId}/resolve`,
    { method: "POST" },
  );
}

export async function getUnreadAlarmCount(): Promise<number> {
  try {
    const homesResponse = await apiFetchBrowser<{ data: any[] }>(
      "/api/v1/homes",
    );
    const homes = homesResponse.data || [];

    if (homes.length === 0) return 0;

    // Fetch semua alarm OPEN dari semua home secara paralel
    const alarmsResults = await Promise.all(
      homes.map((home) =>
        listHomeAlarms(home.id, { status: "OPEN" })
          .then((r) => r.data?.length || 0)
          .catch(() => 0),
      ),
    );

    return alarmsResults.reduce((sum, count) => sum + count, 0);
  } catch (error) {
    console.error("Failed to get unread alarm count:", error);
    return 0;
  }
}
