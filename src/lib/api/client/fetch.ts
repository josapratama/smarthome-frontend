/**
 * Browser-side API client for client components
 *
 * All /api/v1/* calls are routed through Next.js proxy (/api/proxy/*)
 * so httpOnly cookies are forwarded server-side as Authorization header.
 * This avoids cross-origin cookie issues when backend is on a different host.
 */

import { config } from "../../config";

interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

/**
 * Rewrite /api/v1/... → /api/proxy/... so the request goes through
 * the Next.js proxy route which reads the httpOnly access_token cookie.
 * Absolute URLs (http://...) are passed through unchanged.
 */
function resolveUrl(path: string): string {
  if (path.startsWith("http")) return path;

  // /api/v1/devices → /api/proxy/devices
  if (path.startsWith("/api/v1/")) {
    return path.replace("/api/v1/", "/api/proxy/");
  }

  // Already a Next.js route (e.g. /api/auth/login) — use as-is
  if (path.startsWith("/api/")) {
    return path;
  }

  // Fallback: direct to backend (legacy)
  return `${config.publicBackendUrl}${path}`;
}

export async function apiFetchBrowser<T = any>(
  path: string,
  options: FetchOptions = {},
): Promise<T> {
  const { params, ...fetchOptions } = options;

  let url = resolveUrl(path);

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

  const isFormData = fetchOptions.body instanceof FormData;

  const response = await fetch(url, {
    ...fetchOptions,
    credentials: "include",
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
