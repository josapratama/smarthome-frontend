/**
 * Server-side error handler for API routes
 * Converts errors to proper HTTP responses
 */

import { NextResponse } from "next/server";

interface ApiError {
  status?: number;
  error?: string;
  message?: string;
}

export function handleApiError(error: unknown): NextResponse {
  console.error("API Error:", error);

  if (typeof error === "object" && error !== null) {
    const apiError = error as ApiError;

    return NextResponse.json(
      {
        error: apiError.error || "INTERNAL_ERROR",
        message: apiError.message || "An unexpected error occurred",
      },
      { status: apiError.status || 500 },
    );
  }

  return NextResponse.json(
    {
      error: "INTERNAL_ERROR",
      message: String(error),
    },
    { status: 500 },
  );
}
