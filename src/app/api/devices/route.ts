import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/api/server/backend";
import { handleApiError } from "@/lib/api/server/error-handler";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const sp = url.searchParams;

    // sanitize homeId
    const homeId = sp.get("homeId");
    if (!homeId || homeId === "NaN" || Number.isNaN(Number(homeId))) {
      sp.delete("homeId");
    }

    // sanitize status (backend cuma terima "true"/"false")
    const status = sp.get("status");
    if (status && status !== "true" && status !== "false") {
      sp.delete("status");
    }

    const qs = sp.toString();
    const path = qs ? `/devices?${qs}` : "/devices";

    const data = await backendFetch(
      path,
      { method: "GET" },
      { auth: "admin_cookie" },
    );

    return NextResponse.json(data);
  } catch (error) {
    return handleApiError(error);
  }
}
