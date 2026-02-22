/**
 * Server-side utility to call upstream backend API
 * Used in Next.js API routes to proxy authentication requests
 */

const BACKEND_URL =
  process.env.BACKEND_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:3000";
const API_PREFIX = process.env.BACKEND_API_PREFIX || "/api/v1";

// Log configuration in development
if (process.env.NODE_ENV === "development") {
  console.log("Backend URL:", BACKEND_URL);
  console.log("API Prefix:", API_PREFIX);
}

interface LoginResponse {
  data: {
    accessToken: string;
    refreshToken: string;
    sessionId: number;
    user: {
      id: number;
      username: string;
      email: string;
      role: "USER" | "ADMIN";
      createdAt: string;
    };
  };
}

interface ErrorResponse {
  error: string;
  message?: string;
}

export const authUpstream = {
  async login(username: string, password: string) {
    const url = `${BACKEND_URL}${API_PREFIX}/login`;

    console.log("Calling backend login:", url);
    console.log("Request body:", { username, password: "***" });

    // Validate backend URL - only check if it's completely missing
    if (!BACKEND_URL) {
      console.error("BACKEND_BASE_URL not configured properly!");
      return {
        res: { ok: false, status: 500 } as Response,
        payload: {
          error: "CONFIGURATION_ERROR",
          message:
            "Backend URL not configured. Please set BACKEND_BASE_URL environment variable.",
        },
      };
    }

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      console.log("Backend response status:", res.status);
      console.log("Backend response ok:", res.ok);

      // Try to get response as text first
      const text = await res.text();
      console.log("Backend response text:", text.substring(0, 200));

      // Try to parse as JSON
      let payload: LoginResponse | ErrorResponse | null = null;
      try {
        payload = JSON.parse(text);
      } catch (err) {
        console.error("Failed to parse JSON, response was:", text);
        payload = {
          error: "INVALID_RESPONSE",
          message: `Backend returned non-JSON response: ${text.substring(0, 100)}`,
        };
      }

      console.log("Backend payload:", payload);

      return { res, payload };
    } catch (error) {
      console.error("Network error calling backend:", error);
      return {
        res: { ok: false, status: 500 } as Response,
        payload: { error: "NETWORK_ERROR", message: String(error) },
      };
    }
  },

  async refresh(sessionId: number, refreshToken: string) {
    const url = `${BACKEND_URL}${API_PREFIX}/refresh`;

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, refreshToken }),
      });

      const payload = await res.json().catch(() => null);

      return { res, payload: payload as LoginResponse | ErrorResponse };
    } catch (error) {
      return {
        res: { ok: false, status: 500 } as Response,
        payload: { error: "NETWORK_ERROR", message: String(error) },
      };
    }
  },

  async logout(sessionId: number) {
    const url = `${BACKEND_URL}${API_PREFIX}/logout`;

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });

      return { res };
    } catch (error) {
      return {
        res: { ok: false, status: 500 } as Response,
      };
    }
  },
};
