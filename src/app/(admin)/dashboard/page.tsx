import { ApiError } from "@/lib/api/errors";
import { backendFetch } from "@/lib/api/server/backend";
import type {
  OverviewDTO,
  DashboardResponse,
} from "@/lib/api/dto/overview.dto";
import DashboardClient from "./ui";

async function getOverview(): Promise<OverviewDTO> {
  // Call the backend overview/dashboard endpoint
  const response = await backendFetch<DashboardResponse>("/api/v1/dashboard");

  const homes = Array.isArray(response?.data?.homes) ? response.data.homes : [];
  const onlineDevices = homes.reduce(
    (acc: number, h) => acc + (h.devicesOnline ?? 0),
    0,
  );
  const offlineDevices = homes.reduce(
    (acc: number, h) => acc + (h.devicesOffline ?? 0),
    0,
  );

  return {
    users: 0,
    homes: response.data.myHomesCount ?? homes.length,
    devices: onlineDevices + offlineDevices,
    onlineDevices,
    offlineDevices,
    pendingInvitesCount: response.data.pendingInvitesCount ?? 0,
    homesList: homes,
  };
}

export default async function DashboardPage() {
  let data: OverviewDTO | null = null;
  let error: { status?: number; payload?: unknown } | null = null;

  try {
    data = await getOverview();
  } catch (e: unknown) {
    if (e instanceof ApiError) {
      error = { status: e.status, payload: e.payload };
    } else {
      error = {};
    }
  }

  return (
    <DashboardClient
      data={error ? undefined : (data ?? undefined)}
      error={error ?? undefined}
    />
  );
}
