"use client";

import { useEffect, useRef } from "react";
import { apiClient } from "@/lib/api/client/axios";

/**
 * Fetches the access token from the server (via httpOnly cookie)
 * and sets it on the axios client so all API calls include Authorization header.
 *
 * Must be rendered inside the admin/user layout on the client side.
 */
export function TokenInitializer() {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const initToken = async () => {
      try {
        const res = await fetch("/api/auth/token");
        if (!res.ok) return;
        const { accessToken } = await res.json();
        if (accessToken) {
          apiClient.setAccessToken(accessToken);
        }
      } catch {
        // Silently fail — axios interceptor will retry via refresh token
      }
    };

    initToken();
  }, []);

  return null;
}
