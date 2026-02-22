import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/api/server/backend";
import { handleApiError } from "@/lib/api/server/error-handler";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await backendFetch("/api/v1/preferences", {
      method: "GET",
    });

    return NextResponse.json(data);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();

    const data = await backendFetch("/api/v1/preferences", {
      method: "PATCH",
      body: JSON.stringify(body),
    });

    return NextResponse.json(data);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();

    const data = await backendFetch("/api/v1/preferences", {
      method: "PUT",
      body: JSON.stringify(body),
    });

    return NextResponse.json(data);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE() {
  try {
    const data = await backendFetch("/api/v1/preferences", {
      method: "DELETE",
    });

    return NextResponse.json(data);
  } catch (error) {
    return handleApiError(error);
  }
}
