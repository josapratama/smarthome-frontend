/**
 * Server-side utility to call backend API with authentication
 * Used in Next.js API routes to proxy authenticated requests
 */

import { getAccessToken } from "./auth-cookies";
import { config } from "@/lib/config";

interface FetchOptions extends RequestInit {
  auth?: "admin_cookie" | "none";
}

export async function backendFetch<T = any>(
  path: string,
  init: RequestInit = {},
  options: FetchOptions = {},
): Promise<T> {
  const { auth = "admin_cookie", ...fetchInit } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string>),
  };

  // Add authorization if needed
  if (auth === "admin_cookie") {
    const token = await getAccessToken();
    console.log(`[BACKEND_FETCH] ${path} - Token present:`, !!token);
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
      console.log(`[BACKEND_FETCH] ${path} - Authorization header set`);
    } else {
      console.log(`[BACKEND_FETCH] ${path} - No token found in cookies`);
    }
  }

  const url = path.startsWith("http") ? path : `${config.backendUrl}${path}`;
  console.log(`[BACKEND_FETCH] Calling: ${url}`);

  const response = await fetch(url, {
    ...fetchInit,
    ...init,
    headers,
  });

  console.log(`[BACKEND_FETCH] ${path} - Response status:`, response.status);

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      error: "UNKNOWN_ERROR",
      message: response.statusText,
    }));

    console.log(`[BACKEND_FETCH] ${path} - Error:`, error);

    throw {
      status: response.status,
      ...error,
    };
  }

  return response.json();
}

export async function backendUpload<T = any>(
  path: string,
  formData: FormData,
  options: FetchOptions = {},
): Promise<T> {
  const { auth = "admin_cookie", ...fetchInit } = options;

  const headers: Record<string, string> = {
    ...(fetchInit.headers as Record<string, string>),
  };

  // Add authorization if needed
  if (auth === "admin_cookie") {
    const token = await getAccessToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const url = path.startsWith("http") ? path : `${config.backendUrl}${path}`;

  const response = await fetch(url, {
    method: "POST",
    ...fetchInit,
    headers,
    body: formData,
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
