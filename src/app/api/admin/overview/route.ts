import { NextResponse } from "next/server";
import { ApiError } from "@/lib/api/errors";
import { backendFetch } from "@/lib/api/server/backend";

type BackendDashboardHome = {
  id: number;
  name: string;
  city: string | null;
  updatedAt: string;
  roleInHome: "OWNER" | "MEMBER" | string;
  devicesOnline: number;
  devicesOffline: number;
  openAlarms: number;
};

type BackendDashboardResponse = {
  data: {
    myHomesCount: number;
    pendingInvitesCount: number;
    homes: BackendDashboardHome[];
  };
};

export async function GET() {
  try {
    // backendFetch defaultnya ambil token dari cookie admin_token dan set Authorization
    const p = await backendFetch<BackendDashboardResponse>("/dashboard", {
      method: "GET",
    });

    const homes = Array.isArray(p?.data?.homes) ? p.data.homes : [];

    const onlineDevices = homes.reduce(
      (acc: number, h: BackendDashboardHome) => acc + (h.devicesOnline ?? 0),
      0,
    );
    const offlineDevices = homes.reduce(
      (acc: number, h: BackendDashboardHome) => acc + (h.devicesOffline ?? 0),
      0,
    );

    return NextResponse.json({
      users: 0,
      homes: p.data.myHomesCount ?? homes.length,
      devices: onlineDevices + offlineDevices,
      onlineDevices,
      offlineDevices,
      pendingInvitesCount: p.data.pendingInvitesCount ?? 0,
      homesList: homes,
    });
  } catch (e: unknown) {
    const error = e as ApiError;
    if (error.status && error.payload) {
      return NextResponse.json(
        error.payload ?? {
          message: error.message ?? "Failed to load overview",
        },
        { status: error.status },
      );
    }
    return NextResponse.json(
      { message: "Failed to load overview" },
      { status: 500 },
    );
  }
}
