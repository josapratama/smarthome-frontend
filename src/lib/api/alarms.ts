import { apiFetchBrowser } from "./client.browser";
import type {
  AlarmDTO,
  AlarmCreateRequest,
  AlarmsQuery,
} from "./dto/alarm.dto";

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
    // Get all homes for the user
    const homesResponse = await apiFetchBrowser<{ data: any[] }>(
      "/api/v1/homes",
    );
    const homes = homesResponse.data || [];

    // Get unread alarms (OPEN status) from all homes
    let totalUnread = 0;
    for (const home of homes) {
      const alarmsResponse = await listHomeAlarms(home.id, { status: "OPEN" });
      totalUnread += alarmsResponse.data?.length || 0;
    }

    return totalUnread;
  } catch (error) {
    console.error("Failed to get unread alarm count:", error);
    return 0;
  }
}
