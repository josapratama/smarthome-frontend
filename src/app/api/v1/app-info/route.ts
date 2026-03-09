import { NextResponse } from "next/server";
import { getApiUrl } from "@/lib/config";

export async function GET() {
  try {
    const res = await fetch(getApiUrl("/app-info"));
    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("[App Info] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
