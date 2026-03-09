/**
 * Server-side utility to call upstream backend API without authentication
 * Used for public endpoints like forgot-password, reset-password
 */

import { config } from "@/lib/config";

export async function upstreamFetch<T = any>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const url = `${config.backendUrl}${config.apiPrefix}${path}`;

  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      error: "UNKNOWN_ERROR",
      message: response.statusText,
    }));

    throw {
      status: response.status,
      ...error,
    };
  }

  return response.json();
}
