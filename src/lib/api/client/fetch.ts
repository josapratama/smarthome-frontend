/**
 * Browser-side API client for client components
 * Uses fetch with credentials for cookie-based auth
 */

import { config } from "../../config";

const API_BASE = config.publicBackendUrl;

interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

export async function apiFetchBrowser<T = any>(
  path: string,
  options: FetchOptions = {},
): Promise<T> {
  const { params, ...fetchOptions } = options;

  // Build URL with query params
  let url = path.startsWith("http") ? path : `${API_BASE}${path}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes("?") ? "&" : "?") + queryString;
    }
  }

  // Don't set Content-Type for FormData (browser will set it with boundary)
  const isFormData = fetchOptions.body instanceof FormData;

  const response = await fetch(url, {
    ...fetchOptions,
    credentials: "include", // Include cookies
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...fetchOptions.headers,
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({
      error: "UNKNOWN_ERROR",
      message: response.statusText,
    }));

    const msg = body?.message || body?.error || response.statusText;
    const err = new Error(msg);
    (err as any).status = response.status;
    (err as any).data = body;
    throw err;
  }

  return response.json();
}

// Convenience methods
export const browserApi = {
  get: <T = any>(path: string, params?: Record<string, any>) =>
    apiFetchBrowser<T>(path, { method: "GET", params }),

  post: <T = any>(path: string, body?: any) =>
    apiFetchBrowser<T>(path, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: <T = any>(path: string, body?: any) =>
    apiFetchBrowser<T>(path, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    }),

  patch: <T = any>(path: string, body?: any) =>
    apiFetchBrowser<T>(path, {
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T = any>(path: string) =>
    apiFetchBrowser<T>(path, { method: "DELETE" }),
};
